chrome.runtime.onInstalled.addListener(syncRules);
chrome.runtime.onStartup.addListener(syncRules);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.blockedSites || changes.isEnabled)) {
    syncRules();
  }
});

async function syncRules() {
  const { blockedSites = [], isEnabled = true } = await chrome.storage.local.get([
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
