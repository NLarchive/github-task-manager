/**
 * Generates/returns walkthrough steps for different templates.
 * - If a template provides `meta.walkthroughSteps` (array), use that.
 * - Otherwise generate sensible steps from nodes/details for known template types.
 * - Supports nodes with `tourMarker` property to surface custom steps.
 */

export function getStepsForTemplate(templateId, nodes = [], details = {}, meta = {}) {
  // Use explicit meta steps if provided
  if (Array.isArray(meta?.walkthroughSteps) && meta.walkthroughSteps.length) {
    return meta.walkthroughSteps;
  }

  // Helper to build a step from a node id
  const nodeStep = (nodeId, title, content, opts = {}) => ({ nodeId, title, content, position: opts.position || 'bottom', focus: true, hoverNode: !!opts.hoverNode, clickNode: !!opts.clickNode, target: opts.target });

  // If nodes include explicit tour markers, use them (preserve order they appear)
  const markerSteps = [];
  for (const n of nodes) {
    if (n && (n.tourMarker === true || n.tourStep)) {
      const det = details[n.id] || {};
      const title = (n.tourStep && n.tourStep.title) || det.title || n.label || n.id;
      const content = (n.tourStep && n.tourStep.content) || det.items?.[0] || n.tourStep?.content || ''; // Short snippet
      const step = { nodeId: n.id, title, content, position: n.tourStep?.position || 'bottom', focus: true, hoverNode: true };
      markerSteps.push(step);
    }
  }
  if (markerSteps.length) return markerSteps;

  // Default generators for known templates
  if (templateId === 'task-management') {
    // Find some representative nodes
    const start = nodes.find(n => n.templateType === 'project-start' || n.id === 'project-start');
    const end = nodes.find(n => n.templateType === 'project-end' || n.id === 'project-end');

    // Critical/high priority sample tasks
    const criticals = nodes.filter(n => n.priority === 'Critical').slice(0, 2);
    const sampleTask = nodes.find(n => n.templateType === 'task');
    const dependencyGraphTask = nodes.find(n => (n.label && /Dependency graph/i.test(n.label)) || (n.id && n.id.includes('task-13')));

    const steps = [
      { title: 'Welcome to Project View', content: 'This view visualizes tasks as layers computed from dependencies. Color shows priority; size indicates estimated hours.', position: 'center-bottom' },
      start ? nodeStep(start.id, `Project Start: ${start.label}`, 'The project start anchors layer 1 tasks.') : { title: 'Project Start', content: 'Layer 1 tasks have no prerequisites.' },
      { title: 'Dependency Layers', content: 'Tasks are layered by dependency depth. Use this view to understand critical paths and blockers.', position: 'center-bottom', focus: false },
    ];

    if (criticals && criticals.length) {
      steps.push(...criticals.map(c => nodeStep(c.id, `Critical Task: ${c.label}`, `Priority: ${c.priority}`, { hoverNode: true, clickNode: true })));
    }

    if (dependencyGraphTask) steps.push(nodeStep(dependencyGraphTask.id, dependencyGraphTask.label, 'This task is about rendering the dependency graph (UI).', { clickNode: true }));

    if (end) steps.push(nodeStep(end.id, `Project Milestone: ${end.label}`, 'Terminal tasks flow into this milestone.'));

    steps.push({ title: 'Explore & Filter', content: 'Use the menu to search, filter by priority, or export views.', target: '#menu-panel', position: 'bottom-left' });

    return steps;
  }

  // Fallback: richer career tour than before
  if (templateId === 'career' || !templateId) {
    const profile = nodes.find(n => n.id === (meta?.profileNodeId || 'profile'));
    const foundations = nodes.find(n => n.id === 'education' || n.id === 'experience');
    const skills = nodes.find(n => n.id === meta?.coreNodeId || 'core-expertise');
    const impact = nodes.find(n => n.id === 'business-impact');
    const outcomes = nodes.find(n => n.id === 'positive-outcome');

    const steps = [
      { title: 'Welcome!', content: 'This interactive graph is a template for showing your career journey.', position: 'center-bottom' },
      profile ? nodeStep(profile.id, 'Profile', 'Start here to view summary and links.', { hoverNode: false, clickNode: true }) : { title: 'Profile', content: 'Profile node is the top of the graph.' },
      foundations ? nodeStep('experience', 'Foundations', 'Education, experience, and community form the foundations.') : { title: 'Foundations', content: 'Foundation nodes show origins.' },
      skills ? nodeStep(skills.id, 'Core Expertise & Skills', 'Highlight what you are good at and how it connects to outcomes.') : { title: 'Skills', content: 'Skills nodes show your expertise.' },
      impact ? nodeStep(impact.id, 'Impact', 'Concrete examples of work that produced change.') : { title: 'Impact', content: 'Impact shows measurable results.' },
      outcomes ? nodeStep(outcomes.id, 'Outcomes', 'The results your impact led to.') : { title: 'Outcomes', content: 'Outcomes are the end results.' },
      { title: 'Controls & Search', content: 'Use the Menu for Search, Legend, and CV export.', target: '#menu-panel', position: 'bottom-left' },
      { title: 'Start Exploring', content: 'Customize data in js/graph-data.js and re-run to see changes.' }
    ];

    return steps;
  }

  // Last-resort empty array
  return [];
}

function resolveTourUrl(path, basePath) {
  const p = String(path || '').trim();
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('/')) return p;
  // basePath is typically '/graph-display/'
  return `${basePath || './'}${p.replace(/^\.\//, '')}`;
}

/**
 * Resolve steps for a template.
 * Priority:
 * 1) meta.walkthroughSteps (inline)
 * 2) meta.walkthroughStepsPath (JSON file)
 * 3) Generated steps (getStepsForTemplate)
 */
export async function resolveStepsForTemplate(templateId, nodes = [], details = {}, meta = {}, basePath = './') {
  if (Array.isArray(meta?.walkthroughSteps) && meta.walkthroughSteps.length) {
    return meta.walkthroughSteps;
  }

  const stepsUrl = resolveTourUrl(meta?.walkthroughStepsPath, basePath);
  if (stepsUrl) {
    try {
      const res = await fetch(stepsUrl, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) return json;
        console.warn('Tour JSON is not an array:', stepsUrl);
      } else {
        console.warn('Failed to fetch tour steps:', stepsUrl, res.status);
      }
    } catch (e) {
      console.warn('Error fetching tour steps:', stepsUrl, e && e.message);
    }
  }

  return getStepsForTemplate(templateId, nodes, details, meta);
}
