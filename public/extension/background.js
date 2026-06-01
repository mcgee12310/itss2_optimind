// ── Port-based tab tracking ───────────────────────────────────────────────────
// When the OptiMind tab closes (or navigates away), the port auto-disconnects
// and onDisconnect fires here — no tab-ID tracking, no memory state needed.

function resetBlocker() {
  chrome.storage.local.set({ isEnabled: false, blockedSites: [] });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'optimind-tab') return;
  console.log('[OptiMind BG] OptiMind tab connected, tab', port.sender?.tab?.id);

  port.onDisconnect.addListener(() => {
    console.log('[OptiMind BG] OptiMind tab disconnected — resetting blocker');
    resetBlocker();
  });
});

// ── Sync declarativeNetRequest rules whenever storage changes ─────────────────

chrome.runtime.onInstalled.addListener(syncRules);
chrome.runtime.onStartup.addListener(syncRules);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.blockedSites || changes.isEnabled)) {
    syncRules();
  }
});

async function syncRules() {
  const { blockedSites = [], isEnabled = false } = await chrome.storage.local.get([
    'blockedSites',
    'isEnabled',
  ]);

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules = isEnabled
    ? blockedSites.map((site, i) => ({
        id: i + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: `/blocked.html?site=${encodeURIComponent(site)}`,
          },
        },
        condition: {
          requestDomains: [site],
          resourceTypes: ['main_frame'],
        },
      }))
    : [];

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}
