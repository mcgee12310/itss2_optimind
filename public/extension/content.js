// Bridge: OptiMind web app <-> extension storage
console.log('[OptiMind Blocker] content script loaded on', location.href);

// ── Khi OptiMind mở: luôn bắt đầu ở trạng thái chưa chặn ──
chrome.storage.local.set({ isEnabled: false });

// Giữ kết nối dài hạn với background.
// Khi tab bị đóng / navigate đi, port tự động disconnect
// → background nhận onDisconnect và reset ngay lập tức.
chrome.runtime.connect({ name: 'optimind-tab' });

function pushStateToPage(overrides) {
  chrome.storage.local.get(['blockedSites', 'isEnabled'], (data) => {
    window.dispatchEvent(
      new CustomEvent('optimind:extensionState', {
        detail: {
          installed: true,
          blockedSites: data.blockedSites || [],
          isEnabled: data.isEnabled === true,
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
  if (changes.isEnabled !== undefined) overrides.isEnabled = changes.isEnabled.newValue === true;
  pushStateToPage(overrides);
});

// Announce presence
pushStateToPage({ isEnabled: false });
