// Bridge: OptiMind web app <-> extension storage
console.log('[OptiMind Blocker] content script loaded on', location.href);

function pushStateToPage(overrides) {
  chrome.storage.local.get(['blockedSites', 'isEnabled'], (data) => {
    window.dispatchEvent(
      new CustomEvent('optimind:extensionState', {
        detail: {
          installed: true,
          blockedSites: data.blockedSites || [],
          isEnabled: data.isEnabled !== false,
          ...overrides,
        },
      })
    );
  });
}

// Page → Extension
window.addEventListener('optimind:setBlockedSites', (e) => {
  chrome.storage.local.set({ blockedSites: e.detail.sites });
});

window.addEventListener('optimind:setEnabled', (e) => {
  chrome.storage.local.set({ isEnabled: e.detail.enabled });
});

window.addEventListener('optimind:getState', () => {
  pushStateToPage();
});

// Extension storage changed → push to page
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const overrides = {};
  if (changes.blockedSites) overrides.blockedSites = changes.blockedSites.newValue ?? [];
  if (changes.isEnabled) overrides.isEnabled = changes.isEnabled.newValue ?? true;
  pushStateToPage(overrides);
});

// Announce presence immediately on load
pushStateToPage();

