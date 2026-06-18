/* ===================== 用户管理模块：注册 / 登录 ===================== */

function registerUser({ username, password, nickname }) {
  username = (username || '').trim();
  nickname = (nickname || '').trim() || username;
  if (!username || username.length < 3) return { ok: false, msg: '用户名至少3个字符' };
  if (!password || password.length < 6) return { ok: false, msg: '密码至少6位' };

  const users = getJSON(STORAGE_KEYS.USERS, []);
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, msg: '用户名已被注册' };
  }
  const newUser = {
    id: uid('u'),
    username, password, nickname,
    role: 'member',
    registerTime: new Date().toLocaleString('zh-CN'),
    status: 'active'
  };
  users.push(newUser);
  setJSON(STORAGE_KEYS.USERS, users);
  addLog('用户注册', username);
  return { ok: true, user: newUser };
}

function loginUser({ username, password }) {
  username = (username || '').trim();
  const users = getJSON(STORAGE_KEYS.USERS, []);
  const u = users.find(x => x.username.toLowerCase() === username.toLowerCase());
  if (!u) return { ok: false, msg: '用户不存在' };
  if (u.status === 'disabled') return { ok: false, msg: '该账号已被管理员禁用' };
  if (u.password !== password) return { ok: false, msg: '密码错误' };
  setSession(u.id);
  addLog('用户登录', username);
  return { ok: true, user: u };
}

function updateProfile(userId, patch) {
  const users = getJSON(STORAGE_KEYS.USERS, []);
  const u = users.find(x => x.id === userId);
  if (!u) return false;
  Object.assign(u, patch);
  setJSON(STORAGE_KEYS.USERS, users);
  return true;
}
