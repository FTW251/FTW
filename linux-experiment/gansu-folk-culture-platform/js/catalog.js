/* ===================== 联机编目模块 =====================
   对应功能结构图「6.联机编目模块」：信息录入 / 信息修改 / 信息删除 / RFID标签管理 / 数据审核
   对应数据库设计：folk 表（民俗项目）与 rfid 表（RFID标签，1:1 关联 folk_id，删除项目时级联删除标签）
   对应数据流图：联机编目子系统(5.0) 与 外部系统(RFID设备/存储) 之间的"RFID标签写入/读取请求"
                  ↔「RFID读取结果、设备状态信息」交互，此处用 simulateRfidScan() 模拟该交互。
================================================================ */

const DEFAULT_RES_COLORS = ['#a93226', '#c0392b', '#b9770e', '#1e8449', '#117864', '#6e2c00', '#8e5a2d', '#922b21', '#5d4037', '#1e8449'];

function pickDefaultColor() {
  return DEFAULT_RES_COLORS[Math.floor(Math.random() * DEFAULT_RES_COLORS.length)];
}

// ---------- 权限校验（联机编目相关操作均需管理员） ----------
function requireAdmin() {
  const u = getCurrentUser();
  if (!u || u.role !== 'admin') return null;
  return u;
}

/* =====================================================
   一、信息录入 / 信息修改 / 信息删除（民俗项目资源）
   ===================================================== */

function adminAddResource(data) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限：仅管理员可录入信息' };
  const title = (data.title || '').trim();
  if (!title) return { ok: false, msg: '名称不能为空' };
  if (!data.category) return { ok: false, msg: '请选择分类' };

  const list = getResources();
  const resource = {
    id: uid('res'),
    title,
    category: data.category,
    region: (data.region || '').trim() || '甘肃',
    type: data.type || '图文',
    heritage: (data.heritage || '').trim(),
    color: data.color || pickDefaultColor(),
    icon: (data.icon || '').trim() || categoryIcon(data.category),
    summary: (data.summary || '').trim(),
    content: (data.content || '').trim(),
    tags: String(data.tags || '').split(/[,，]/).map(t => t.trim()).filter(Boolean),
    nonHeritage: !!data.nonHeritage,
    views: 0,
    status: data.status === 'published' ? 'published' : 'pending'
  };
  list.push(resource);
  saveResources(list);
  addLog('信息录入', `${admin.username} 新增民俗项目《${resource.title}》`);
  return { ok: true, resource };
}

function adminUpdateResource(id, data) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限：仅管理员可修改信息' };
  const list = getResources();
  const r = list.find(x => x.id === id);
  if (!r) return { ok: false, msg: '该民俗项目不存在' };

  const title = (data.title || '').trim();
  if (!title) return { ok: false, msg: '名称不能为空' };

  r.title = title;
  r.category = data.category || r.category;
  r.region = (data.region || '').trim() || r.region;
  r.type = data.type || r.type;
  r.heritage = (data.heritage || '').trim();
  if (data.color) r.color = data.color;
  r.icon = (data.icon || '').trim() || r.icon;
  r.summary = (data.summary || '').trim();
  r.content = (data.content || '').trim();
  r.tags = String(data.tags || '').split(/[,，]/).map(t => t.trim()).filter(Boolean);
  r.nonHeritage = !!data.nonHeritage;
  if (data.status) r.status = data.status;

  saveResources(list);
  addLog('信息修改', `${admin.username} 修改民俗项目《${r.title}》`);
  return { ok: true, resource: r };
}

function adminDeleteResource(id) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限：仅管理员可删除信息' };
  let list = getResources();
  const r = list.find(x => x.id === id);
  if (!r) return { ok: false, msg: '该民俗项目不存在' };

  list = list.filter(x => x.id !== id);
  saveResources(list);

  // 级联删除关联数据，对应 ER 设计中评论/收藏/RFID标签外键 ON DELETE CASCADE
  const interactions = getInteractions();
  const beforeC = interactions.comments.length, beforeF = interactions.favorites.length;
  interactions.comments = interactions.comments.filter(c => c.resourceId !== id);
  interactions.favorites = interactions.favorites.filter(f => f.resourceId !== id);
  saveInteractions(interactions);

  const rfidBefore = getRfidTags().length;
  const rfidList = getRfidTags().filter(t => t.folkId !== id);
  saveRfidTags(rfidList);

  addLog('信息删除', `${admin.username} 删除民俗项目《${r.title}》（级联删除评论${beforeC - interactions.comments.length}条/收藏${beforeF - interactions.favorites.length}条/RFID标签${rfidBefore - rfidList.length}个）`);
  return { ok: true };
}

/* =====================================================
   二、RFID标签管理（与外部 RFID 设备/存储系统交互）
   ===================================================== */

function getRfidTags() {
  return getJSON(STORAGE_KEYS.RFID, []);
}
function saveRfidTags(list) {
  setJSON(STORAGE_KEYS.RFID, list);
}
function getRfidByFolkId(folkId) {
  return getRfidTags().find(t => t.folkId === folkId) || null;
}
function generateTagCode() {
  const existing = getRfidTags().map(t => t.tagCode);
  let code;
  do {
    code = 'RFID-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (existing.includes(code));
  return code;
}
function rfidStatusLabel(status) {
  if (status === 'active') return '正常';
  if (status === 'lost') return '挂失';
  return '停用';
}

function bindRfidTag(folkId, tagCode) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限：仅管理员可绑定RFID标签' };
  const r = getResourceById(folkId);
  if (!r) return { ok: false, msg: '该民俗项目不存在' };
  if (getRfidByFolkId(folkId)) return { ok: false, msg: '该项目已绑定RFID标签，请先解绑' };

  const code = (tagCode || '').trim() || generateTagCode();
  const list = getRfidTags();
  if (list.some(t => t.tagCode.toLowerCase() === code.toLowerCase())) {
    return { ok: false, msg: '标签编号已被占用，请更换' };
  }

  const tag = {
    id: uid('rf'),
    tagCode: code,
    folkId,
    createTime: new Date().toLocaleString('zh-CN'),
    status: 'active'
  };
  list.push(tag);
  saveRfidTags(list);
  addLog('RFID标签绑定', `${admin.username} 为《${r.title}》绑定标签 ${code}`);
  return { ok: true, tag };
}

function unbindRfidTag(folkId) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限：仅管理员可解绑RFID标签' };
  let list = getRfidTags();
  const tag = list.find(t => t.folkId === folkId);
  if (!tag) return { ok: false, msg: '该项目尚未绑定RFID标签' };
  list = list.filter(t => t.folkId !== folkId);
  saveRfidTags(list);
  const r = getResourceById(folkId);
  addLog('RFID标签解绑', `${admin.username} 解绑《${r ? r.title : folkId}》的标签 ${tag.tagCode}`);
  return { ok: true };
}

function setRfidStatus(folkId, status) {
  const admin = requireAdmin();
  if (!admin) return { ok: false, msg: '无权限' };
  const list = getRfidTags();
  const tag = list.find(t => t.folkId === folkId);
  if (!tag) return { ok: false, msg: '该项目尚未绑定RFID标签' };
  tag.status = status;
  saveRfidTags(list);
  const r = getResourceById(folkId);
  addLog('RFID状态变更', `${admin.username} 将《${r ? r.title : folkId}》标签状态设为「${rfidStatusLabel(status)}」`);
  return { ok: true, tag };
}

// 模拟联机编目子系统与「外部系统：RFID设备/存储」的写入/读取交互（数据流图 DFD-1 中 5.0 ↔ 外部系统）
function simulateRfidScan(folkId) {
  const tag = getRfidByFolkId(folkId);
  const r = getResourceById(folkId);
  if (!tag) {
    addLog('RFID读取请求', `读取藏品《${r ? r.title : folkId}》失败：尚未绑定RFID标签`);
    return { ok: false, msg: '该项目尚未绑定RFID标签，无法读取' };
  }
  const deviceOk = tag.status === 'active';
  addLog('RFID读取请求', `写入/读取标签 ${tag.tagCode} → 返回藏品《${r ? r.title : folkId}》编目信息，设备状态：${deviceOk ? '正常' : '异常（' + rfidStatusLabel(tag.status) + '）'}`);
  return { ok: true, tag, resource: r, deviceOk };
}
