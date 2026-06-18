/* ===================== 用户交互模块：评论 / 收藏 / 分享 ===================== */

function getInteractions() {
  return getJSON(STORAGE_KEYS.INTERACTIONS, { comments: [], favorites: [] });
}
function saveInteractions(data) {
  setJSON(STORAGE_KEYS.INTERACTIONS, data);
}

// ---------- 评论 ----------
function addComment(resourceId, content) {
  const user = requireLogin();
  if (!user) return null;
  if (!content || !content.trim()) return null;
  const data = getInteractions();
  const comment = {
    id: uid('c'),
    resourceId,
    userId: user.id,
    username: user.nickname || user.username,
    content: content.trim(),
    time: new Date().toLocaleString('zh-CN')
  };
  data.comments.unshift(comment);
  saveInteractions(data);
  addLog('发表评论', `${user.username} -> ${resourceId}`);
  return comment;
}

function deleteComment(commentId) {
  const user = getCurrentUser();
  if (!user) return false;
  const data = getInteractions();
  const idx = data.comments.findIndex(c => c.id === commentId);
  if (idx === -1) return false;
  const c = data.comments[idx];
  if (c.userId !== user.id && user.role !== 'admin') return false;
  data.comments.splice(idx, 1);
  saveInteractions(data);
  addLog('删除评论', `${user.username} 删除了评论 ${commentId}`);
  return true;
}

function getCommentsForResource(resourceId) {
  return getInteractions().comments.filter(c => c.resourceId === resourceId);
}
function getCommentsForUser(userId) {
  return getInteractions().comments.filter(c => c.userId === userId);
}

// ---------- 收藏 ----------
function isFavorited(resourceId) {
  const user = getCurrentUser();
  if (!user) return false;
  return getInteractions().favorites.some(f => f.resourceId === resourceId && f.userId === user.id);
}

function toggleFavorite(resourceId) {
  const user = requireLogin();
  if (!user) return null;
  const data = getInteractions();
  const idx = data.favorites.findIndex(f => f.resourceId === resourceId && f.userId === user.id);
  let added;
  if (idx === -1) {
    data.favorites.unshift({ id: uid('f'), resourceId, userId: user.id, time: new Date().toLocaleString('zh-CN') });
    added = true;
  } else {
    data.favorites.splice(idx, 1);
    added = false;
  }
  saveInteractions(data);
  addLog(added ? '收藏内容' : '取消收藏', `${user.username} -> ${resourceId}`);
  return added;
}

function getFavoritesForUser(userId) {
  return getInteractions().favorites.filter(f => f.userId === userId);
}

// ---------- 分享 ----------
function shareResource(resourceId, title) {
  const fakeLink = window.location.origin + window.location.pathname.replace(/[^/]+$/, '') + 'detail.html?id=' + resourceId;
  const text = `【甘肃民俗文化展示平台】${title} - ${fakeLink}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('分享链接已复制到剪贴板');
    }).catch(() => {
      showToast(text, true);
    });
  } else {
    showToast(text, true);
  }
  addLog('分享内容', resourceId);
}

function showToast(msg, isPrompt) {
  if (isPrompt) { prompt('复制以下内容进行分享：', msg); return; }
  let el = document.getElementById('__toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '__toast';
    el.style.position = 'fixed';
    el.style.bottom = '24px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'rgba(43,38,34,0.92)';
    el.style.color = '#fff';
    el.style.padding = '10px 20px';
    el.style.borderRadius = '20px';
    el.style.fontSize = '13px';
    el.style.zIndex = '999';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el.__t);
  el.__t = setTimeout(() => { el.style.display = 'none'; }, 2200);
}
