import { test, expect } from '@playwright/test';

function parseTranslate(transform) {
  // transform is typically: translate(x,y) or translate(x y)
  if (!transform) return null;
  const m = String(transform).match(/translate\(([-\d.]+)[,\s]+([-\d.]+)\)/);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

test.describe('graph-display task-management template', () => {
  test('dependency link opens target modal, keeps selection after close, and clears on background click', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=task-management&skipTour=true', { waitUntil: 'domcontentloaded' });

    const nodes = page.locator('#graph-container g.node');
    await expect.poll(async () => nodes.count(), { timeout: 15000 }).toBeGreaterThan(10);

    const candidate = await page.evaluate(() => {
      const graph = window.graphInstance;
      if (!graph || !graph.details) return null;
      for (const [sourceId, details] of Object.entries(graph.details)) {
        const items = Array.isArray(details && details.items) ? details.items : [];
        const joined = items.join(' ');
        const match = joined.match(/class="task-node-btn"[^>]*data-node-id="([^"]+)"/);
        if (match) {
          return {
            sourceId,
            targetId: match[1],
            targetTitle: (graph.details && graph.details[match[1]] && graph.details[match[1]].title) || ''
          };
        }
      }
      return null;
    });

    expect(candidate).toBeTruthy();
    expect(candidate.sourceId).toBeTruthy();
    expect(candidate.targetId).toBeTruthy();

    const sourceNode = page.locator(`#graph-container g.node[data-id="${candidate.sourceId}"]`);
    await expect(sourceNode).toBeVisible();
    await sourceNode.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });

    const popup = page.locator('#popup');
    await expect(popup).toHaveClass(/visible/);

    const depButton = page.locator(`#popup .task-node-btn[data-node-id="${candidate.targetId}"]`).first();
    await expect(depButton).toBeVisible();
    await depButton.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });

    const targetNode = page.locator(`#graph-container g.node[data-id="${candidate.targetId}"]`);
    if (candidate.targetTitle) {
      await expect.poll(async () => popup.locator('h2').textContent(), { timeout: 10000 }).toContain(candidate.targetTitle);
    }
    await expect(targetNode).toHaveClass(/details-shown-for/, { timeout: 10000 });
    await expect(popup).toHaveClass(/visible/);

    await page.locator('#popup .close-button').click();
    await expect(popup).not.toHaveClass(/visible/);
    await expect(targetNode).toHaveClass(/details-shown-for/);

    await page.locator('#graph-container svg').click({ position: { x: 8, y: 8 } });
    await expect(targetNode).not.toHaveClass(/details-shown-for/);
  });

  test('renders dependency links with visible strokes', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=task-management', { waitUntil: 'domcontentloaded' });

    // Wait until nodes render
    const nodes = page.locator('#graph-container g.node');
    await expect.poll(async () => nodes.count(), { timeout: 15000 }).toBeGreaterThan(10);

    // Ensure at least some dependency links exist and are visible
    const dependsLinks = page.locator('#graph-container line.link[data-type^="DEPENDS_"]');
    await expect.poll(async () => dependsLinks.count(), { timeout: 15000 }).toBeGreaterThan(5);

    const sample = dependsLinks.first();
    await expect(sample).toBeVisible();

    const stroke = await sample.evaluate((el) => getComputedStyle(el).stroke);
    expect(stroke).toBeTruthy();
    expect(String(stroke).toLowerCase()).not.toContain('none');
  });

  test('enforces clear layer distribution: Start=layer0 only, End=final layer only, tasks layered by dependencies', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=task-management', { waitUntil: 'domcontentloaded' });

    // Give the simulation a moment to settle into layer bands
    await page.waitForTimeout(2500);

    const result = await page.evaluate(() => {
      const nodeEls = Array.from(document.querySelectorAll('#graph-container g.node'));
      const linkEls = Array.from(document.querySelectorAll('#graph-container line.link'));

      const getLayer = (el) => {
        const cls = Array.from(el.classList);
        const layerClass = cls.find(c => c.startsWith('layer-'));
        return layerClass ? Number(layerClass.replace('layer-', '')) : null;
      };

      const getId = (el) => el.getAttribute('data-id') || '';
      const getY = (el) => {
        const t = el.getAttribute('transform') || '';
        const m = t.match(/translate\(([-\d.]+)[,\s]+([-\d.]+)\)/);
        return m ? Number(m[2]) : NaN;
      };

      const nodes = nodeEls
        .map(el => ({ id: getId(el), layer: getLayer(el), y: getY(el) }))
        .filter(n => n.id && Number.isFinite(n.layer) && Number.isFinite(n.y));

      const byId = new Map(nodes.map(n => [n.id, n]));
      const layers = Array.from(new Set(nodes.map(n => n.layer))).sort((a, b) => a - b);
      const lastLayer = layers[layers.length - 1];

      const idsInLayer = (layer) => nodes.filter(n => n.layer === layer).map(n => n.id);

      const startNode = byId.get('project-start') || null;
      const endNode = byId.get('project-end') || null;

      const dependencyEdges = [];
      for (const el of linkEls) {
        const type = el.getAttribute('data-type') || '';
        if (!type.startsWith('DEPENDS_')) continue;
        const d = el.__data__;
        const sourceId = (d && typeof d.source === 'object') ? d.source.id : d?.source;
        const targetId = (d && typeof d.target === 'object') ? d.target.id : d?.target;
        if (!sourceId || !targetId) continue;
        dependencyEdges.push({ type, sourceId, targetId });
      }

      const edgeChecks = dependencyEdges.map(e => {
        const s = byId.get(e.sourceId);
        const t = byId.get(e.targetId);
        if (!s || !t) return { ok: false, reason: 'missing-node', edge: e };
        const layerOk = t.layer >= s.layer;
        // Allow slight visual overlaps while still enforcing "downward" flow.
        const yOk = t.y >= s.y - 15;
        return { ok: layerOk && yOk, layerOk, yOk, s, t, edge: e };
      });

      return {
        layers,
        lastLayer,
        layer0Ids: idsInLayer(0),
        lastLayerIds: idsInLayer(lastLayer),
        startNode,
        endNode,
        nodesCount: nodes.length,
        dependencyEdgeCount: dependencyEdges.length,
        failingEdges: edgeChecks.filter(c => !c.ok).slice(0, 5)
      };
    });

    expect(result.nodesCount).toBeGreaterThan(10);
    expect(result.dependencyEdgeCount).toBeGreaterThan(5);

    expect(result.layers[0]).toBe(0);
    expect(result.layer0Ids).toEqual(['project-start']);
    expect(result.lastLayerIds).toEqual(['project-end']);

    // Start should be near the top, End near the bottom
    expect(result.startNode).toBeTruthy();
    expect(result.endNode).toBeTruthy();
    expect(result.endNode.y).toBeGreaterThan(result.startNode.y);

    // Every dependency link should go forward by layer (and generally downward by Y)
    expect(result.failingEdges).toEqual([]);
  });

  test('shows descriptive project end details for task graphs', async ({ page }) => {
    await page.goto('/graph-display/index.html?template=github-task-manager-tasks&skipTour=true', { waitUntil: 'domcontentloaded' });

    const endNode = page.locator('#graph-container g.node[data-id="project-end"]');
    await expect(endNode).toBeVisible({ timeout: 20000 });
    await endNode.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });

    const popup = page.locator('#popup');
    await expect(popup).toHaveClass(/visible/);
    await expect(popup).toContainText('Terminal tasks captured here');
    await expect(popup).toContainText('What happens next');
  });
});
