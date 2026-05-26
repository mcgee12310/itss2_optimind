let blockedSites = [];
let isEnabled = true;

async function load() {
  const data = await chrome.storage.local.get(['blockedSites', 'isEnabled']);
  blockedSites = data.blockedSites || [];
  isEnabled = data.isEnabled !== false;

  document.getElementById('enable-toggle').checked = isEnabled;
  updateStatus();
  render();
}

function render() {
  const list = document.getElementById('site-list');
  document.getElementById('count').textContent = blockedSites.length;

  if (blockedSites.length === 0) {
    list.innerHTML = '<div class="empty">Chưa có trang nào bị chặn</div>';
  } else {
    list.innerHTML = blockedSites
      .map(
        (site, i) => `
        <div class="site-item">
          <span class="site-name">${site}</span>
          <button class="remove-btn" data-index="${i}" title="Xoá">×</button>
        </div>
      `
      )
      .join('');

    list.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => removeSite(Number(btn.dataset.index)));
    });
  }

  updateChips();
}

function updateChips() {
  document.querySelectorAll('.chip').forEach((chip) => {
    const site = chip.dataset.site;
    chip.classList.toggle('added', blockedSites.includes(site));
  });
}

function updateStatus() {
  const bar = document.getElementById('status-bar');
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  const label = document.getElementById('toggle-label');

  if (isEnabled) {
    bar.className = 'status-bar';
    dot.className = 'dot';
    text.textContent = 'Đang bảo vệ phiên học của bạn';
    label.textContent = 'BẬT';
  } else {
    bar.className = 'status-bar disabled';
    dot.className = 'dot disabled';
    text.textContent = 'Tạm dừng – chặn web đang tắt';
    label.textContent = 'TẮT';
  }
}

function normalizeDomain(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0];
}

async function addSite(site) {
  if (!site || blockedSites.includes(site)) return;
  blockedSites.push(site);
  await persist();
}

async function removeSite(i) {
  blockedSites.splice(i, 1);
  await persist();
}

async function persist() {
  await chrome.storage.local.set({ blockedSites, isEnabled });
  render();
}

// ── Event listeners ──

document.getElementById('add-btn').addEventListener('click', async () => {
  const input = document.getElementById('site-input');
  const site = normalizeDomain(input.value);
  if (site) {
    await addSite(site);
    input.value = '';
  } else {
    input.select();
  }
});

document.getElementById('site-input').addEventListener('keypress', async (e) => {
  if (e.key !== 'Enter') return;
  const input = e.currentTarget;
  const site = normalizeDomain(input.value);
  if (site) {
    await addSite(site);
    input.value = '';
  }
});

document.getElementById('enable-toggle').addEventListener('change', async (e) => {
  isEnabled = e.target.checked;
  updateStatus();
  await chrome.storage.local.set({ isEnabled });
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', async () => {
    const site = chip.dataset.site;
    if (blockedSites.includes(site)) {
      blockedSites.splice(blockedSites.indexOf(site), 1);
    } else {
      blockedSites.push(site);
    }
    await persist();
  });
});

load();
