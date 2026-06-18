/* ===================== 公共逻辑：会话、导航、通用渲染 ===================== */

// ---------- 会话管理 ----------
function getSession() {
  return getJSON(STORAGE_KEYS.SESSION, null);
}
function setSession(userId) {
  setJSON(STORAGE_KEYS.SESSION, { userId, time: Date.now() });
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
function getCurrentUser() {
  const s = getSession();
  if (!s) return null;
  const users = getJSON(STORAGE_KEYS.USERS, []);
  const u = users.find(x => x.id === s.userId);
  if (!u || u.status === 'disabled') return null;
  return u;
}
function isAdmin() {
  const u = getCurrentUser();
  return !!u && u.role === 'admin';
}

// 未登录则跳转到登录页（用于需要登录的操作页）
function requireLogin() {
  const u = getCurrentUser();
  if (!u) {
    alert('请先登录后再进行该操作');
    window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname.split('/').pop());
    return null;
  }
  return u;
}

// ---------- 顶部导航 / 页脚 ----------
function initLayout(active) {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  const user = getCurrentUser();

  const navItems = [
    { href: 'index.html', label: '首页', key: 'home' },
    { href: 'browse.html', label: '民俗展示', key: 'browse' },
    { href: 'search.html', label: '信息检索', key: 'search' }
  ];

  let userArea = '';
  if (user) {
    userArea = `
      <div class="nav-user">
        <span class="pill">👤 ${escapeHtml(user.nickname || user.username)}${user.role === 'admin' ? '（管理员）' : ''}</span>
        <a href="profile.html" class="btn btn-outline btn-sm">个人中心</a>
        ${user.role === 'admin' ? '<a href="admin.html" class="btn btn-outline btn-sm">管理后台</a>' : ''}
        <button class="btn btn-sm" id="logoutBtn">退出</button>
      </div>`;
  } else {
    userArea = `
      <div class="nav-user">
        <a href="login.html" class="btn btn-outline btn-sm">登录</a>
        <a href="register.html" class="btn btn-sm">注册</a>
      </div>`;
  }

  if (header) {
    header.innerHTML = `
      <div class="nav-bar">
        <a href="index.html" class="brand">
          <span class="brand-icon">🏞️</span>
          <span>甘肃民俗文化展示平台<small>Gansu Folk Culture Platform</small></span>
        </a>
        <div class="nav-links">
          ${navItems.map(n => `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${n.label}</a>`).join('')}
        </div>
        ${userArea}
      </div>`;
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        addLog('用户退出', user ? user.username : '');
        clearSession();
        window.location.href = 'index.html';
      });
    }
  }

  if (footer) {
    footer.innerHTML = `
      <div>甘肃民俗文化展示平台 ｜ 课程设计原型 · 数据存储于本机浏览器（localStorage），仅供演示</div>
      <div>内容整理自公开非遗资料，具体认定信息请以官方非物质文化遗产名录为准</div>
      <div style="margin-top:6px;opacity:.7;">管理员演示账号：admin / admin123 　示例用户：demo / demo123</div>
    `;
  }
}

// ---------- 工具 ----------
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getResources() {
  return getJSON(STORAGE_KEYS.RESOURCES, []);
}
function saveResources(list) {
  setJSON(STORAGE_KEYS.RESOURCES, list);
}
function getResourceById(id) {
  return getResources().find(r => r.id === id);
}
function bumpViews(id) {
  const list = getResources();
  const r = list.find(x => x.id === id);
  if (r) { r.views = (r.views || 0) + 1; saveResources(list); }
}

function resourceCardHtml(r) {
  const pendingBadge = r.status === 'pending' ? '<span class="badge-pending">待审核</span>' : '';
  const heritageBadge = r.nonHeritage ? `<span class="badge-heritage">非遗</span>` : '';
  const rfidTag = (typeof getRfidByFolkId === 'function') ? getRfidByFolkId(r.id) : null;
  const rfidBadge = rfidTag ? `<span class="badge-rfid">🏷 已编目</span>` : '';
  return `
    <a class="res-card" href="detail.html?id=${r.id}" style="text-decoration:none;color:inherit;">
      <div class="thumb" style="background:${r.color};">${r.icon}</div>
      <div class="body">
        <h3>${escapeHtml(r.title)} ${heritageBadge} ${pendingBadge} ${rfidBadge}</h3>
        <div class="meta">📍 ${escapeHtml(r.region)} ｜ ${escapeHtml(categoryName(r.category))} ｜ 👁 ${r.views || 0}</div>
        <div class="summary">${escapeHtml(r.summary)}</div>
        <div class="tags">${(r.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>
      </div>
    </a>`;
}
