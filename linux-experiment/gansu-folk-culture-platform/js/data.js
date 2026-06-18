/* ===================== 甘肃民俗文化展示平台 - 基础数据 =====================
   说明：本平台内容为课程设计/原型演示用途，民俗文化介绍已尽量依据公开的非遗
   名录信息整理撰写，但措辞为原创概述，具体认定批次、级别请以官方非遗名录为准。
   数据持久化方式：浏览器 localStorage（无需后端、无需联网，双击 index.html 即可使用）。
================================================================================ */

const STORAGE_KEYS = {
  USERS: 'gfcp_users',
  RESOURCES: 'gfcp_resources',
  INTERACTIONS: 'gfcp_interactions', // 评论/收藏/分享记录
  SESSION: 'gfcp_session',
  LOGS: 'gfcp_logs',
  RFID: 'gfcp_rfid', // 联机编目模块：RFID标签（与民俗项目 1:1 关联）
  SEEDED: 'gfcp_seeded_v1'
};

// ---------- 分类（对应"民俗文化分类"模块） ----------
const CATEGORIES = [
  { id: 'music',   name: '传统音乐', icon: '🎵' },
  { id: 'festival', name: '民俗节庆', icon: '🏮' },
  { id: 'craft',   name: '传统手工技艺', icon: '🧵' },
  { id: 'dance',   name: '传统舞蹈', icon: '🥁' },
  { id: 'opera',   name: '传统戏剧', icon: '🎭' },
  { id: 'ethnic',  name: '民族民俗', icon: '👘' }
];

function categoryName(id) {
  const c = CATEGORIES.find(x => x.id === id);
  return c ? c.name : id;
}
function categoryIcon(id) {
  const c = CATEGORIES.find(x => x.id === id);
  return c ? c.icon : '📁';
}

// ---------- 民俗文化资源（种子数据） ----------
const SEED_RESOURCES = [
  {
    id: 'r1',
    title: '花儿',
    category: 'music',
    region: '临夏 / 甘南 / 定西',
    type: '图文',
    heritage: '人类非物质文化遗产代表作 · 国家级',
    color: '#b5452b',
    icon: '🎵',
    summary: '流传于甘肃、青海、宁夏等地的山歌体民歌，即兴对唱、曲调高亢悠长。',
    content: '花儿是流行于甘肃、青海、宁夏及周边地区的一种山歌形式，以即兴编词、对唱盘歌为主要表演方式，曲调高亢悠扬，歌词多反映劳动生活与男女情感。甘肃境内的二郎山花儿会、莲花山花儿会、松鸣岩花儿会是花儿传承的重要场所，每年农历庙会期间，各地歌手云集对歌，场面热闹。花儿已被列入国家级非物质文化遗产代表性项目名录，并入选联合国教科文组织人类非物质文化遗产代表作名录，是甘肃最具代表性的民间音乐形式之一。',
    tags: ['民歌', '花儿会', '非遗', '联合国教科文组织'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r2',
    title: '社火',
    category: 'festival',
    region: '陇东 / 天水 / 兰州',
    type: '图文',
    heritage: '省级 / 地方代表性民俗',
    color: '#c0392b',
    icon: '🏮',
    summary: '春节期间盛行的民间游艺活动，舞龙舞狮、高台、旱船样样齐全。',
    content: '社火是甘肃各地春节期间最具代表性的民间游艺活动，通常从正月初开始，一直延续到元宵节前后。表演内容丰富，包括舞龙、舞狮、高台、旱船、跑驴、秧歌等多种形式，村社之间常以社火队互访拜年，热闹非凡。社火表演融合了戏曲、武术、杂技等多种民间艺术元素，是甘肃乡村社区文化生活的重要组成部分，承载着祈福纳祥、欢庆丰年的美好寓意。',
    tags: ['春节', '游艺', '舞龙舞狮'],
    nonHeritage: false,
    views: 0,
    status: 'published'
  },
  {
    id: 'r3',
    title: '西和乞巧节',
    category: 'festival',
    region: '陇南 · 西和县',
    type: '图文',
    heritage: '国家级（代表性民俗活动）',
    color: '#d35400',
    icon: '🪡',
    summary: '被誉为"中国乞巧文化之乡"，七夕前后女子结社祭拜织女、乞求巧艺。',
    content: '西和乞巧节是流传于甘肃陇南西和县及周边地区的传统女儿节俗，活动从农历六月最后一天延续至七月初七，未婚女子结社结对，迎巧、祭巧、唱巧、卜巧、送巧，仪式完整、参与人数众多，被誉为"中国乞巧文化之乡"。乞巧节集歌舞、手工、礼仪于一体,体现了西北地区独特的女性民俗文化传统，是研究七夕文化在民间延续形态的重要样本。',
    tags: ['七夕', '女儿节', '陇南'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r4',
    title: '庆阳香包绣制',
    category: 'craft',
    region: '庆阳',
    type: '图文',
    heritage: '国家级 · 第一批（2006年）',
    color: '#a93226',
    icon: '🧵',
    summary: '端午时节的刺绣香包，针法细腻、图案寓意吉祥，庆阳被称为"香包之乡"。',
    content: '庆阳香包绣制是甘肃庆阳地区流传久远的传统刺绣技艺，多在端午节前后制作佩戴，寓意驱邪避瘟、祈福纳吉。香包造型多样，常见的有动物、花卉、几何纹样等，针法包括平绣、盘绣、打结绣等，色彩浓烈、构图饱满，具有浓郁的西北民间审美特色。2006年，庆阳香包绣制入选第一批国家级非物质文化遗产代表性项目名录，庆阳也因此被誉为"中国香包刺绣之乡"。',
    tags: ['刺绣', '端午', '香包之乡'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r5',
    title: '临夏砖雕',
    category: 'craft',
    region: '临夏',
    type: '图文',
    heritage: '国家级 · 第一批（2006年）',
    color: '#8e5a2d',
    icon: '🏛️',
    summary: '源于秦汉民间木雕技艺延伸而来的建筑装饰雕刻，多见于门楼、照壁。',
    content: '临夏砖雕是甘肃临夏地区独具特色的传统建筑装饰雕刻技艺，常用于民居门楼、照壁、墙面等部位，题材包括花卉、山水、文字、几何纹样等，雕刻层次丰富，立体感强。其技艺渊源可追溯至秦汉时期的民间木雕，后逐渐发展出独立的砖雕体系，融合了汉族与回族、东乡族等多民族的审美元素。2006年，临夏砖雕入选第一批国家级非物质文化遗产代表性项目名录。',
    tags: ['建筑装饰', '雕刻技艺', '多民族融合'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r6',
    title: '天水雕漆',
    category: 'craft',
    region: '天水',
    type: '图文',
    heritage: '省级',
    color: '#6e2c00',
    icon: '🎨',
    summary: '以天然生漆髹饰、雕刻而成的传统漆器工艺，工序繁复、色泽温润。',
    content: '天水雕漆是流传于甘肃天水地区的传统漆器制作技艺，以天然生漆为主要原料，经髹漆、彩绘、雕刻等多道工序制成，成品色泽温润、纹饰精美，常见于家具、屏风、文房用具等日常器物。天水雕漆制作工序复杂，对匠人手艺要求极高，是甘肃传统手工技艺中工艺难度较高的一类，已被列入省级非物质文化遗产代表性项目名录。',
    tags: ['漆器', '传统工艺', '天水'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r7',
    title: '兰州太平鼓',
    category: 'dance',
    region: '兰州',
    type: '图文',
    heritage: '省级 · 首批（2006年）',
    color: '#922b21',
    icon: '🥁',
    summary: '气势恢宏的大型广场鼓舞，鼓身高大、动作刚健，常用于节庆庆典。',
    content: '兰州太平鼓是甘肃兰州地区流传的大型民间广场鼓舞，鼓身高大、鼓声雄浑，表演时鼓手队列变化丰富，动作刚健有力，气势恢宏，常用于春节、庙会及各类庆典活动，被誉为"天下第一鼓"。兰州太平鼓表演讲究队形变化与节奏配合，对体力与协作要求很高，是甘肃民间舞蹈中极具观赏性与代表性的一种形式，2006年入选甘肃省首批省级非物质文化遗产名录。',
    tags: ['鼓舞', '广场表演', '节庆庆典'],
    nonHeritage: false,
    views: 0,
    status: 'published'
  },
  {
    id: 'r8',
    title: '陇剧',
    category: 'opera',
    region: '庆阳 · 环县',
    type: '文字',
    heritage: '地方代表性剧种',
    color: '#7b241c',
    icon: '🎭',
    summary: '甘肃地方戏剧剧种，脱胎于环县道情皮影戏的唱腔与曲调。',
    content: '陇剧是甘肃具有代表性的地方戏剧剧种之一，其唱腔与音乐脱胎于庆阳环县一带流传的道情皮影戏曲调，后经过整理改编发展为可以舞台演出的戏剧形式。陇剧唱腔婉转、地方色彩浓郁，剧目多取材于历史故事与民间传说，是甘肃戏曲艺术"由皮影到舞台"演变的典型代表，对研究西北地方戏曲发展脉络具有重要意义。',
    tags: ['地方戏', '道情', '舞台戏剧'],
    nonHeritage: false,
    views: 0,
    status: 'published'
  },
  {
    id: 'r9',
    title: '环县道情皮影戏',
    category: 'opera',
    region: '庆阳 · 环县',
    type: '视频',
    heritage: '人类非物质文化遗产代表作',
    color: '#5d4037',
    icon: '🪭',
    summary: '皮影造型与道情说唱相结合的古老戏曲形式，"一驴驮"演遍千村万落。',
    content: '环县道情皮影戏是流传于甘肃庆阳环县一带的古老民间戏曲艺术，将皮影造型表演与道情说唱音乐相结合，演出班社规模精简，全套箱具一头驴即可驮运，俗称"一驴驮"，常年游走于乡村社区演出。其唱腔质朴高亢，皮影雕刻精细，题材多取自历史演义与民间传说，是中国皮影艺术中保存较为完整、活态传承的代表之一，已入选联合国教科文组织人类非物质文化遗产代表作名录。',
    tags: ['皮影', '道情', '人类非遗'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r10',
    title: '裕固族服饰及婚俗',
    category: 'ethnic',
    region: '肃南裕固族自治县',
    type: '图文',
    heritage: '国家级',
    color: '#117864',
    icon: '👘',
    summary: '裕固族特有的头饰与服饰工艺，以及保留草原游牧色彩的传统婚俗礼仪。',
    content: '裕固族是世居甘肃河西走廊的少数民族，其传统服饰尤以女子头饰最具特色，常以珠管、珊瑚、银饰等编织成长辫饰带，色彩绚丽、做工精细。裕固族传统婚俗则保留了浓厚的草原游牧文化色彩，包括说媒、订亲、戴头面、迎亲等一系列礼仪程序，过程庄重而充满仪式感。裕固族服饰与婚俗已被列入国家级非物质文化遗产代表性项目名录，是甘肃多民族文化多样性的重要体现。',
    tags: ['少数民族', '服饰', '婚俗'],
    nonHeritage: true,
    views: 0,
    status: 'published'
  },
  {
    id: 'r11',
    title: '崆峒派武术',
    category: 'dance',
    region: '平凉 · 崆峒山',
    type: '文字',
    heritage: '省级',
    color: '#1e8449',
    icon: '🥋',
    summary: '依托崆峒山道教文化发展而来的武术流派，套路刚柔并重、独具一格。',
    content: '崆峒派武术依托平凉崆峒山深厚的道教文化背景发展而来，融合了道家养生理念与实战技击技巧，套路风格刚柔并重，兵器与拳法体系自成一格，在西北武术流派中独具特色。崆峒派武术不仅是一种技击技艺，也承载着崆峒山地区的宗教文化与民俗信仰，目前已被列入省级非物质文化遗产代表性项目名录，并通过武术展演、传习活动持续传承发展。',
    tags: ['武术', '崆峒山', '道教文化'],
    nonHeritage: false,
    views: 0,
    status: 'pending' // 用于演示"内容审核"功能：待审核内容
  },
  {
    id: 'r12',
    title: '兰州鼓子',
    category: 'music',
    region: '兰州',
    type: '文字',
    heritage: '国家级',
    color: '#b9770e',
    icon: '🎶',
    summary: '兰州地区的曲艺说唱形式，唱腔典雅、自弹自唱，多在民间集会传唱。',
    content: '兰州鼓子是流行于兰州地区的传统曲艺说唱形式，表演者多自弹三弦或月琴自唱，唱腔典雅细腻，曲牌丰富，内容涉及历史故事、生活趣闻等。兰州鼓子传统上多在茶馆、庙会、民间集会等场合传唱，是研究西北曲艺音乐发展的重要资料，已入选国家级非物质文化遗产代表性项目名录。',
    tags: ['曲艺', '说唱', '三弦'],
    nonHeritage: true,
    views: 0,
    status: 'pending' // 待审核内容
  }
];

// ---------- 工具函数 ----------
function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function addLog(action, detail) {
  const logs = getJSON(STORAGE_KEYS.LOGS, []);
  logs.unshift({
    id: uid('log'),
    time: new Date().toLocaleString('zh-CN'),
    action, detail
  });
  setJSON(STORAGE_KEYS.LOGS, logs.slice(0, 200));
}

// ---------- 初始化种子数据（仅首次运行） ----------
function seedDatabase() {
  if (localStorage.getItem(STORAGE_KEYS.SEEDED)) return;

  // 种子用户：一个管理员 + 一个示例注册用户
  const users = [
    {
      id: uid('u'),
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      nickname: '系统管理员',
      registerTime: new Date().toLocaleString('zh-CN'),
      status: 'active'
    },
    {
      id: uid('u'),
      username: 'demo',
      password: 'demo123',
      role: 'member',
      nickname: '示例用户',
      registerTime: new Date().toLocaleString('zh-CN'),
      status: 'active'
    }
  ];
  setJSON(STORAGE_KEYS.USERS, users);
  setJSON(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
  setJSON(STORAGE_KEYS.INTERACTIONS, { comments: [], favorites: [] });
  setJSON(STORAGE_KEYS.LOGS, []);

  // 种子 RFID 标签：为部分民俗项目（藏品）预先完成联机编目/标签绑定，演示联机编目模块
  const rfidSeed = [
    { id: uid('rf'), tagCode: 'RFID-A1B2C3', folkId: 'r4', createTime: new Date().toLocaleString('zh-CN'), status: 'active' },
    { id: uid('rf'), tagCode: 'RFID-D4E5F6', folkId: 'r5', createTime: new Date().toLocaleString('zh-CN'), status: 'active' },
    { id: uid('rf'), tagCode: 'RFID-G7H8I9', folkId: 'r10', createTime: new Date().toLocaleString('zh-CN'), status: 'lost' }
  ];
  setJSON(STORAGE_KEYS.RFID, rfidSeed);

  localStorage.setItem(STORAGE_KEYS.SEEDED, '1');
  addLog('系统初始化', '已生成种子用户、民俗文化资源与RFID标签编目数据');
}

seedDatabase();
