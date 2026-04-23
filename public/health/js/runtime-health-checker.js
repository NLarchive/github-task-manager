/**
 * Lightweight runtime diagnostics for the standalone health page.
 *
 * The script stamps the current URL and load time so operators can confirm the
 * deployed route and browser runtime without coupling the page to app state.
 */

document.addEventListener('DOMContentLoaded', () => {
    const runtimeUrl = document.getElementById('healthRuntimeUrl');
    const runtimeTimestamp = document.getElementById('healthRuntimeTimestamp');

    if (runtimeUrl) {
        runtimeUrl.textContent = window.location.href;
    }

    if (runtimeTimestamp) {
        runtimeTimestamp.textContent = new Date().toLocaleString();
    }

    console.log('GitHub Task Manager health page loaded');
    console.log('Location:', window.location.href);
});
