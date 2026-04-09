import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, where, Timestamp, getDoc, setDoc, orderBy
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Home, CheckSquare, Plus, ShoppingBag, Calendar, Map, 
  RefreshCw, BarChart2, Baby, Settings, Clock, MapPin, 
  AlertCircle, ChevronRight, CheckCircle2, Circle, 
  Tv, Coffee, Moon, Sun, Heart, Trash2, Edit3, X, 
  User, Star, Activity, Stethoscope, Briefcase, Zap,
  Bell, BellOff, ChevronLeft, CalendarDays, List as ListIcon, Users, Sparkles, History, ExternalLink, ShieldAlert, TrendingUp, DollarSign, Wallet, CreditCard, ArrowLeft, Info, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Lock, Target, Plane, Map as MapIcon, Users2
} from 'lucide-react';

// --- Configuration & Constants ---
const DEMO_MODE = true; // 當 Firestore 沒資料時，是否顯示假資料預覽

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'family-pro-v5';
const householdId = 'kate-home';

const ROLES = ["Kate", "Kai"];
const ROLE_DISPLAY = { "Kate": "媽媽", "Kai": "爸爸", "樂樂": "寶寶", "共同": "共同", "未指派": "未指派", "任何人": "任何人" };
const ROOMS = ["客廳", "廚房", "主臥", "次臥", "主衛浴", "客衛浴", "陽台", "玄關", "全屋"];
const SHOPPING_CATS = ["食品", "日用品", "嬰兒用品", "寵物用品", "其他"];
const PLAN_TYPES = ["出去走走", "回娘家", "回婆家", "體檢", "寶寶打疫苗", "看醫生", "約會", "聚餐", "旅遊", "採買", "目標", "其他"];
const PARTICIPANTS_LIST = ["Kate", "Kai", "樂樂"];

const CHORE_TEMPLATES = {
  "客廳": [
      { title: "掃地", category: "清潔", isCore: true, days: 3 }, 
      { title: "拖地", category: "清潔", isCore: true, days: 7 },
      { title: "擦桌子", category: "清潔", isCore: true, days: 2 },
      { title: "整理玩具", category: "收納", isCore: true, days: 1 },
      { title: "擦電視櫃", category: "清潔", isCore: true, days: 14 },
      { title: "沙發整理", category: "收納", isCore: true, days: 3 }
  ],
  "廚房": [
      { title: "流理台清潔", category: "清潔", isCore: true, days: 2 }, 
      { title: "倒垃圾", category: "清潔", isCore: true, days: 1 },
      { title: "洗碗", category: "廚務", isCore: true, days: 1 },
      { title: "擦瓦斯爐", category: "清潔", isCore: true, days: 3 },
      { title: "冰箱整理", category: "收納", isCore: true, days: 14 },
      { title: "補垃圾袋", category: "補貨", isCore: true, days: 14 },
      { title: "補廚房備品", category: "補貨", isCore: true, days: 14 }
  ],
  "主臥": [
      { title: "換床單", category: "清潔", isCore: true, days: 14 },
      { title: "摺衣服", category: "收納", isCore: true, days: 3 },
      { title: "整理床鋪", category: "收納", isCore: true, days: 1 },
      { title: "衣櫃整理", category: "收納", isCore: true, days: 30 }
  ],
  "次臥": [
      { title: "整理雜物", category: "收納", isCore: true, days: 7 },
      { title: "擦桌面", category: "清潔", isCore: true, days: 7 },
      { title: "收玩具 / 收用品", category: "收納", isCore: true, days: 1 }
  ],
  "主衛浴": [
      { title: "馬桶清潔", category: "清潔", isCore: true, days: 7 },
      { title: "洗手台清潔", category: "清潔", isCore: true, days: 3 },
      { title: "鏡子擦拭", category: "清潔", isCore: true, days: 14 },
      { title: "地板清潔", category: "清潔", isCore: true, days: 7 },
      { title: "補衛生紙", category: "補貨", isCore: true, days: 7 },
      { title: "補清潔用品", category: "補貨", isCore: true, days: 14 }
  ],
  "客衛浴": [
      { title: "馬桶清潔", category: "清潔", isCore: true, days: 7 },
      { title: "洗手台清潔", category: "清潔", isCore: true, days: 3 },
      { title: "鏡子擦拭", category: "清潔", isCore: true, days: 14 },
      { title: "地板清潔", category: "清潔", isCore: true, days: 7 },
      { title: "補衛生紙", category: "補貨", isCore: true, days: 7 },
      { title: "補清潔用品", category: "補貨", isCore: true, days: 14 }
  ],
  "陽台": [
      { title: "洗衣服", category: "洗滌", isCore: true, days: 4 },
      { title: "收衣服", category: "收納", isCore: true, days: 2 },
      { title: "曬衣服", category: "洗滌", isCore: true, days: 2 },
      { title: "清地板", category: "清潔", isCore: true, days: 14 },
      { title: "清洗洗衣機外部", category: "清潔", isCore: true, days: 30 }
  ],
  "玄關": [
      { title: "整理鞋子", category: "收納", isCore: true, days: 7 },
      { title: "擦鞋櫃", category: "清潔", isCore: true, days: 30 },
      { title: "地面清潔", category: "清潔", isCore: true, days: 7 }
  ],
  "全屋": [
      { title: "全屋掃地", category: "清潔", isCore: true, days: 3 },
      { title: "全屋拖地", category: "清潔", isCore: true, days: 7 },
      { title: "全屋除塵", category: "清潔", isCore: true, days: 14 },
      { title: "倒垃圾回收", category: "清潔", isCore: true, days: 2 },
      { title: "補家庭備品", category: "補貨", isCore: true, days: 14 }
  ]
};

// --- Demo Data ---
const demoPlans = [
  { id: 'd1', title: "週末回娘家", type: "回娘家", plannedDate: "2026-04-12", locationName: "板橋娘家", participants: ["Kate", "樂樂"], cost: 1200, note: "帶水果和尿布" },
  { id: 'd2', title: "樂樂流感疫苗", type: "寶寶打疫苗", plannedDate: "2026-04-18", locationName: "XX 小兒科", participants: ["Kate", "樂樂"], cost: 900 },
  { id: 'd3', title: "東京親子旅行", type: "旅遊", plannedDate: "2026-07-10", locationName: "日本東京", mapLink: "https://maps.app.goo.gl/demo", participants: ["Kate", "Kai", "樂樂"], transportCost: 18000, hotelCost: 24000, foodCost: 12000, adultCount: 2, kidCount: 1, adultUnitCost: 8000, kidUnitCost: 4000, totalBudget: 74000, note: "迪士尼與上野動物園" },
  { id: 'd4', title: "沖繩旅行基金", type: "目標", plannedDate: "2026-12-20", locationName: "沖繩", participants: ["Kate", "Kai", "樂樂"], transportCost: 22000, hotelCost: 18000, foodCost: 10000, adultCount: 2, kidCount: 1, adultUnitCost: 7000, kidUnitCost: 3500, totalBudget: 57500 }
];

const demoFinance = {
  loans: [
    { id: 'l1', name: "房貸", total: 8500000, paid: 1200000, monthly: 32000, rate: 2.35 },
    { id: 'l2', name: "信貸", total: 300000, paid: 120000, monthly: 8500, rate: 5.88 }
  ],
  insurances: [
    { id: 'i1', name: "家庭壽險", company: "南山人壽", premium: 4800, freq: "月繳", coverage: "500萬", expiry: "2045-01" },
    { id: 'i2', name: "樂樂醫療險", company: "富邦", premium: 14400, freq: "年繳", coverage: "50萬", expiry: "2040-06" }
  ],
  households: [
    { id: 'h1', name: "水費", amount: 450, freq: "雙月繳", enabled: true, dueDate: "2026-04-20" },
    { id: 'h2', name: "電費", amount: 1800, freq: "雙月繳", enabled: true, dueDate: "2026-04-25" },
    { id: 'h3', name: "管理費", amount: 2500, freq: "月繳", enabled: true, dueDate: "2026-04-10" },
    { id: 'h4', name: "網路費", amount: 999, freq: "月繳", enabled: false, dueDate: "2026-04-15" }
  ],
  score: 85,
  currentMonthDue: 8200
};

// --- New Demo Data for Tasks and Kid Timeline ---
const _demoNow = new Date();
const _todayStr = _demoNow.toISOString().split('T')[0];
const _yesterdayStr = new Date(_demoNow.getTime() - 86400000).toISOString().split('T')[0];
const _overdue2Str = new Date(_demoNow.getTime() - 2 * 86400000).toISOString().split('T')[0];
const _in3DaysStr = new Date(_demoNow.getTime() + 3 * 86400000).toISOString().split('T')[0];

const demoTasks = [
  { id: 'dt1', title: "客廳掃地", room: "客廳", category: "清潔", assignee: "Kate", dueDate: _todayStr, priority: "High", status: "pending", createdAt: Timestamp.now() },
  { id: 'dt2', title: "廚房清潔", room: "廚房", category: "清潔", assignee: "Kai", dueDate: _overdue2Str, priority: "High", status: "pending", createdAt: Timestamp.now() },
  { id: 'dt3', title: "主臥換床單", room: "主臥", category: "清潔", assignee: "Kate", dueDate: _in3DaysStr, priority: "Medium", status: "pending", createdAt: Timestamp.now() },
  { id: 'dt4', title: "全屋拖地", room: "全屋", category: "清潔", assignee: "Kai", dueDate: "2026-04-01", priority: "Low", status: "completed", completedBy: "Kai", completedAt: Timestamp.now() }
];

const demoKidTimeline = [
  { id: 'dk1', type: "event", eventId: "tv", startTime: "19:00", endTime: "19:30", caregiver: "Kate", date: _todayStr, createdAt: Timestamp.now() },
  { id: 'dk2', type: "event", eventId: "sleep", value: "21:30", caregiver: "Kai", date: _todayStr, createdAt: Timestamp.now() },
  { id: 'dk3', type: "event", eventId: "snack", value: "1 份", caregiver: "Kate", date: _yesterdayStr, createdAt: Timestamp.now() },
  { id: 'dk4', type: "routine", title: "寶寶洗澡", caregiver: "Kai", status: "completed", date: _todayStr, completedAt: Timestamp.now() },
  { id: 'dk5', type: "routine", title: "寶寶刷牙", caregiver: "Kate", status: "pending", date: _todayStr }
];

// --- Helpers ---
const formatToday = () => new Date().toISOString().split('T')[0];
const getSafeDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (val.seconds) return new Date(val.seconds * 1000);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};
const getTimestampMillis = (val) => {
  const d = getSafeDate(val);
  return d ? d.getTime() : 0;
};
const formatDateTime = (val) => {
  const d = getSafeDate(val);
  if (!d) return "";
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const getDiffDays = (date) => {
  const d = getSafeDate(date);
  if (!d) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  return Math.floor(Math.abs(now - d) / (1000 * 60 * 60 * 24));
};
const normalizePersonName = (val) => {
  const v = String(val || "未指派").trim();
  return ROLE_DISPLAY[v] || v;
};

// --- New Helpers for Tasks ---
const getDueStatus = (date) => {
    const d = getSafeDate(date);
    if (!d) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(d); target.setHours(0,0,0,0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `已逾期 ${Math.abs(diffDays)} 天`, color: 'text-rose-500' };
    if (diffDays === 0) return { text: '今天到期', color: 'text-amber-500' };
    return { text: `還有 ${diffDays} 天`, color: 'text-stone-400' };
};

const getPriorityScore = (p) => p === 'High' ? 3 : p === 'Medium' ? 2 : 1;

// --- Trend Chart ---
const TrendChart = ({ data, type }) => {
  if (!data || data.length < 1) return (
    <div className="h-28 flex flex-col items-center justify-center text-stone-300 bg-stone-50/50 rounded-2xl border border-dashed border-stone-100">
        <History size={20} className="mb-2 opacity-20" />
        <span className="text-[10px] font-bold uppercase">暫無趨勢</span>
    </div>
  );
  const sorted = [...data].sort((a, b) => getTimestampMillis(a.date || a.createdAt) - getTimestampMillis(b.date || b.createdAt)).slice(-7);
  const maxVal = type === 'tv' ? Math.max(120, ...sorted.map(d => Number(d.value) || 0)) : 1500;
  return (
    <div className="flex items-end gap-2 h-24 pt-4 px-2">
      {sorted.map((d, i) => {
        let h = 0; let isAlert = false;
        if (type === 'tv') {
            h = (Number(d.value) / maxVal) * 100;
            if (Number(d.value) > 60) isAlert = true;
        } else {
            const [hh, mm] = (d.value || "20:00").split(':').map(Number);
            let total = hh * 60 + mm; if (hh < 6) total += 1440;
            h = ((total - 1000) / (1500 - 1000)) * 100;
            if (total > 1230) isAlert = true; 
        }
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className={`w-full rounded-t-lg transition-all duration-500 ${isAlert ? 'bg-rose-400' : (type === 'tv' ? 'bg-blue-300' : 'bg-indigo-300')}`} style={{ height: `${Math.max(15, h)}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">{d.value}</div>
            </div>
            <span className="text-[7px] font-black text-stone-300 uppercase">{(d.date || "").slice(-2)}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- Views Components ---
const GlobalHeader = ({ title, onBack, currentRole, setCurrentView, rightNode }) => (
  <div className="px-6 pt-10 pb-6 flex justify-between items-center bg-white/60 backdrop-blur-md sticky top-0 z-40">
    <div className="flex items-center gap-4">
      {onBack && <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm text-stone-400 active:scale-95"><ArrowLeft size={18}/></button>}
      <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight leading-none">{title}</h1>
          <div className="flex items-center gap-2 mt-1"><div className={`w-2 h-2 rounded-full ${currentRole === 'Kate' ? 'bg-emerald-400' : 'bg-blue-400'}`} /><span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">{ROLE_DISPLAY[currentRole]} 操作中</span></div>
      </div>
    </div>
    {rightNode ? rightNode : <button onClick={() => setCurrentView('settings')} className="p-2.5 bg-white rounded-2xl shadow-sm border border-stone-100/60 text-stone-400 hover:text-stone-600 transition-colors"><Settings size={18} /></button>}
  </div>
);

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('family_role') || null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); 
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [plans, setPlans] = useState([]);
  const [kidTimeline, setKidTimeline] = useState([]);
  const [finance, setFinance] = useState({ loans: [], insurances: [], households: [], score: 85, lastSummary: {} });
  const [financeLogs, setFinanceLogs] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else { await signInAnonymously(auth); }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); if (u) setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const p = (n) => `artifacts/${appId}/public/data/${householdId}_${n}`;
    const unsubT = onSnapshot(collection(db, p('tasks')), s => setTasks(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubS = onSnapshot(collection(db, p('shopping')), s => setShopping(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubR = onSnapshot(collection(db, p('routines')), s => setRoutines(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(collection(db, p('plans')), s => setPlans(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubK = onSnapshot(collection(db, p('kidTimeline')), s => setKidTimeline(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubF = onSnapshot(doc(db, p('meta'), 'finance'), s => { if(s.exists()) setFinance(s.data()); });
    const unsubFL = onSnapshot(collection(db, p('financeLogs')), s => setFinanceLogs(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>getTimestampMillis(b.createdAt)-getTimestampMillis(a.createdAt))));
    return () => { unsubT(); unsubS(); unsubR(); unsubP(); unsubK(); unsubF(); unsubFL(); };
  }, [user]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  
  const saveDoc = async (coll, data) => {
    if (data.id && String(data.id).startsWith('d')) {
      showToast("示範資料不可修改");
      setModalType(null); setEditData(null);
      return;
    }
    const path = `artifacts/${appId}/public/data/${householdId}_${coll}`;
    const payload = { ...data, updatedAt: Timestamp.now(), createdAt: data.createdAt || Timestamp.now() };
    try {
      if (data.id) { const { id, ...rest } = payload; await updateDoc(doc(db, path, id), rest); }
      else { await addDoc(collection(db, path), payload); }
      setModalType(null); setEditData(null); showToast("儲存成功");
    } catch (e) { showToast("儲存失敗"); }
  };

  const saveFinanceWithLog = async (newData, logs = []) => {
    const p = (n) => `artifacts/${appId}/public/data/${householdId}_${n}`;
    try {
        await setDoc(doc(db, p('meta'), 'finance'), { ...finance, ...newData, updatedAt: Timestamp.now() });
        for (let log of logs) {
            await addDoc(collection(db, p('financeLogs')), { ...log, role: currentRole, createdAt: Timestamp.now() });
        }
        showToast("財務異動已儲存");
        setModalType(null); setEditData(null);
    } catch (e) { showToast("儲存失敗"); }
  };

  const deleteItem = async (coll, id) => {
    if (String(id).startsWith('d')) { showToast("示範資料不可刪除"); return; }
    try { await deleteDoc(doc(db, `artifacts/${appId}/public/data/${householdId}_${coll}`, id)); showToast("已刪除"); } catch (e) { console.error(e); }
  };

  // --- Display Data Fallback Logic ---
  const displayTasks = useMemo(() => (tasks && tasks.length > 0) ? tasks : (DEMO_MODE ? demoTasks : []), [tasks]);
  const displayKidTimeline = useMemo(() => (kidTimeline && kidTimeline.length > 0) ? kidTimeline : (DEMO_MODE ? demoKidTimeline : []), [kidTimeline]);
  const displayPlans = (plans && plans.length > 0) ? plans : (DEMO_MODE ? demoPlans : []);
  const displayFinance = (finance.loans?.length > 0 || finance.insurances?.length > 0 || finance.households?.length > 0) ? finance : (DEMO_MODE ? demoFinance : finance);

  // --- Analytical Calculations ---
  const getRoomCoreStatus = (roomName) => {
    const templates = CHORE_TEMPLATES[roomName] || [];
    if (templates.length === 0) return { info: "查看空間任務", color: "text-stone-300", days: 0 };
    const statuses = templates.map(core => {
        const last = displayTasks.filter(t => t.room === roomName && t.title.includes(core.title) && t.status === 'completed')
                          .sort((a,b)=>getTimestampMillis(b.completedAt)-getTimestampMillis(a.completedAt))[0];
        const days = last ? getDiffDays(last.completedAt) : 99;
        return { title: core.title, days, limit: core.days };
    });
    const worst = statuses.sort((a,b) => (b.days/b.limit) - (a.days/a.limit))[0];
    const color = worst.days >= worst.limit ? "text-rose-400" : worst.days >= worst.limit * 0.7 ? "text-amber-500" : "text-stone-300";
    return { info: `${worst.days} 天未${worst.title}`, color, days: worst.days };
  };

  const getIndicators = (rangeStart) => {
    const startTs = rangeStart ? rangeStart.getTime() : 0;
    const rangeTasks = displayTasks.filter(t => getTimestampMillis(t.createdAt) >= startTs);
    const chorePct = rangeTasks.length ? Math.round((rangeTasks.filter(t => t.status === 'completed').length / rangeTasks.length) * 100) : 100;
    const rangeKid = displayKidTimeline.filter(k => getTimestampMillis(k.createdAt || k.completedAt) >= startTs);
    const kidPct = rangeKid.length ? Math.round((rangeKid.filter(k => k.status === 'completed' || k.type === 'event').length / (rangeKid.length || 1)) * 100) : 80;
    const urgentShop = shopping.filter(s => s.isUrgent && getTimestampMillis(s.createdAt) >= startTs);
    const shopPct = urgentShop.length ? Math.round((urgentShop.filter(s => s.status === 'purchased').length / urgentShop.length) * 100) : 100;
    const finPct = finance.score || 85;
    return { chore: chorePct, kid: kidPct, shop: shopPct, fin: finPct, avg: Math.round((chorePct + kidPct + shopPct + finPct) / 4) };
  };

  const getHonors = (rangeStart) => {
    const startTs = rangeStart ? rangeStart.getTime() : 0;
    const fT = displayTasks.filter(t => getTimestampMillis(t.completedAt) >= startTs);
    const fK = displayKidTimeline.filter(k => getTimestampMillis(k.completedAt) >= startTs || (k.type==='event' && getTimestampMillis(k.createdAt) >= startTs));
    const checkRole = (role) => {
        const tCount = fT.filter(t => t.completedBy === role).length;
        const kCount = fK.filter(k => k.caregiver === role).length;
        if (tCount >= 3) return { title: "全能家事王", hint: "本期完成 3 項以上家務" };
        if (kCount >= 3) return { title: "育兒神隊友", hint: "本期有 3 次以上育兒參與" };
        return { title: `再接再厲`, hint: "多參與家務或育兒即可解鎖稱號" };
    };
    return { Kate: checkRole('Kate'), Kai: checkRole('Kai') };
  };

  const finSummary = useMemo(() => {
    const dF = displayFinance;
    const loanTotal = (dF.loans || []).reduce((acc, curr) => acc + (Number(curr.total || 0) - Number(curr.paid || 0)), 0);
    const loanMonthly = (dF.loans || []).reduce((acc, curr) => acc + Number(curr.monthly || 0), 0);
    const householdMonthly = (dF.households || []).filter(h => h.enabled).reduce((acc, curr) => {
        const factor = curr.freq === '雙月繳' ? 0.5 : curr.freq === '季繳' ? 1/3 : curr.freq === '年繳' ? 1/12 : 1;
        return acc + (Number(curr.amount || 0) * factor);
    }, 0);
    const insuranceMonthly = (dF.insurances || []).reduce((acc, curr) => {
        return acc + (curr.freq === '年繳' ? Number(curr.premium || 0)/12 : Number(curr.premium || 0));
    }, 0);
    const insuranceYearly = (dF.insurances || []).reduce((acc, curr) => {
        return acc + (curr.freq === '年繳' ? Number(curr.premium || 0) : Number(curr.premium || 0) * 12);
    }, 0);
    
    return { 
        unpaid: loanTotal, 
        monthly: Math.round(loanMonthly + householdMonthly + insuranceMonthly),
        due: dF.currentMonthDue || 0,
        fixedCount: (dF.households || []).length + (dF.insurances || []).length,
        insMonthly: Math.round(insuranceMonthly),
        insYearly: Math.round(insuranceYearly),
        householdMonthly: Math.round(householdMonthly),
        loanMonthly: Math.round(loanMonthly)
    };
  }, [displayFinance]);

  const HomeView = () => {
    const today = formatToday();
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const ind = getIndicators(weekStart);
    const hon = getHonors(weekStart);
    const [showHint, setShowHint] = useState(false);
    const urgentT = displayTasks.filter(t => t.status !== 'completed' && t.priority === 'High');
    const urgentS = shopping.filter(s => s.status !== 'purchased' && s.isUrgent);
    const urgentP = displayPlans.filter(p => p.priority === 'High' || p.type === '財務');
    const allUrgent = [...urgentT, ...urgentS, ...urgentP];

    return (
      <div className="pb-8 animate-in fade-in duration-500">
        <GlobalHeader title="家庭概覽" currentRole={currentRole} setCurrentView={setCurrentView} />
        <div className="px-6 space-y-8">
          <section className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6" onClick={() => setCurrentView('insights')}>
              <div><h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">家庭健康度 <ChevronRight size={16} className="text-stone-200"/></h3><p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Efficiency Dashboard</p></div>
              <div className="flex flex-col items-end"><div className={`text-3xl font-black ${ind.avg < 60 ? 'text-rose-400' : 'text-emerald-500'}`}>{ind.avg}%</div><button onClick={(e)=>{e.stopPropagation(); setShowHint(!showHint);}} className="text-[9px] font-bold text-stone-300 flex items-center gap-1 uppercase mt-1 tracking-tighter"><Info size={10}/> 計算說明</button></div>
            </div>
            {showHint && (
                <div className="mb-6 p-4 bg-stone-50 rounded-2xl text-[10px] text-stone-500 space-y-1 animate-in slide-in-from-top-2">
                    <p>• <strong>家務：</strong>本期完成數佔比</p><p>• <strong>育兒：</strong>參與度與例行完成度</p><p>• <strong>採買：</strong>緊急處理率與庫存效率</p><p>• <strong>財務：</strong>負擔壓力與預算健康度</p>
                </div>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[ {l:'家務',v:ind.chore,c:'bg-emerald-400'}, {l:'育兒',v:ind.kid,c:'bg-rose-300'}, {l:'採買',v:ind.shop,c:'bg-blue-300'}, {l:'財務',v:ind.fin,c:ind.fin < 70 ? 'bg-rose-400' : 'bg-stone-200'} ].map(i => (
                <div key={i.l} className="space-y-1.5"><div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-tighter"><span>{i.l}</span><span>{i.v}%</span></div><div className="h-1 w-full bg-stone-50 rounded-full overflow-hidden shadow-inner"><div className={`h-full ${i.c} transition-all duration-1000`} style={{ width: `${i.v}%` }} /></div></div>
              ))}
            </div>
          </section>

          {allUrgent.length > 0 && (
            <button onClick={() => setCurrentView('tasks')} className="w-full bg-white border border-rose-100 p-4 rounded-[28px] flex items-center gap-4 active:scale-[0.99] transition-all">
              <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><AlertCircle size={20} /></div>
              <div className="flex-1 text-left"><div className="text-[12px] font-black text-rose-600 mb-0.5">有 {allUrgent.length} 筆緊急事項待關注</div><p className="text-[10px] text-stone-300 font-bold">包含：{urgentT.length > 0 ? '家務 ' : ''}{urgentS.length > 0 ? '採買 ' : ''}{urgentP.length > 0 ? '計畫 ' : ''}</p></div><ChevronRight size={16} className="text-stone-200" />
            </button>
          )}

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">今日執行摘要</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: '今日家務', v: displayTasks.filter(t=>t.dueDate===today && t.status!=='completed').length, c: 'text-emerald-500', i: CheckSquare },
                { l: '今日育兒', v: displayKidTimeline.filter(k=>k.date===today && k.status!=='completed').length, c: 'text-indigo-400', i: Baby },
                { l: '今日採買', v: shopping.filter(s=>s.status!=='purchased').length, c: 'text-blue-400', i: ShoppingBag },
                { l: '今日計畫', v: displayPlans.filter(p=>p.plannedDate===today).length, c: 'text-amber-500', i: Calendar }
              ].map(item => (
                <div key={item.l} className="bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm"><div className={`flex items-center gap-2 mb-2 ${item.c}`}><item.i size={14}/><span className="text-xs font-bold">{item.l}</span></div><div className="text-xl font-black text-stone-700">{item.v} <span className="text-[9px] text-stone-300 font-bold uppercase">項</span></div></div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">本週預覽</h3>
            <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
              {[
                  { l: '本週家務', v: displayTasks.length, s: `${displayTasks.filter(t=>t.status==='completed').length} 已完成` },
                  { l: '本週採買', v: shopping.length, s: `${shopping.filter(s=>s.status!=='purchased').length} 待補` },
                  { l: '本週計畫', v: displayPlans.length, s: `${displayPlans.length} 項排定` }
              ].map(p => (
                  <div key={p.l} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-stone-200"/><span className="text-sm font-bold text-stone-700">{p.l}</span></div><span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{p.s}</span></div>
              ))}
            </div>
          </section>

          <section className="space-y-4 pb-8">
            <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">空間細節提醒</h3>
            <div className="grid gap-3">
              {ROOMS.slice(0,4).map(r => {
                const { info, color } = getRoomCoreStatus(r);
                return (
                    <div key={r} onClick={() => setCurrentView('spaces')} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex justify-between items-center active:bg-stone-50 transition-all">
                        <div className="flex flex-col"><span className="text-sm font-bold text-stone-700">{r}</span><span className={`text-[10px] font-medium mt-0.5 ${color}`}>{info}</span></div><ChevronRight size={14} className="text-stone-200" />
                    </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const InsightsView = () => {
    const [range, setRange] = useState('本週');
    const [viewDate, setViewDate] = useState(new Date());
    const rangeStart = useMemo(() => {
        const d = new Date(viewDate); d.setHours(0,0,0,0);
        if (range === '日') return d;
        if (range === '本週') { const day = d.getDay(); d.setDate(d.getDate() - (day===0?6:day-1)); return d; }
        if (range === '本月') { d.setDate(1); return d; }
        if (range === '本年') { d.setMonth(0, 1); return d; }
        return d;
    }, [range, viewDate]);

    const ind = getIndicators(rangeStart);
    const hon = getHonors(rangeStart);
    const rangeKid = displayKidTimeline.filter(k => getTimestampMillis(k.createdAt || k.completedAt) >= rangeStart.getTime());
    const tvs = rangeKid.filter(e => e.eventId === 'tv');
    const sleeps = rangeKid.filter(e => e.eventId === 'sleep');
    const contrib = useMemo(() => {
        const kCount = displayTasks.filter(t => t.completedBy === 'Kate' && getTimestampMillis(t.completedAt) >= rangeStart.getTime()).length + 
                       displayKidTimeline.filter(k => k.caregiver === 'Kate' && k.status === 'completed' && getTimestampMillis(k.completedAt) >= rangeStart.getTime()).length;
        const iCount = displayTasks.filter(t => t.completedBy === 'Kai' && getTimestampMillis(t.completedAt) >= rangeStart.getTime()).length + 
                       displayKidTimeline.filter(k => k.caregiver === 'Kai' && k.status === 'completed' && getTimestampMillis(k.completedAt) >= rangeStart.getTime()).length;
        const total = kCount + iCount || 1;
        return { Kate: Math.round((kCount/total)*100), Kai: Math.round((iCount/total)*100) };
    }, [displayTasks, displayKidTimeline, rangeStart]);

    const shiftDate = (dir) => {
        const d = new Date(viewDate);
        if (range === '日') d.setDate(d.getDate() + dir);
        if (range === '本週') d.setDate(d.getDate() + dir * 7);
        if (range === '本月') d.setMonth(d.getMonth() + dir);
        if (range === '本年') d.setFullYear(d.getFullYear() + dir);
        setViewDate(d);
    };

    return (
      <div className="pb-8 animate-in fade-in duration-500">
        <GlobalHeader title="家庭分析" currentRole={currentRole} setCurrentView={setCurrentView} />
        <div className="px-6 space-y-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['日', '本週', '本月', '本年'].map(r => (
                <button key={r} onClick={()=>{setRange(r); setViewDate(new Date());}} className={`px-5 py-2 rounded-full text-[11px] font-bold border transition-all ${range===r?'bg-stone-800 text-white shadow-md':'bg-white text-stone-400 border-stone-100'}`}>{r}</button>
            ))}
          </div>

          <div className="flex items-center justify-between bg-stone-50 p-4 rounded-3xl shadow-inner mx-1">
             <button onClick={()=>shiftDate(-1)} className="p-2 bg-white rounded-xl text-stone-400"><ChevronLeft size={16}/></button>
             <span className="text-xs font-bold text-stone-600">{range==='日'?viewDate.toLocaleDateString():range==='本週'?`${rangeStart.toLocaleDateString()} - ${new Date(rangeStart.getTime()+6*24*3600000).toLocaleDateString()}`:range==='本月'?`${viewDate.getFullYear()}年 ${viewDate.getMonth()+1}月`:`${viewDate.getFullYear()}年`}</span>
             <button onClick={()=>shiftDate(1)} className="p-2 bg-white rounded-xl text-stone-400"><ChevronRight size={16}/></button>
          </div>

          <section className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm space-y-6">
             <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-stone-800">家庭健康度總覽</h3><div className={`text-2xl font-black ${ind.avg < 70 ? 'text-amber-500' : 'text-emerald-500'}`}>{ind.avg}%</div></div>
             <div className="grid grid-cols-2 gap-4">
                {[ {l:'家務',v:ind.chore,c:'bg-emerald-400'}, {l:'育兒',v:ind.kid,c:'bg-rose-300'}, {l:'採買',v:ind.shop,c:'bg-blue-300'}, {l:'財務',v:ind.fin,c:ind.fin<70?'bg-rose-400':'bg-stone-200'} ].map(i=>(
                    <div key={i.l} className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100/50 flex flex-col gap-1.5"><div className="flex justify-between items-center"><span className="text-[10px] font-bold text-stone-400 uppercase">{i.l}</span><span className="text-xs font-black text-stone-700">{i.v}%</span></div><div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden"><div className={`h-full ${i.c}`} style={{width:`${i.v}%`}}/></div></div>
                ))}
             </div>
          </section>

          <section className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm space-y-6">
             <div className="flex justify-between items-center"><h3 className="font-bold text-stone-800">默契貢獻度</h3><TrendingUp className="text-emerald-500" size={20}/></div>
             <div className="space-y-4"><div className="h-4 w-full bg-stone-50 rounded-full flex overflow-hidden shadow-inner"><div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${contrib.Kate}%` }} /><div className="bg-blue-300 h-full transition-all duration-1000" style={{ width: `${contrib.Kai}%` }} /></div><div className="flex justify-between text-[10px] font-black text-stone-400 uppercase px-1 tracking-widest"><span>媽媽 {contrib.Kate}%</span><span>爸爸 {contrib.Kai}%</span></div></div>
             <p className="text-[11px] text-stone-400 text-center italic leading-relaxed px-4">{contrib.Kate > 60 ? '本期媽媽負擔較多，隊友加油。' : contrib.Kai > 60 ? '本期爸爸負擔較多，辛苦了。' : '雙方分工非常均勻穩定。'}</p>
          </section>

          <section className="grid grid-cols-2 gap-4">
            {ROLES.map(r => (
              <div key={r} className="bg-white p-5 rounded-[32px] border border-stone-100 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-stone-50 rounded-2xl flex items-center justify-center text-amber-400 mb-2"><Star size={18} className={hon[r].title.includes('再接') ? 'opacity-10' : 'fill-amber-400'} /></div>
                <span className="text-[9px] font-black text-stone-300 uppercase mb-1">{ROLE_DISPLAY[r]}</span><span className="text-xs font-black text-stone-700 h-8 flex items-center">{hon[r].title}</span><p className="text-[8px] text-stone-200 font-medium mt-1 italic">{hon[r].hint}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-4">
             <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4"><h3 className="text-xs font-bold text-stone-800 flex items-center gap-2"><Tv size={16} className="text-blue-400" /> 寶寶電視趨勢</h3><TrendChart data={tvs} type="tv" /></div>
             <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4"><h3 className="text-xs font-bold text-stone-800 flex items-center gap-2"><Moon size={16} className="text-indigo-400" /> 寶寶入睡趨勢</h3><TrendChart data={sleeps} type="sleep" /></div>
          </div>
          <div className="h-8" />
        </div>
      </div>
    );
  };

  const PlansView = () => {
    const [tab, setTab] = useState('plans');
    const [finSubTab, setFinSubTab] = useState('全部'); 
    
    const [planCatTab, setPlanCatTab] = useState('全部');
    const [planViewMode, setPlanViewMode] = useState('week'); 
    const [planSelectedDateStr, setPlanSelectedDateStr] = useState(formatToday());

    const HEALTH_TYPES = ["體檢", "寶寶打疫苗", "看醫生"];
    const GOAL_TYPES = ["目標", "旅遊"];
    const LIFE_TYPES = ["出去走走", "回娘家", "回婆家", "約會", "聚餐", "採買"];

    const getLocalFormatDateStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handlePlanPrev = () => {
        if (planViewMode === 'list') return;
        const d = new Date(planSelectedDateStr);
        if (planViewMode === 'week') d.setDate(d.getDate() - 7);
        else if (planViewMode === 'month') d.setMonth(d.getMonth() - 1);
        else if (planViewMode === 'year') d.setFullYear(d.getFullYear() - 1);
        setPlanSelectedDateStr(getLocalFormatDateStr(d));
    };

    const handlePlanNext = () => {
        if (planViewMode === 'list') return;
        const d = new Date(planSelectedDateStr);
        if (planViewMode === 'week') d.setDate(d.getDate() + 7);
        else if (planViewMode === 'month') d.setMonth(d.getMonth() + 1);
        else if (planViewMode === 'year') d.setFullYear(d.getFullYear() + 1);
        setPlanSelectedDateStr(getLocalFormatDateStr(d));
    };

    const getPlanDateDisplay = () => {
        const d = new Date(planSelectedDateStr);
        if (planViewMode === 'list') return '所有計畫';
        if (planViewMode === 'year') return `${d.getFullYear()}年`;
        if (planViewMode === 'month') return `${d.getFullYear()}年 ${d.getMonth()+1}月`;
        return planSelectedDateStr; 
    };

    const weekDays = useMemo(() => {
        const d = new Date(planSelectedDateStr);
        d.setHours(0,0,0,0);
        const day = d.getDay();
        const diff = d.getDate() - day; 
        const start = new Date(d);
        start.setDate(diff);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const curr = new Date(start);
            curr.setDate(start.getDate() + i);
            days.push(curr);
        }
        return days;
    }, [planSelectedDateStr]);

    const monthDays = useMemo(() => {
        const d = new Date(planSelectedDateStr);
        const year = d.getFullYear();
        const month = d.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for(let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i, 12, 0, 0));
        }
        return days;
    }, [planSelectedDateStr]);

    const yearMonths = useMemo(() => {
        const d = new Date(planSelectedDateStr);
        const year = d.getFullYear();
        const mos = [];
        for(let i=0; i<12; i++) {
            mos.push(new Date(year, i, 1, 12, 0, 0));
        }
        return mos;
    }, [planSelectedDateStr]);

    const hasPlanOnDate = (dStr) => displayPlans.some(p => p.plannedDate === dStr);
    const hasPlanInMonth = (yearStr, monthStr) => displayPlans.some(p => p.plannedDate && p.plannedDate.startsWith(`${yearStr}-${monthStr}`));

    const filteredPlans = useMemo(() => {
        return displayPlans.filter(p => {
            if (planCatTab === '健康' && !HEALTH_TYPES.includes(p.type)) return false;
            if (planCatTab === '目標' && !GOAL_TYPES.includes(p.type)) return false;
            if (planCatTab === '家庭 / 生活' && !LIFE_TYPES.includes(p.type)) return false;
            if (planCatTab === '其他' && (HEALTH_TYPES.includes(p.type) || GOAL_TYPES.includes(p.type) || LIFE_TYPES.includes(p.type))) return false;

            if (planViewMode === 'list') return true;

            const pDate = p.plannedDate;
            if (!pDate) return false;
            
            if (planViewMode === 'week' || planViewMode === 'month') {
                return pDate === planSelectedDateStr;
            }
            if (planViewMode === 'year') {
                const ym = planSelectedDateStr.substring(0, 7);
                return pDate.startsWith(ym);
            }
            return true;
        }).sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate));
    }, [displayPlans, planCatTab, planViewMode, planSelectedDateStr]);

    const listTitle = useMemo(() => {
        if (planViewMode === 'list') return '所有計畫';
        if (planViewMode === 'year') {
            const d = new Date(planSelectedDateStr);
            return `${d.getFullYear()}年 ${d.getMonth() + 1}月 的計畫`;
        }
        return `${planSelectedDateStr} 的計畫`;
    }, [planViewMode, planSelectedDateStr]);

    return (
      <div className="pb-8 animate-in fade-in duration-500 h-full flex flex-col">
        <div className="px-6 pt-10 pb-4 space-y-6 bg-white/60 backdrop-blur-md sticky top-0 z-40">
           <h1 className="text-2xl font-bold text-stone-800">家庭計劃與財務</h1>
           <div className="flex gap-2 p-1 bg-stone-50 rounded-2xl shadow-inner">
             {['plans','finance'].map(t=>(<button key={t} onClick={()=>setTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tab===t?'bg-white text-stone-800 shadow-sm':'text-stone-400'}`}>{t==='plans'?'家庭計劃':'財務管理'}</button>))}
           </div>
        </div>

        <div className="px-6 space-y-6 flex-1">
          {tab === 'plans' ? (
            <div className="space-y-6 pb-8">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['全部', '健康', '目標', '家庭 / 生活', '其他'].map(st => (
                    <button key={st} onClick={() => setPlanCatTab(st)} className={`shrink-0 px-5 py-2 rounded-full text-[10px] font-bold border transition-all ${planCatTab===st?'bg-stone-800 text-white shadow-sm':'bg-white text-stone-400 border-stone-100'}`}>{st}</button>
                ))}
              </div>

              <div className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center px-2">
                      <button onClick={handlePlanPrev} className={`p-2 text-stone-400 hover:text-stone-600 ${planViewMode === 'list' ? 'opacity-30 cursor-not-allowed' : ''}`}><ChevronLeft size={16}/></button>
                      <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-stone-800">{getPlanDateDisplay()}</span>
                          <div className="flex items-center gap-1 mt-2">
                              {['list','week','month','year'].map(vm => (
                                  <button key={vm} onClick={()=>setPlanViewMode(vm)} className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${planViewMode===vm?'bg-stone-800 text-white':'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                                      {vm === 'list' ? '列表' : vm === 'week' ? '週' : vm === 'month' ? '月' : '年'}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <button onClick={handlePlanNext} className={`p-2 text-stone-400 hover:text-stone-600 ${planViewMode === 'list' ? 'opacity-30 cursor-not-allowed' : ''}`}><ChevronRight size={16}/></button>
                  </div>
                  
                  {planViewMode === 'week' && (
                      <div className="flex justify-between items-center px-1">
                          {weekDays.map(d => {
                              const dStr = getLocalFormatDateStr(d);
                              const isSelected = dStr === planSelectedDateStr;
                              const isToday = dStr === formatToday();
                              const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                              const hasPlan = hasPlanOnDate(dStr);
                              return (
                                  <button key={dStr} onClick={() => setPlanSelectedDateStr(dStr)} className={`relative flex flex-col items-center p-2 rounded-2xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}>
                                      <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-stone-300' : isToday ? 'text-rose-400' : ''}`}>{dayName}</span>
                                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-rose-500' : 'text-stone-700'}`}>{d.getDate()}</span>
                                      {hasPlan && <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />}
                                  </button>
                              );
                          })}
                      </div>
                  )}

                  {planViewMode === 'month' && (
                      <div className="grid grid-cols-7 gap-y-2 gap-x-1 px-1">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="text-center text-[8px] font-black text-stone-300 uppercase mb-2">{day}</div>
                          ))}
                          {Array.from({ length: monthDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                          {monthDays.map(d => {
                              const dStr = getLocalFormatDateStr(d);
                              const isSelected = dStr === planSelectedDateStr;
                              const isToday = dStr === formatToday();
                              const hasPlan = hasPlanOnDate(dStr);
                              return (
                                  <button key={dStr} onClick={() => setPlanSelectedDateStr(dStr)} className={`relative flex items-center justify-center h-8 rounded-xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}>
                                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : isToday ? 'text-rose-500' : 'text-stone-700'}`}>{d.getDate()}</span>
                                      {hasPlan && <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />}
                                  </button>
                              );
                          })}
                      </div>
                  )}

                  {planViewMode === 'year' && (
                      <div className="grid grid-cols-4 gap-3 px-1">
                          {yearMonths.map(d => {
                              const yStr = d.getFullYear().toString();
                              const mStr = String(d.getMonth() + 1).padStart(2, '0');
                              const isSelected = planSelectedDateStr.startsWith(`${yStr}-${mStr}`);
                              const hasPlan = hasPlanInMonth(yStr, mStr);
                              const isCurrentMonth = formatToday().startsWith(`${yStr}-${mStr}`);
                              
                              return (
                                  <button key={mStr} onClick={() => {
                                      const newDate = new Date(d);
                                      if (isCurrentMonth) {
                                          setPlanSelectedDateStr(formatToday());
                                      } else {
                                          setPlanSelectedDateStr(getLocalFormatDateStr(newDate));
                                      }
                                  }} className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : isCurrentMonth ? 'text-rose-500' : 'text-stone-700'}`}>{d.getMonth() + 1}月</span>
                                      {hasPlan && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />}
                                  </button>
                              );
                          })}
                      </div>
                  )}
              </div>

              <button onClick={()=>{setModalType('plan'); setEditData(null);}} className="w-full bg-stone-800 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mb-2"><Plus size={18}/> 新增計畫項目</button>
              
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">{listTitle}</h3>
                {filteredPlans.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm flex items-start gap-5 active:scale-[0.99]" onClick={() => { setEditData(p); setModalType('plan'); }}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${p.type === '目標' ? 'bg-amber-50 text-amber-500' : p.type === '旅遊' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        {p.type === '目標' ? <Target size={20}/> : p.type === '旅遊' ? <Plane size={20}/> : <Calendar size={20}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1"><span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{p.type}</span><button onClick={(e)=>{e.stopPropagation(); if(!p.id.startsWith('d')) deleteItem('plans', p.id); else showToast("示範資料不可刪除");}} className="text-stone-100 hover:text-rose-400"><X size={16}/></button></div>
                        <h4 className="font-bold text-stone-800 text-base truncate">{p.title}</h4>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <p className="text-[10px] text-stone-400 font-medium flex items-center gap-1"><Clock size={10}/> {p.plannedDate}</p>
                          {p.locationName && <p className="text-[10px] text-stone-400 font-medium flex items-center gap-1"><MapPin size={10}/> {p.locationName}</p>}
                        </div>
                        {p.participants && p.participants.length > 0 && <div className="mt-2 flex gap-1">{p.participants.map(part=>(<span key={part} className="text-[8px] bg-stone-50 border border-stone-100 text-stone-500 px-1.5 py-0.5 rounded-lg font-bold">{ROLE_DISPLAY[part] || part}</span>))}</div>}
                        
                        {(p.type === '旅遊' || p.type === '目標' || p.totalBudget > 0) ? (
                            <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-100/60">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">預算總額</span>
                                        {(p.adultCount > 0 || p.kidCount > 0) && <span className="text-[8px] text-stone-300 font-medium">{p.adultCount}大 {p.kidCount}小</span>}
                                    </div>
                                    <span className="text-xs font-black text-stone-700">NT$ {(p.totalBudget || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : p.cost > 0 ? (
                            <div className="mt-2 flex justify-end items-center gap-1"><span className="text-[9px] font-bold text-stone-300 uppercase">費用</span><span className="text-xs font-black text-stone-600">NT$ {Number(p.cost).toLocaleString()}</span></div>
                        ) : null}
                      </div>
                    </div>
                ))}
                {filteredPlans.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center text-stone-300 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-100">
                        <Calendar size={24} className="mb-2 opacity-20"/>
                        <p className="text-[10px] font-bold uppercase">目前沒有符合的計畫</p>
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['全部','貸款','保險','家用'].map(st=>(<button key={st} onClick={()=>setFinSubTab(st)} className={`px-5 py-2 rounded-full text-[10px] font-bold border transition-all ${finSubTab===st?'bg-stone-800 text-white shadow-sm':'bg-white text-stone-400 border-stone-100'}`}>{st}</button>))}
              </div>

              <div className="bg-stone-800 p-6 rounded-[32px] text-white shadow-xl">
                  {finSubTab === '全部' && (
                    <>
                      <p className="text-[10px] opacity-40 font-bold uppercase mb-1">月平均總支出</p>
                      <p className="text-3xl font-black text-white/90">NT$ {finSummary.monthly.toLocaleString()}</p>
                      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div><p className="text-[9px] opacity-40 uppercase font-bold">總債務</p><p className="text-sm font-black text-rose-300">NT$ {finSummary.unpaid.toLocaleString()}</p></div>
                        <div><p className="text-[9px] opacity-40 uppercase font-bold">預估年總額</p><p className="text-sm font-black text-white/70">NT$ {(finSummary.monthly * 12).toLocaleString()}</p></div>
                      </div>
                    </>
                  )}
                  {finSubTab === '貸款' && (
                    <>
                      <p className="text-[10px] opacity-40 font-bold uppercase mb-1">貸款未還總額</p>
                      <p className="text-3xl font-black text-rose-300">NT$ {finSummary.unpaid.toLocaleString()}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between"><div className="text-xs opacity-60 font-bold">每月還款總計：NT${finSummary.loanMonthly.toLocaleString()}</div></div>
                    </>
                  )}
                  {finSubTab === '保險' && (
                    <>
                      <p className="text-[10px] opacity-40 font-bold uppercase mb-1">月平均保費支出</p>
                      <p className="text-3xl font-black text-white/90">NT$ {finSummary.insMonthly.toLocaleString()}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between"><div className="text-xs opacity-60 font-bold">年繳總支出：NT${finSummary.insYearly.toLocaleString()}</div><div className="text-xs opacity-60">份數：{(displayFinance.insurances||[]).length}</div></div>
                    </>
                  )}
                  {finSubTab === '家用' && (
                    <>
                      <p className="text-[10px] opacity-40 font-bold uppercase mb-1">月固定家用成本</p>
                      <p className="text-3xl font-black text-white/90">NT$ {finSummary.householdMonthly.toLocaleString()}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between"><div className="text-xs opacity-60 font-bold">項目數：{(displayFinance.households||[]).filter(h=>h.enabled).length}</div><div className="text-xs opacity-60">本月預計：NT${finSummary.due.toLocaleString()}</div></div>
                    </>
                  )}
              </div>

              {finSubTab === '全部' && (
                <div className="space-y-6">
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 flex justify-between items-center"><span>貸款概況</span><span className="text-stone-300">NT${finSummary.loanMonthly.toLocaleString()}/月</span></h4>
                    <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex justify-between items-center"><span className="text-xs font-bold text-stone-700">未還餘額總計</span><span className="text-xs font-black text-rose-400">NT${finSummary.unpaid.toLocaleString()}</span></div>
                  </section>
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 flex justify-between items-center"><span>保險概況</span><span className="text-stone-300">NT${finSummary.insMonthly.toLocaleString()}/月</span></h4>
                    <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex justify-between items-center"><span className="text-xs font-bold text-stone-700">年繳總保費</span><span className="text-xs font-black text-stone-500">NT${finSummary.insYearly.toLocaleString()}</span></div>
                  </section>
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1 flex justify-between items-center"><span>家用概況</span><span className="text-stone-300">NT${finSummary.householdMonthly.toLocaleString()}/月</span></h4>
                    <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex justify-between items-center"><span className="text-xs font-bold text-stone-700">本月待付款</span><span className="text-xs font-black text-stone-700">NT${finSummary.due.toLocaleString()}</span></div>
                  </section>
                </div>
              )}

              {finSubTab === '貸款' && (
                <div className="space-y-4">
                  <button onClick={()=>setModalType('add-loan')} className="w-full py-4 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 text-xs font-bold active:bg-stone-50 transition-all">+ 新增貸款項目</button>
                  {(displayFinance.loans || []).map(l => (
                    <div key={l.id} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex justify-between items-center group active:scale-[0.99] transition-all" onClick={()=>{setEditData(l); setModalType('edit-loan');}}>
                        <div><h5 className="font-bold text-stone-800">{l.name}</h5><p className="text-[10px] text-stone-400 uppercase mt-0.5">總計 {Number(l.total).toLocaleString()} / 月還 {Number(l.monthly).toLocaleString()}</p></div>
                        <div className="flex items-center gap-3"><div className="text-right"><p className="text-[9px] font-bold text-stone-300 uppercase">剩餘</p><p className="text-xs font-black text-rose-300">NT${(l.total - (l.paid||0)).toLocaleString()}</p></div><ChevronRight size={14} className="text-stone-100"/></div>
                    </div>
                  ))}
                </div>
              )}

              {finSubTab === '保險' && (
                <div className="space-y-4">
                  <button onClick={()=>setModalType('add-insurance')} className="w-full py-4 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 text-xs font-bold active:bg-stone-50 transition-all">+ 新增保險項目</button>
                  {(displayFinance.insurances || []).map(i => (
                    <div key={i.id} className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm group active:scale-[0.99] transition-all" onClick={()=>{setEditData(i); setModalType('edit-insurance');}}>
                        <div className="flex justify-between items-start mb-3"><div className="flex gap-3"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><ShieldAlert size={20}/></div><div><h5 className="font-bold text-stone-800">{i.name}</h5><p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{i.company}</p></div></div><div className="text-right">{i.freq === '年繳' && <span className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">月均 NT${Math.round(i.premium/12).toLocaleString()}</span>}</div></div>
                        <div className="pt-3 border-t border-stone-50 flex justify-between items-end"><div className="text-[11px] text-stone-600 font-black">NT$ {Number(i.premium).toLocaleString()} <span className="text-[9px] text-stone-300 font-medium ml-1">/ {i.freq}</span></div><div className="text-[9px] text-stone-300 font-medium">到期：{i.expiry}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {finSubTab === '家用' && (
                <div className="space-y-4">
                  <button onClick={()=>setModalType('add-household')} className="w-full py-4 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 text-xs font-bold active:bg-stone-50 transition-all">+ 新增家用項目</button>
                  {(displayFinance.households || []).map(h => (
                    <div key={h.id} className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex justify-between items-center group active:scale-[0.99] transition-all" onClick={()=>{setEditData(h); setModalType('edit-household');}}>
                        <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${h.enabled ? 'bg-emerald-50 text-emerald-500':'bg-stone-50 text-stone-200'}`}><CreditCard size={16}/></div><div><h5 className={`text-sm font-bold ${h.enabled?'text-stone-800':'text-stone-300 line-through'}`}>{h.name}</h5><p className="text-[10px] text-stone-400">NT${Number(h.amount).toLocaleString()} · {h.freq}</p></div></div>
                        <div className="flex flex-col items-end"><p className="text-[8px] font-bold text-stone-300 uppercase tracking-tighter">下次：{h.dueDate || h.nextDueDate || '未定'}</p><ChevronRight size={14} className="text-stone-100 mt-0.5"/></div>
                    </div>
                  ))}
                </div>
              )}
              
              <section className="pt-6 border-t border-stone-100"><h4 className="text-[10px] font-bold text-stone-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><History size={14}/> 異動紀錄 (唯讀)</h4><div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pb-4">{financeLogs.length > 0 ? financeLogs.slice(0,10).map(log => (<div key={log.id} className="bg-stone-50/50 p-3 rounded-xl flex justify-between items-center text-[9px] text-stone-400 border border-stone-100/50"><div><span className="font-bold text-stone-600 mr-2">{ROLE_DISPLAY[log.role]}</span><span>{log.action}{log.field}: {log.item}</span></div><div className="text-right"><p className="opacity-40">{formatDateTime(log.createdAt)}</p></div></div>)) : <p className="text-center py-4 text-[9px] text-stone-300">目前尚無更新紀錄</p>}</div></section>
            </div>
          )}
          <div className="h-8" />
        </div>
      </div>
    );
  };

  const SpacesView = () => (
    <TasksView displayTasks={displayTasks} currentRole={currentRole} saveDoc={saveDoc} setEditData={setEditData} setModalType={setModalType} ROLE_DISPLAY={ROLE_DISPLAY} setCurrentView={setCurrentView} routines={routines.filter(r => r.scope === 'task')} defaultTab="spaces" />
  );

  const Modal = () => {
    const [form, setForm] = useState({ 
        participants: [], 
        type: '出去走走', 
        transportCost: 0, 
        hotelCost: 0, 
        foodCost: 0, 
        adultCount: 2, 
        kidCount: 1, 
        adultUnitCost: 0, 
        kidUnitCost: 0, 
        totalBudget: 0,
        cost: '',
        priority: 'Medium',
        dueDate: formatToday(),
        assignee: '未指派',
        caregiver: currentRole,
        date: formatToday(),
        eventId: 'tv',
        value: ''
    });

    const [qaList, setQaList] = useState(() => JSON.parse(localStorage.getItem('kid_quick_actions')) || [
        { id: 'tv', name: '電視', icon: 'Tv' },
        { id: 'sleep', name: '入睡', icon: 'Moon' },
        { id: 'nap', name: '午睡', icon: 'Moon' },
        { id: 'snack', name: '零食', icon: 'Coffee' },
        { id: 'pickup', name: '接送', icon: 'MapPin' },
        { id: 'nail', name: '剪指甲', icon: 'Baby' }
    ]);

    useEffect(() => {
        localStorage.setItem('kid_quick_actions', JSON.stringify(qaList));
    }, [qaList]);

    useEffect(() => {
        if (editData) {
            setForm({ ...editData });
        } else {
            const base = { 
                assignee: currentRole || 'Kate', 
                room: '客廳', 
                category: '清潔', 
                priority: 'Medium', 
                status: 'pending', 
                dueDate: formatToday(), 
                plannedDate: formatToday(), 
                type: '出去走走', 
                participants: [currentRole || 'Kate'], 
                transportCost: 0, 
                hotelCost: 0, 
                foodCost: 0, 
                adultCount: 2, 
                kidCount: 1, 
                adultUnitCost: 0, 
                kidUnitCost: 0, 
                totalBudget: 0,
                cost: '',
                date: formatToday(),
                caregiver: currentRole || 'Kate',
                eventId: 'tv',
                value: '',
                note: ''
            };
            if (modalType === 'task') setForm(base);
            if (modalType === 'routine') setForm({ ...base, repeatType: 'daily', isActive: true });
            if (modalType === 'plan') setForm(base);
            if (modalType === 'kid-event') setForm({ ...base, type: 'event' });
        }
    }, [modalType, editData, currentRole]);

    useEffect(() => {
        if (form.type === '旅遊' || form.type === '目標') {
            const calculatedTotal = 
                Number(form.transportCost || 0) + 
                Number(form.hotelCost || 0) + 
                Number(form.foodCost || 0) + 
                (Number(form.adultCount || 0) * Number(form.adultUnitCost || 0)) + 
                (Number(form.kidCount || 0) * Number(form.kidUnitCost || 0));
            if (calculatedTotal !== form.totalBudget) setForm(prev => ({ ...prev, totalBudget: calculatedTotal }));
        }
    }, [form.transportCost, form.hotelCost, form.foodCost, form.adultCount, form.kidCount, form.adultUnitCost, form.kidUnitCost, form.type]);

    const handleFinanceSubmit = (category) => {
        const id = editData?.id || Date.now();
        const action = editData ? '編輯' : '新增';
        const newData = { ...form, id };
        let updatedFinance = { ...finance };
        if (category === 'loan') updatedFinance.loans = editData ? (finance.loans||[]).map(l => l.id === id ? newData : l) : [...(finance.loans||[]), newData];
        if (category === 'insurance') updatedFinance.insurances = editData ? (finance.insurances||[]).map(i => i.id === id ? newData : i) : [...(finance.insurances||[]), newData];
        if (category === 'household') updatedFinance.households = editData ? (finance.households||[]).map(h => h.id === id ? newData : h) : [...(finance.households||[]), newData];
        saveFinanceWithLog(updatedFinance, [{ field: category === 'loan' ? '貸款' : category === 'insurance' ? '保險' : '家用', action, item: form.name, oldVal: editData?.total || editData?.premium || editData?.amount || 0, newVal: form.total || form.premium || form.amount }]);
    };

    const handlePlanSubmit = (e) => {
        e.preventDefault();
        saveDoc('plans', form);
    };

    const isCustomEvent = !qaList.some(q => q.id === form.eventId);

    const inputClass = "w-full h-14 p-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-700 outline-none focus:bg-white focus:border-stone-200 transition-all appearance-none";

    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in" onClick={() => { setModalType(null); setEditData(null); }}>
        <div className="bg-white w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] h-[92vh] sm:h-auto overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="px-8 py-6 flex justify-between items-center border-b border-stone-100">
            <h2 className="text-xl font-black text-stone-800 uppercase tracking-widest leading-none">管理項目</h2>
            <button onClick={() => { setModalType(null); setEditData(null); }} className="p-2.5 bg-stone-50 rounded-2xl text-stone-400 hover:text-stone-800 transition-colors"><X size={22}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar pb-32">
            {modalType === 'task' && (() => {
                const roomTemplates = CHORE_TEMPLATES[form.room] || [];
                const CATEGORIES = ['清潔', '收納', '洗滌', '廚務', '補貨', '維護', '其他'];
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase px-1">執行空間</label>
                            <select value={form.room||'客廳'} onChange={e=>setForm({...form,room:e.target.value})} className={inputClass}>{ROOMS.map(r=>(<option key={r} value={r}>{r}</option>))}</select>
                        </div>
                        {roomTemplates.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 pb-2">
                                {roomTemplates.map(rt => (
                                    <button type="button" key={rt.title} onClick={() => setForm({...form, title: rt.title, category: rt.category || form.category})} className="shrink-0 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold active:scale-95 transition-all">
                                        {rt.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase px-1">家務標題</label>
                            <input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} className={inputClass} placeholder="輸入標題..."/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase px-1">類別</label>
                            <div className="flex flex-wrap gap-2 mb-2 px-1">
                                {CATEGORIES.map(c => (
                                    <button type="button" key={c} onClick={() => setForm({...form, category: c})} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.category === c ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <input value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})} className={inputClass} placeholder="自行輸入類別..."/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">到期日期</label><input type="date" value={form.dueDate||''} onChange={e=>setForm({...form,dueDate:e.target.value})} className={inputClass}/></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">優先程度</label><select value={form.priority||'Medium'} onChange={e=>setForm({...form,priority:e.target.value})} className={inputClass}><option value="High">高 (High)</option><option value="Medium">中 (Medium)</option><option value="Low">低 (Low)</option></select></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase px-1">負責人</label>
                            <select value={form.assignee||''} onChange={e=>setForm({...form,assignee:e.target.value})} className={inputClass}>
                                {ROLES.map(r=>(<option key={r} value={r}>{ROLE_DISPLAY[r]}</option>))}
                                <option value="共同">共同</option>
                                <option value="未指派">未指派</option>
                            </select>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">備註說明</label><textarea value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium text-stone-600 text-sm" placeholder="備註說明..." rows="3"/></div>
                        <button onClick={()=>saveDoc('tasks', form)} className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">儲存家務項目</button>
                    </div>
                );
            })()}

            {modalType === 'task-routine-manager' && (() => {
                const taskRoutines = routines.filter(r => r.scope === 'task');
                const [localForm, setLocalForm] = useState({ title: '', room: '客廳', category: '清潔', type: 'daily', isActive: true });
                const [editingId, setEditingId] = useState(null);

                const handleSaveTRoutine = async () => {
                    if (!localForm.title.trim()) return;
                    const payload = { ...localForm, scope: 'task', updatedAt: Timestamp.now() };
                    if (editingId) {
                        await updateDoc(doc(db, `artifacts/${appId}/public/data/${householdId}_routines`, editingId), payload);
                    } else {
                        await addDoc(collection(db, `artifacts/${appId}/public/data/${householdId}_routines`), { ...payload, createdAt: Timestamp.now() });
                    }
                    setLocalForm({ title: '', room: '客廳', category: '清潔', type: 'daily', isActive: true });
                    setEditingId(null);
                };

                const handleDelTRoutine = async (id) => {
                    if(String(id).startsWith('d')) return;
                    await deleteDoc(doc(db, `artifacts/${appId}/public/data/${householdId}_routines`, id));
                };

                const inputCls = "w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold text-stone-700 text-sm outline-none";

                return (
                    <div className="space-y-6">
                        <div className="space-y-4 bg-stone-50/50 p-5 rounded-3xl border border-stone-100">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">{editingId ? '編輯家務例行' : '新增家務例行'}</h3>
                            <input value={localForm.title} onChange={e=>setLocalForm({...localForm, title: e.target.value})} className={inputCls} placeholder="例行名稱..." />
                            <div className="grid grid-cols-2 gap-2">
                                <select value={localForm.room} onChange={e=>setLocalForm({...localForm, room: e.target.value})} className={inputCls}>{ROOMS.map(r=>(<option key={r} value={r}>{r}</option>))}</select>
                                <input value={localForm.category} onChange={e=>setLocalForm({...localForm, category: e.target.value})} className={inputCls} placeholder="類別..." />
                            </div>
                            <div className="flex gap-2">
                                {['daily','weekday','weekend'].map(t => (
                                    <button key={t} type="button" onClick={()=>setLocalForm({...localForm, type: t})} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${localForm.type === t ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-100'}`}>
                                        {t === 'daily' ? '每日' : t === 'weekday' ? '平日' : '假日'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100">
                                <span className="text-xs font-bold text-stone-700">是否啟用</span>
                                <button type="button" onClick={()=>setLocalForm({...localForm, isActive: !localForm.isActive})} className={`w-12 h-6 rounded-full relative transition-all ${localForm.isActive?'bg-emerald-400':'bg-stone-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localForm.isActive?'left-7':'left-1'}`}/></button>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {editingId && <button type="button" onClick={()=>{setEditingId(null); setLocalForm({title:'', room:'客廳', category:'清潔', type:'daily', isActive:true});}} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">取消</button>}
                                <button type="button" onClick={handleSaveTRoutine} className="flex-[2] py-3 bg-stone-800 text-white rounded-xl font-bold text-xs">{editingId ? '更新' : '新增'}</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">目前家務例行清單</h3>
                            {taskRoutines.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                                    <div>
                                        <h4 className={`text-sm font-bold ${r.isActive ? 'text-stone-800' : 'text-stone-400 line-through'}`}>{r.title}</h4>
                                        <p className="text-[10px] text-stone-400 mt-0.5">{r.room} · {r.type === 'daily' ? '每日' : r.type === 'weekday' ? '平日' : r.type === 'weekend' ? '假日' : '未定'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={()=>{setEditingId(r.id); setLocalForm({title:r.title, room:r.room||'客廳', category:r.category||'清潔', type:r.type||'daily', isActive:r.isActive});}} className="p-2 text-blue-400 bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                                        <button type="button" onClick={()=>handleDelTRoutine(r.id)} className="p-2 text-rose-400 bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {taskRoutines.length === 0 && <p className="text-xs text-stone-400 text-center py-4">尚無家務例行</p>}
                        </div>
                    </div>
                );
            })()}

            {modalType === 'kid-event' && (
                <div className="space-y-6">
                    {form.type === 'routine' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase px-1">例行項目</label>
                                <div className={inputClass + " flex items-center bg-stone-100/50"}>{form.title}</div>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">記錄數值 / 時間</label><input value={form.value||''} onChange={e=>setForm({...form,value:e.target.value})} className={inputClass} placeholder="如：30 分鐘 或 21:30"/></div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase px-1 flex justify-between items-center">
                                    <span>紀錄類別</span>
                                    <button type="button" onClick={() => setModalType('qa-manager')} className="text-blue-400 p-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"><Settings size={12}/></button>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {qaList.map(qa => (
                                        <button
                                            type="button"
                                            key={qa.id}
                                            onClick={() => setForm({ ...form, eventId: qa.id })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${form.eventId === qa.id ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-400 border-stone-100 active:scale-95'}`}
                                        >
                                            {qa.name}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, eventId: '' })}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isCustomEvent ? 'bg-stone-800 text-white border-stone-800 shadow-md' : 'bg-white text-stone-400 border-stone-100 active:scale-95'}`}
                                    >
                                        自訂事件...
                                    </button>
                                </div>
                            </div>
                            {isCustomEvent && (
                                <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase px-1">自訂事件名稱</label>
                                    <input value={form.eventId || ''} onChange={e=>setForm({...form,eventId:e.target.value})} className={inputClass} placeholder="輸入自訂事件名稱" />
                                </div>
                            )}
                            {form.eventId === 'tv' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">開始時間</label><input type="time" value={form.startTime||''} onChange={e=>setForm({...form,startTime:e.target.value})} className={inputClass}/></div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase px-1">結束時間</label>
                                        <div className="flex gap-2">
                                            <input type="time" value={form.endTime||''} onChange={e=>setForm({...form,endTime:e.target.value})} className={inputClass + " flex-1"}/>
                                            <button type="button" onClick={() => {
                                                const now = new Date();
                                                const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
                                                setForm({...form, endTime: hhmm});
                                            }} className="shrink-0 px-3 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl border border-indigo-100 active:scale-95 leading-tight">帶入<br/>時間</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">記錄數值 / 時間</label><input value={form.value||''} onChange={e=>setForm({...form,value:e.target.value})} className={inputClass} placeholder="如：30 分鐘 或 21:30"/></div>
                            )}
                        </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">日期</label><input type="date" value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">記錄人</label><select value={form.caregiver||''} onChange={e=>setForm({...form,caregiver:e.target.value})} className={inputClass}>{ROLES.map(r=>(<option key={r} value={r}>{ROLE_DISPLAY[r]}</option>))}</select></div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">細節備註</label><textarea value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium text-stone-600 text-sm" placeholder="細節備註..." rows="3"/></div>
                    <button onClick={()=>saveDoc('kidTimeline', form)} className="w-full py-5 bg-rose-400 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-transform">儲存育兒紀錄</button>
                </div>
            )}

            {modalType === 'kid-routine-manager' && (() => {
                const [localForm, setLocalForm] = useState({ title: '', type: 'weekday', isActive: true });
                const [editingId, setEditingId] = useState(null);

                const handleSaveRoutine = async () => {
                    if (!localForm.title.trim()) return;
                    const payload = { ...localForm, updatedAt: Timestamp.now() };
                    if (editingId) {
                        await updateDoc(doc(db, `artifacts/${appId}/public/data/${householdId}_routines`, editingId), payload);
                    } else {
                        await addDoc(collection(db, `artifacts/${appId}/public/data/${householdId}_routines`), { ...payload, createdAt: Timestamp.now() });
                    }
                    setLocalForm({ title: '', type: 'weekday', isActive: true });
                    setEditingId(null);
                };

                const handleDelRoutine = async (id) => {
                    if(String(id).startsWith('d')) return;
                    await deleteDoc(doc(db, `artifacts/${appId}/public/data/${householdId}_routines`, id));
                };

                const inputCls = "w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold text-stone-700 text-sm outline-none";
                const kidRoutines = routines.filter(r => r.scope !== 'task');

                return (
                    <div className="space-y-6">
                        <div className="space-y-4 bg-stone-50/50 p-5 rounded-3xl border border-stone-100">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">{editingId ? '編輯育兒例行' : '新增育兒例行'}</h3>
                            <input value={localForm.title} onChange={e=>setLocalForm({...localForm, title: e.target.value})} className={inputCls} placeholder="例行名稱..." />
                            <div className="flex gap-2">
                                {['daily','weekday','weekend'].map(t => (
                                    <button key={t} type="button" onClick={()=>setLocalForm({...localForm, type: t})} className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${localForm.type === t ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-100'}`}>
                                        {t === 'daily' ? '每日' : t === 'weekday' ? '平日' : '假日'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100">
                                <span className="text-xs font-bold text-stone-700">是否啟用</span>
                                <button type="button" onClick={()=>setLocalForm({...localForm, isActive: !localForm.isActive})} className={`w-12 h-6 rounded-full relative transition-all ${localForm.isActive?'bg-emerald-400':'bg-stone-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localForm.isActive?'left-7':'left-1'}`}/></button>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {editingId && <button type="button" onClick={()=>{setEditingId(null); setLocalForm({title:'', type:'weekday', isActive:true});}} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">取消</button>}
                                <button type="button" onClick={handleSaveRoutine} className="flex-[2] py-3 bg-stone-800 text-white rounded-xl font-bold text-xs">{editingId ? '更新' : '新增'}</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">目前育兒例行清單</h3>
                            {kidRoutines.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                                    <div>
                                        <h4 className={`text-sm font-bold ${r.isActive ? 'text-stone-800' : 'text-stone-400 line-through'}`}>{r.title}</h4>
                                        <p className="text-[10px] text-stone-400 mt-0.5">{r.type === 'daily' ? '每日' : r.type === 'weekday' ? '平日' : r.type === 'weekend' ? '假日' : '未定'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={()=>{setEditingId(r.id); setLocalForm({title:r.title, type:r.type||'daily', isActive:r.isActive});}} className="p-2 text-blue-400 bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                                        <button type="button" onClick={()=>handleDelRoutine(r.id)} className="p-2 text-rose-400 bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                            {kidRoutines.length === 0 && <p className="text-xs text-stone-400 text-center py-4">尚無自訂例行，目前使用系統預設</p>}
                        </div>
                    </div>
                );
            })()}

            {modalType === 'kid-quick-manager' && (() => {
                const [localForm, setLocalForm] = useState({ id: '', name: '' });
                const [editingIndex, setEditingIndex] = useState(-1);

                const handleSaveQa = () => {
                    if (!localForm.name.trim()) return;
                    const newList = [...qaList];
                    if (editingIndex >= 0) {
                        newList[editingIndex] = { ...newList[editingIndex], name: localForm.name };
                    } else {
                        newList.push({ id: 'qa_' + Date.now(), name: localForm.name, icon: 'Sparkles' });
                    }
                    setQaList(newList);
                    setEditingIndex(-1);
                    setLocalForm({ id: '', name: '' });
                };

                const handleDelQa = (idx) => {
                    setQaList(qaList.filter((_, i) => i !== idx));
                };

                const inputCls = "w-full p-3 bg-stone-50 border border-stone-100 rounded-xl font-bold text-stone-700 text-sm outline-none";

                return (
                    <div className="space-y-6">
                        <div className="space-y-4 bg-stone-50/50 p-5 rounded-3xl border border-stone-100">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">{editingIndex >= 0 ? '編輯快選' : '新增快選'}</h3>
                            <input value={localForm.name} onChange={e=>setLocalForm({...localForm, name: e.target.value})} className={inputCls} placeholder="快選名稱..." />
                            <div className="flex gap-2 pt-2">
                                {editingIndex >= 0 && <button type="button" onClick={()=>{setEditingIndex(-1); setLocalForm({id:'', name:''});}} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">取消</button>}
                                <button type="button" onClick={handleSaveQa} className="flex-[2] py-3 bg-stone-800 text-white rounded-xl font-bold text-xs">{editingIndex >= 0 ? '更新' : '新增'}</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-stone-400 uppercase">目前快選項目</h3>
                            {qaList.map((qa, i) => (
                                <div key={qa.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                                    <h4 className="text-sm font-bold text-stone-800">{qa.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={()=>{setEditingIndex(i); setLocalForm({id:qa.id, name:qa.name});}} className="p-2 text-blue-400 bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                                        <button type="button" onClick={()=>handleDelQa(i)} className="p-2 text-rose-400 bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {['shopping-routine-manager', 'task-quick-manager'].includes(modalType) && (
                <div className="py-12 flex flex-col items-center justify-center text-stone-300">
                    <Settings size={32} className="mb-4 opacity-20"/>
                    <p className="text-sm font-bold uppercase tracking-widest text-stone-400">功能開發中</p>
                    <p className="text-[10px] font-medium mt-2">此設定介面即將開放</p>
                </div>
            )}

            {modalType?.includes('loan') && (
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">貸款名稱</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className={inputClass} placeholder="房貸、信貸..."/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">貸款總額</label><input type="number" value={form.total||''} onChange={e=>setForm({...form,total:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">已還金額</label><input type="number" value={form.paid||''} onChange={e=>setForm({...form,paid:e.target.value})} className={inputClass}/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">每月還款</label><input type="number" value={form.monthly||''} onChange={e=>setForm({...form,monthly:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">年利率 (%)</label><input type="number" value={form.rate||''} onChange={e=>setForm({...form,rate:e.target.value})} className={inputClass}/></div>
                    </div>
                    <textarea value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium text-stone-600 text-sm" placeholder="備註..." rows="3"/>
                    <button onClick={()=>handleFinanceSubmit('loan')} className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">儲存貸款項目</button>
                </div>
            )}

            {modalType?.includes('insurance') && (
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">保單名稱</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className={inputClass} placeholder="醫療險, 人壽險..."/></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">保險公司</label><input value={form.company||''} onChange={e=>setForm({...form,company:e.target.value})} className={inputClass}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">保費金額</label><input type="number" value={form.premium||''} onChange={e=>setForm({...form,premium:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">繳費頻率</label><select value={form.freq||'年繳'} onChange={e=>setForm({...form,freq:e.target.value})} className={inputClass}><option>年繳</option><option>月繳</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">保障額度</label><input value={form.coverage||''} onChange={e=>setForm({...form,coverage:e.target.value})} className={inputClass} placeholder="100萬..."/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">到期日</label><input type="date" value={form.expiry||''} onChange={e=>setForm({...form,expiry:e.target.value})} className={inputClass}/></div>
                    </div>
                    <button onClick={()=>handleFinanceSubmit('insurance')} className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">儲存保險項目</button>
                </div>
            )}

            {modalType?.includes('household') && (
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">項目名稱</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className={inputClass} placeholder="水費, 網費..."/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">金額</label><input type="number" value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">繳費頻率</label><select value={form.freq||'月繳'} onChange={e=>setForm({...form,freq:e.target.value})} className={inputClass}><option>月繳</option><option>雙月繳</option><option>季繳</option><option>年繳</option></select></div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">下次扣款日</label><input type="date" value={form.dueDate||''} onChange={e=>setForm({...form,dueDate:e.target.value})} className={inputClass}/></div>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100"><span className="text-sm font-bold text-stone-700 flex-1">是否啟用此項目</span><button onClick={()=>setForm({...form, enabled: !form.enabled})} className={`w-14 h-8 rounded-full relative transition-all ${form.enabled ? 'bg-emerald-400' : 'bg-stone-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.enabled ? 'left-7' : 'left-1'}`}/></button></div>
                    <button onClick={()=>handleFinanceSubmit('household')} className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">儲存家用支出</button>
                </div>
            )}

            {modalType === 'plan' && (
                <form onSubmit={handlePlanSubmit} className="space-y-6">
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">計畫標題</label><input required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} className={inputClass} placeholder="輸入標題..."/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">日期</label><input type="date" value={form.plannedDate||''} onChange={e=>setForm({...form,plannedDate:e.target.value})} className={inputClass}/></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">計畫類別</label><select value={form.type||'出去走走'} onChange={e=>setForm({...form,type:e.target.value})} className={inputClass}>{PLAN_TYPES.map(t=>(<option key={t} value={t}>{t}</option>))}</select></div>
                    </div>
                    
                    {(form.type === '旅遊' || form.type === '目標') ? (
                        <div className="p-6 bg-blue-50/40 rounded-[32px] border border-blue-100/60 space-y-5 animate-in slide-in-from-top-2 duration-300">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                {form.type === '目標' ? <Target size={14}/> : <Plane size={14}/>} {form.type}預算規劃
                            </h4>
                            <div className="space-y-2"><label className="text-[9px] font-bold text-blue-400 uppercase px-1">目的地</label><input value={form.locationName||''} onChange={e=>setForm({...form,locationName:e.target.value})} className="w-full p-3 bg-white border border-blue-100 rounded-xl font-bold" placeholder="目的地名稱..."/></div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1"><span className="text-[8px] font-bold text-stone-400 uppercase">交通費</span><input type="number" value={form.transportCost||''} onChange={e=>setForm({...form,transportCost:e.target.value})} className="w-full p-2 bg-white border border-stone-100 rounded-xl text-xs font-bold"/></div>
                                <div className="space-y-1"><span className="text-[8px] font-bold text-stone-400 uppercase">住宿費</span><input type="number" value={form.hotelCost||''} onChange={e=>setForm({...form,hotelCost:e.target.value})} className="w-full p-2 bg-white border border-stone-100 rounded-xl text-xs font-bold"/></div>
                                <div className="space-y-1"><span className="text-[8px] font-bold text-stone-400 uppercase">預估食費</span><input type="number" value={form.foodCost||''} onChange={e=>setForm({...form,foodCost:e.target.value})} className="w-full p-2 bg-white border border-stone-100 rounded-xl text-xs font-bold"/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-3 bg-white/60 rounded-2xl border border-blue-100/40">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-stone-400">大人數</span><input type="number" value={form.adultCount||0} onChange={e=>setForm({...form,adultCount:e.target.value})} className="w-12 text-center text-xs font-bold bg-transparent border-b border-stone-200"/></div>
                                    <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-stone-400">每人費用</span><input type="number" value={form.adultUnitCost||0} onChange={e=>setForm({...form,adultUnitCost:e.target.value})} className="w-16 text-right text-xs font-bold bg-transparent border-b border-stone-200"/></div>
                                </div>
                                <div className="space-y-3 border-l border-blue-100/40 pl-4">
                                    <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-stone-400">小孩數</span><input type="number" value={form.kidCount||0} onChange={e=>setForm({...form,kidCount:e.target.value})} className="w-12 text-center text-xs font-bold bg-transparent border-b border-stone-200"/></div>
                                    <div className="flex items-center justify-between"><span className="text-[9px] font-bold text-stone-400">每人費用</span><input type="number" value={form.kidUnitCost||0} onChange={e=>setForm({...form,kidUnitCost:e.target.value})} className="w-16 text-right text-xs font-bold bg-transparent border-b border-stone-200"/></div>
                                </div>
                            </div>
                            <div className="pt-2 flex flex-col items-end">
                                <span className="text-[9px] font-black text-blue-500 uppercase">預估總額</span>
                                <span className="text-xl font-black text-stone-800">NT$ {(form.totalBudget || 0).toLocaleString()}</span>
                                <p className="text-[8px] text-blue-400 font-black mt-1 uppercase italic">需在 {form.plannedDate} 前準備 NT$ {(form.totalBudget || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">地點名稱</label><input value={form.locationName||''} onChange={e=>setForm({...form,locationName:e.target.value})} className={inputClass} placeholder="地標或餐廳名稱"/></div>
                                <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">Google Map 連結</label><input value={form.mapLink||''} onChange={e=>setForm({...form,mapLink:e.target.value})} className={inputClass} placeholder="貼上地圖網址..."/></div>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">預估費用 (非必填)</label><input type="number" value={form.cost||''} onChange={e=>setForm({...form,cost:e.target.value})} className={inputClass} placeholder="NT$ ..."/></div>
                        </>
                    )}

                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1 flex items-center gap-2"><Users size={12}/> 參與者</label><div className="flex flex-wrap gap-2">{PARTICIPANTS_LIST.map(p=>(<button type="button" key={p} onClick={()=>{const currentParts = form.participants || []; const newParts = currentParts.includes(p) ? currentParts.filter(x=>x!==p) : [...currentParts, p]; setForm({...form, participants: newParts});}} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${form.participants?.includes(p) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-100'}`}>{ROLE_DISPLAY[p] || p}</button>))}</div></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase px-1">備註說明</label><textarea value={form.note||''} onChange={e=>setForm({...form,note:e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl font-medium text-stone-600 text-sm" placeholder="細節提醒..." rows="3"/></div>
                    <button type="submit" className="w-full py-5 bg-stone-800 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl">儲存計畫項目</button>
                </form>
            )}

            {['routine', 'shopping'].includes(modalType) && (
                <form onSubmit={(e)=>{e.preventDefault(); const m={'shopping':'shopping','routine':'routines'}; saveDoc(m[modalType], form);}} className="space-y-6">
                    <input required value={form.title || ''} onChange={e=>setForm({...form, title: e.target.value})} className={inputClass} placeholder="內容標題..."/>
                    <button type="submit" className="w-full bg-stone-800 text-white py-6 rounded-[32px] font-black uppercase tracking-widest shadow-xl active:scale-[0.98]">確認儲存</button>
                </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50"><div className="w-16 h-16 border-4 border-stone-100 border-t-emerald-400 rounded-full animate-spin" /><p className="text-[10px] font-bold text-stone-300 mt-4 uppercase tracking-widest">Family Link Loading...</p></div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-emerald-100">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[108px]">
          {currentView === 'home' && <HomeView />}
          {currentView === 'insights' && <InsightsView />}
          {currentView === 'plans' && <PlansView />}
          {currentView === 'settings' && <SettingsView currentRole={currentRole} setCurrentRole={setCurrentRole} ROLE_DISPLAY={ROLE_DISPLAY} setCurrentView={setCurrentView} showToast={showToast} setModalType={setModalType} />}
          {currentView === 'spaces' && <SpacesView />}
          {currentView === 'tasks' && <TasksView displayTasks={displayTasks} currentRole={currentRole} saveDoc={saveDoc} setEditData={setEditData} setModalType={setModalType} ROLE_DISPLAY={ROLE_DISPLAY} setCurrentView={setCurrentView} routines={routines.filter(r => r.scope === 'task')} />}
          {currentView === 'kid' && <KidView displayKidTimeline={displayKidTimeline} routines={routines.filter(r => r.scope !== 'task')} ROLE_DISPLAY={ROLE_DISPLAY} setEditData={setEditData} setModalType={setModalType} currentRole={currentRole} setCurrentView={setCurrentView} saveDoc={saveDoc} deleteItem={deleteItem} />}
          {currentView === 'routines' && <RoutinesView routines={routines.filter(r => r.scope !== 'task')} ROLE_DISPLAY={ROLE_DISPLAY} setEditData={setEditData} setModalType={setModalType} saveDoc={saveDoc} deleteItem={deleteItem} />}
        </div>
        {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-stone-800 text-white px-8 py-3 rounded-full text-[11px] font-black shadow-2xl animate-in slide-in-from-top-full uppercase tracking-widest">{toast}</div>}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-stone-100/60 px-6 pt-3 pb-5 flex justify-between items-center z-40 h-[76px]">
          {[{v:'home',i:Home,c:'text-emerald-500'}, {v:'tasks',i:CheckSquare,c:'text-stone-800'}, {v:'insights',i:BarChart2,c:'text-blue-500'}, {v:'kid',i:Baby,c:'text-rose-400'}, {v:'plans',i:Calendar,c:'text-amber-500'}].map(tab=>(
              <button key={tab.v} onClick={()=>setCurrentView(tab.v)} className={`p-2.5 rounded-2xl transition-all ${currentView===tab.v?`${tab.c} bg-stone-50 shadow-sm`:'text-stone-300'}`}><tab.i size={20}/></button>
          ))}
        </nav>
        {modalType && <Modal />}
      </main>
    </div>
  );
}

// --- Sub-View Shells ---
const SettingsView = ({ currentRole, setCurrentRole, ROLE_DISPLAY, setCurrentView, showToast, setModalType }) => {
    const [dangerOpen, setDangerOpen] = useState(false);
    return (
        <div className="pb-8">
            <GlobalHeader title="全域設定" currentRole={currentRole} setCurrentView={setCurrentView} />
            <div className="px-6 space-y-6">
                <section className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                    <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">目前角色切換</h3>
                    <div className="flex gap-3">
                        {ROLES.map(r=>(<button key={r} onClick={()=>{setCurrentRole(r);localStorage.setItem('family_role',r);showToast(`已切換為 ${ROLE_DISPLAY[r]}`);}} className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition-all ${currentRole===r?'bg-stone-800 text-white border-stone-800 shadow-md':'bg-white text-stone-400 border-stone-100'}`}>{ROLE_DISPLAY[r]}</button>))}
                    </div>
                </section>
                <section className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                    <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">系統進階設定</h3>
                    <div className="space-y-2">
                        <button onClick={()=>setModalType('task-routine-manager')} className="w-full text-left p-4 bg-stone-50 rounded-2xl flex justify-between items-center"><span className="text-sm font-bold text-stone-700">家務例行設定</span><ChevronRight size={16}/></button>
                        <button onClick={()=>setModalType('shopping-routine-manager')} className="w-full text-left p-4 bg-stone-50 rounded-2xl flex justify-between items-center"><span className="text-sm font-bold text-stone-700">採買例行設定</span><ChevronRight size={16}/></button>
                        <button onClick={()=>setModalType('task-quick-manager')} className="w-full text-left p-4 bg-stone-50 rounded-2xl flex justify-between items-center"><span className="text-sm font-bold text-stone-700">家務快選項目設定</span><ChevronRight size={16}/></button>
                        <button onClick={()=>setModalType('kid-quick-manager')} className="w-full text-left p-4 bg-stone-50 rounded-2xl flex justify-between items-center"><span className="text-sm font-bold text-stone-700">育兒快選事件設定</span><ChevronRight size={16}/></button>
                        <button onClick={()=>setModalType('kid-routine-manager')} className="w-full text-left p-4 bg-stone-50 rounded-2xl flex justify-between items-center"><span className="text-sm font-bold text-stone-700">育兒選定日例行設定</span><ChevronRight size={16}/></button>
                    </div>
                </section>
                <section className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm overflow-hidden">
                    <button onClick={()=>setDangerOpen(!dangerOpen)} className="w-full flex justify-between items-center text-stone-400 active:text-rose-400"><span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Lock size={12}/> 危險操作區塊</span>{dangerOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
                    {dangerOpen && (
                        <div className="mt-6 space-y-4 pt-6 border-t border-stone-50 animate-in slide-in-from-top-2">
                            <p className="text-[10px] text-stone-300 text-center font-medium leading-relaxed px-4">重置角色將清除您的本地紀錄，系統會要求重新選擇身分。</p>
                            <ResetConfirm onReset={()=>{setCurrentRole(null);localStorage.removeItem('family_role');}} />
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

const ResetConfirm = ({ onReset }) => {
    const [step, setStep] = useState(0);
    if (step === 0) return <button onClick={()=>setStep(1)} className="w-full py-4 text-rose-300 font-bold text-xs bg-rose-50/20 rounded-2xl border border-rose-100/30 active:bg-rose-50 transition-all">重置角色與登出</button>;
    return (
        <div className="bg-rose-50 p-6 rounded-[28px] border border-rose-200 animate-in zoom-in duration-200">
            <p className="text-xs font-bold text-rose-600 mb-4 text-center">確定要重置角色嗎？</p>
            <div className="flex gap-3">
                <button onClick={()=>setStep(0)} className="flex-1 py-3 bg-white text-stone-400 rounded-xl font-bold text-xs">取消</button>
                <button onClick={onReset} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-200">確認重置</button>
            </div>
        </div>
    );
};

const TasksView = ({ displayTasks, saveDoc, currentRole, setEditData, setModalType, ROLE_DISPLAY, setCurrentView, routines, defaultTab }) => {
    const [taskTab, setTaskTab] = useState(defaultTab || 'tasks');
    const [showCompleted, setShowCompleted] = useState(false);
    const [taskViewMode, setTaskViewMode] = useState('list');
    const [taskSelectedDateStr, setTaskSelectedDateStr] = useState(formatToday());
    const [pendingFilterTab, setPendingFilterTab] = useState('全部');

    const getLocalFormatDateStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleTaskPrev = () => {
        if (taskViewMode === 'list') return;
        const d = new Date(taskSelectedDateStr);
        if (taskViewMode === 'week') d.setDate(d.getDate() - 7);
        else if (taskViewMode === 'month') d.setMonth(d.getMonth() - 1);
        else if (taskViewMode === 'year') d.setFullYear(d.getFullYear() - 1);
        setTaskSelectedDateStr(getLocalFormatDateStr(d));
    };

    const handleTaskNext = () => {
        if (taskViewMode === 'list') return;
        const d = new Date(taskSelectedDateStr);
        if (taskViewMode === 'week') d.setDate(d.getDate() + 7);
        else if (taskViewMode === 'month') d.setMonth(d.getMonth() + 1);
        else if (taskViewMode === 'year') d.setFullYear(d.getFullYear() + 1);
        setTaskSelectedDateStr(getLocalFormatDateStr(d));
    };

    const getTaskDateDisplay = () => {
        const d = new Date(taskSelectedDateStr);
        if (taskViewMode === 'list') return '所有家務';
        if (taskViewMode === 'year') return `${d.getFullYear()}年`;
        if (taskViewMode === 'month') return `${d.getFullYear()}年 ${d.getMonth()+1}月`;
        if (taskViewMode === 'week') {
            const day = d.getDay();
            const start = new Date(d); start.setDate(d.getDate() - day);
            const end = new Date(start); end.setDate(start.getDate() + 6);
            return `${start.getMonth()+1}/${start.getDate()} - ${end.getMonth()+1}/${end.getDate()}`;
        }
    };

    const weekDays = useMemo(() => {
        const d = new Date(taskSelectedDateStr);
        d.setHours(0,0,0,0);
        const day = d.getDay();
        const start = new Date(d); start.setDate(d.getDate() - day);
        return Array.from({ length: 7 }).map((_, i) => {
            const curr = new Date(start); curr.setDate(start.getDate() + i); return curr;
        });
    }, [taskSelectedDateStr]);

    const monthDays = useMemo(() => {
        const d = new Date(taskSelectedDateStr);
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }).map((_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1, 12));
    }, [taskSelectedDateStr]);

    const yearMonths = useMemo(() => {
        const d = new Date(taskSelectedDateStr);
        return Array.from({ length: 12 }).map((_, i) => new Date(d.getFullYear(), i, 1, 12));
    }, [taskSelectedDateStr]);

    const hasTaskOnDate = (dStr) => displayTasks.some(t => t.dueDate === dStr);
    const hasTaskInMonth = (yStr, mStr) => displayTasks.some(t => t.dueDate && t.dueDate.startsWith(`${yStr}-${mStr}`));

    const filteredTasks = useMemo(() => {
        return displayTasks.filter(t => {
            if (taskViewMode === 'list') return true;
            if (!t.dueDate) return false;
            if (taskViewMode === 'week' || taskViewMode === 'month') return t.dueDate === taskSelectedDateStr;
            if (taskViewMode === 'year') return t.dueDate.startsWith(taskSelectedDateStr.substring(0, 7));
            return true;
        });
    }, [displayTasks, taskViewMode, taskSelectedDateStr]);

    const pendingTasks = useMemo(() => {
        return filteredTasks.filter(t => t.status !== 'completed').sort((a,b) => {
            const today = new Date(); today.setHours(0,0,0,0);
            const dateA = getSafeDate(a.dueDate);
            const dateB = getSafeDate(b.dueDate);
            const isOverdueA = dateA && dateA < today ? 1 : 0;
            const isOverdueB = dateB && dateB < today ? 1 : 0;
            
            if (isOverdueA !== isOverdueB) return isOverdueB - isOverdueA;
            if (getPriorityScore(a.priority) !== getPriorityScore(b.priority)) 
                return getPriorityScore(b.priority) - getPriorityScore(a.priority);
            if (getTimestampMillis(a.dueDate) !== getTimestampMillis(b.dueDate))
                return getTimestampMillis(a.dueDate) - getTimestampMillis(b.dueDate);
            return getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt);
        });
    }, [filteredTasks]);

    const displayPendingTasks = useMemo(() => {
        return pendingTasks.filter(t => {
            if (pendingFilterTab === '全部') return true;
            const isShopping = t.category === '採買' || t.category === '補貨' || (t.title && t.title.includes('買'));
            if (pendingFilterTab === '採買') return isShopping;
            if (pendingFilterTab === '家務') return !isShopping;
            return true;
        });
    }, [pendingTasks, pendingFilterTab]);

    const completedTasks = useMemo(() => {
        return filteredTasks.filter(t => t.status === 'completed')
            .sort((a,b) => getTimestampMillis(b.completedAt) - getTimestampMillis(a.completedAt));
    }, [filteredTasks]);

    const TaskCard = ({ t, isPending }) => {
        const dueInfo = getDueStatus(t.dueDate);
        const priorityColor = t.priority === 'High' ? 'bg-rose-100 text-rose-600' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500';
        
        return (
            <div className={`bg-white p-5 rounded-[32px] border border-stone-100 shadow-sm flex items-start gap-4 active:scale-[0.99] transition-all ${!isPending ? 'opacity-60' : ''}`} onClick={() => { setEditData(t); setModalType('task'); }}>
                <button onClick={(e) => {
                    e.stopPropagation();
                    if (isPending) saveDoc('tasks', { ...t, status: 'completed', completedBy: currentRole || 'Kate', completedAt: Timestamp.now() });
                    else saveDoc('tasks', { ...t, status: 'pending', completedBy: null, completedAt: null });
                }} className={`mt-1 transition-colors ${!isPending ? 'text-emerald-500' : 'text-stone-200 hover:text-emerald-400'}`}>
                    {isPending ? <Circle size={24}/> : <CheckCircle2 size={24}/>}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{t.room}</span>
                            {t.category && <span className="text-[8px] bg-stone-50 text-stone-400 px-1.5 py-0.5 rounded-lg font-bold">{t.category}</span>}
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${priorityColor}`}>{t.priority}</span>
                    </div>
                    <h4 className={`font-bold text-stone-800 text-base leading-tight truncate ${!isPending ? 'line-through text-stone-400' : ''}`}>{t.title}</h4>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <User size={10} className="text-stone-300"/>
                                <span className="text-[10px] font-bold text-stone-400">{ROLE_DISPLAY[t.assignee] || t.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={10} className="text-stone-300"/>
                                <span className={`text-[10px] font-bold ${dueInfo?.color || 'text-stone-400'}`}>{dueInfo?.text || t.dueDate}</span>
                            </div>
                        </div>
                        {!isPending && <span className="text-[9px] text-stone-300 font-medium italic">已由 {ROLE_DISPLAY[t.completedBy]} 完成</span>}
                    </div>
                </div>
            </div>
        );
    };

    const SpacesTab = () => {
        const [expandedRooms, setExpandedRooms] = useState([]);

        const toggleRoom = (roomName) => {
            setExpandedRooms(prev => prev.includes(roomName) ? prev.filter(r => r !== roomName) : [...prev, roomName]);
        };

        const getRoomDetailedStatus = (roomName) => {
            const templates = CHORE_TEMPLATES[roomName] || [];
            if (templates.length === 0) return { riskLevel: 'none', summary: '查看空間任務', details: [] };
            
            const details = templates.map(core => {
                const last = displayTasks.filter(t => t.room === roomName && t.title.includes(core.title) && t.status === 'completed')
                                  .sort((a,b)=>getTimestampMillis(b.completedAt)-getTimestampMillis(a.completedAt))[0];
                const days = last ? getDiffDays(last.completedAt) : 99;
                const isOverdue = days >= core.days;
                const isWarning = !isOverdue && days >= core.days * 0.7;
                return { title: core.title, days, limit: core.days, isOverdue, isWarning };
            });

            const overdueCount = details.filter(d => d.isOverdue).length;
            const warningCount = details.filter(d => d.isWarning).length;

            let riskLevel = 'none';
            let summary = '狀態穩定';
            let colorClass = 'border-l-stone-200 bg-white';
            let textClass = 'text-stone-400';

            if (overdueCount > 0) {
                riskLevel = 'high';
                summary = `${overdueCount} 項核心工作逾期`;
                colorClass = 'border-l-rose-400 bg-rose-50/30';
                textClass = 'text-rose-500';
            } else if (warningCount > 0) {
                riskLevel = 'medium';
                summary = `${warningCount} 項接近逾期`;
                colorClass = 'border-l-amber-400 bg-amber-50/30';
                textClass = 'text-amber-600';
            } else {
                riskLevel = 'low';
                colorClass = 'border-l-emerald-400 bg-white';
                textClass = 'text-emerald-500';
            }

            return { riskLevel, summary, details, colorClass, textClass };
        };

        return (
            <div className="grid gap-4 content-start">
                {ROOMS.map(r => {
                    const { summary, details, colorClass, textClass } = getRoomDetailedStatus(r);
                    const isExpanded = expandedRooms.includes(r);
                    return (
                        <div key={r} className={`rounded-[32px] border border-stone-100 shadow-sm overflow-hidden transition-all duration-300 ${colorClass}`}>
                            <div onClick={() => toggleRoom(r)} className="p-6 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform">
                                <div className="flex-1 border-l-4 border-transparent pl-2 -ml-2">
                                    <h3 className="font-bold text-stone-800 text-base">{r}</h3>
                                    <p className={`text-[11px] font-bold mt-0.5 ${textClass}`}>{summary}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right bg-white/60 px-4 py-2 rounded-2xl border border-stone-100/50 shadow-sm backdrop-blur-sm">
                                        <div className="text-xl font-black text-stone-700 leading-none">{displayTasks.filter(t=>t.room===r && t.status!=='completed').length}</div>
                                        <div className="text-[8px] text-stone-400 font-bold uppercase mt-1 tracking-widest">待辦</div>
                                    </div>
                                    <div className="text-stone-300">
                                        {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                    </div>
                                </div>
                            </div>
                            {isExpanded && details.length > 0 && (
                                <div className="px-6 pb-6 pt-2 border-t border-stone-100/50 bg-white/40">
                                    <h4 className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-3">核心工作明細</h4>
                                    <div className="space-y-2">
                                        {details.map((d, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-stone-100/50">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${d.isOverdue ? 'bg-rose-400' : d.isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                                    <span className={`text-xs font-bold ${d.isOverdue ? 'text-rose-600' : 'text-stone-700'}`}>{d.title}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-stone-500">{d.days === 99 ? '未做過' : `${d.days} 天未做`}</span>
                                                    <span className="text-[9px] text-stone-300 ml-1 font-bold">/ 建議 {d.limit} 天</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="pb-8 animate-in fade-in">
            <GlobalHeader 
                title="家務管理" 
                currentRole={currentRole} 
                setCurrentView={setCurrentView} 
            />
            <div className="px-6 space-y-6">
                <div className="flex gap-2 p-1 bg-stone-50 rounded-2xl shadow-inner">
                    {['tasks', 'spaces'].map(t => (
                        <button key={t} onClick={() => setTaskTab(t)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${taskTab === t ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}>
                            {t === 'tasks' ? '家務清單' : '空間地圖'}
                        </button>
                    ))}
                </div>

                {taskTab === 'tasks' ? (
                    <>
                        <div className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <button onClick={handleTaskPrev} className={`p-2 text-stone-400 hover:text-stone-600 ${taskViewMode === 'list' ? 'opacity-30 cursor-not-allowed' : ''}`}><ChevronLeft size={16}/></button>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-stone-800">{getTaskDateDisplay()}</span>
                                    <div className="flex items-center gap-1 mt-2">
                                        {['list','week','month','year'].map(vm => (
                                            <button key={vm} onClick={()=>setTaskViewMode(vm)} className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${taskViewMode===vm?'bg-stone-800 text-white':'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                                                {vm === 'list' ? '列表' : vm === 'week' ? '週' : vm === 'month' ? '月' : '年'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={handleTaskNext} className={`p-2 text-stone-400 hover:text-stone-600 ${taskViewMode === 'list' ? 'opacity-30 cursor-not-allowed' : ''}`}><ChevronRight size={16}/></button>
                            </div>

                            {taskViewMode === 'week' && (
                                <div className="flex justify-between items-center px-1">
                                    {weekDays.map(d => {
                                        const dStr = getLocalFormatDateStr(d);
                                        const isSelected = dStr === taskSelectedDateStr;
                                        const isToday = dStr === formatToday();
                                        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                                        const hasTask = hasTaskOnDate(dStr);
                                        return (
                                            <button key={dStr} onClick={() => setTaskSelectedDateStr(dStr)} className={`relative flex flex-col items-center p-2 rounded-2xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}>
                                                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-stone-300' : isToday ? 'text-emerald-400' : ''}`}>{dayName}</span>
                                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-emerald-500' : 'text-stone-700'}`}>{d.getDate()}</span>
                                                {hasTask && <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-400'}`} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {taskViewMode === 'month' && (
                                <div className="grid grid-cols-7 gap-y-2 gap-x-1 px-1">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-[8px] font-black text-stone-300 uppercase mb-2">{day}</div>
                                    ))}
                                    {Array.from({ length: monthDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                    {monthDays.map(d => {
                                        const dStr = getLocalFormatDateStr(d);
                                        const isSelected = dStr === taskSelectedDateStr;
                                        const isToday = dStr === formatToday();
                                        const hasTask = hasTaskOnDate(dStr);
                                        return (
                                            <button key={dStr} onClick={() => setTaskSelectedDateStr(dStr)} className={`relative flex items-center justify-center h-8 rounded-xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}>
                                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : isToday ? 'text-emerald-500' : 'text-stone-700'}`}>{d.getDate()}</span>
                                                {hasTask && <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-400'}`} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {taskViewMode === 'year' && (
                                <div className="grid grid-cols-4 gap-3 px-1">
                                    {yearMonths.map(d => {
                                        const yStr = d.getFullYear().toString();
                                        const mStr = String(d.getMonth() + 1).padStart(2, '0');
                                        const isSelected = taskSelectedDateStr.startsWith(`${yStr}-${mStr}`);
                                        const hasTask = hasTaskInMonth(yStr, mStr);
                                        const isCurrentMonth = formatToday().startsWith(`${yStr}-${mStr}`);
                                        return (
                                            <button key={mStr} onClick={() => {
                                                const newDate = new Date(d);
                                                setTaskSelectedDateStr(isCurrentMonth ? formatToday() : getLocalFormatDateStr(newDate));
                                            }} className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                                                <span className={`text-sm font-bold ${isSelected ? 'text-white' : isCurrentMonth ? 'text-emerald-500' : 'text-stone-700'}`}>{d.getMonth() + 1}月</span>
                                                {hasTask && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-400'}`} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button onClick={() => { setModalType('task'); setEditData(null); }} className="w-full bg-stone-800 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Plus size={18}/> 新增待辦家務
                        </button>

                        <section className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">待處理項目 ({displayPendingTasks.length})</h3>
                                <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                                    {['全部', '家務', '採買'].map(f => (
                                        <button key={f} onClick={() => setPendingFilterTab(f)} className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all ${pendingFilterTab === f ? 'bg-white text-stone-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {displayPendingTasks.length > 0 ? (
                                    displayPendingTasks.map(t => <TaskCard key={t.id} t={t} isPending={true} />)
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-stone-300 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-100">
                                        <Sparkles size={24} className="mb-2 opacity-20"/>
                                        <p className="text-[10px] font-bold uppercase">無待處理的家務</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <button onClick={() => setShowCompleted(!showCompleted)} className="w-full flex justify-between items-center px-1 text-stone-400 hover:text-stone-600 transition-colors">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest">已完成項目 ({completedTasks.length})</h3>
                                {showCompleted ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </button>
                            {showCompleted && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    {completedTasks.length > 0 ? (
                                        completedTasks.map(t => <TaskCard key={t.id} t={t} isPending={false} />)
                                    ) : (
                                        <p className="text-center py-8 text-[10px] text-stone-300 font-bold uppercase">尚無已完成的家務</p>
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <SpacesTab />
                )}
            </div>
            <div className="h-8"/>
        </div>
    );
};

const KidView = ({ displayKidTimeline, routines, ROLE_DISPLAY, setEditData, setModalType, currentRole, setCurrentView, saveDoc, deleteItem }) => {
    const [selectedDateStr, setSelectedDateStr] = useState(formatToday());
    const [viewMode, setViewMode] = useState('week');

    const [qaList] = useState(() => JSON.parse(localStorage.getItem('kid_quick_actions')) || [
        { id: 'tv', name: '電視', icon: 'Tv' },
        { id: 'sleep', name: '入睡', icon: 'Moon' },
        { id: 'nap', name: '午睡', icon: 'Moon' },
        { id: 'snack', name: '零食', icon: 'Coffee' },
        { id: 'pickup', name: '接送', icon: 'MapPin' },
        { id: 'nail', name: '剪指甲', icon: 'Baby' }
    ]);

    const getFormatDateStr = (d) => d.toISOString().split('T')[0];

    const weekDays = useMemo(() => {
        const d = new Date(selectedDateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        const days = [];
        for (let i = 0; i < 7; i++) {
            const curr = new Date(start);
            curr.setDate(start.getDate() + i);
            days.push(curr);
        }
        return days;
    }, [selectedDateStr]);

    const handlePrev = () => {
        const d = new Date(selectedDateStr);
        d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
        setSelectedDateStr(getFormatDateStr(d));
    };

    const handleNext = () => {
        const d = new Date(selectedDateStr);
        d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
        setSelectedDateStr(getFormatDateStr(d));
    };

    const selectedDateRecords = useMemo(() => {
        return displayKidTimeline.filter(k => k.date === selectedDateStr)
            .sort((a,b) => getTimestampMillis(b.createdAt || b.completedAt) - getTimestampMillis(a.createdAt || a.completedAt));
    }, [displayKidTimeline, selectedDateStr]);

    const historyRecords = useMemo(() => {
        return displayKidTimeline.filter(k => k.date !== selectedDateStr)
            .sort((a,b) => getTimestampMillis(b.createdAt || b.completedAt) - getTimestampMillis(a.createdAt || a.completedAt));
    }, [displayKidTimeline, selectedDateStr]);

    const selD = new Date(selectedDateStr);
    const isWeekend = selD.getDay() === 0 || selD.getDay() === 6;
    
    const defaultRoutines = isWeekend ? [
        { id: 'dr1', title: '早餐', type: 'weekend', isActive: true }, 
        { id: 'dr2', title: '午餐', type: 'weekend', isActive: true }, 
        { id: 'dr3', title: '午睡', type: 'weekend', isActive: true },
        { id: 'dr4', title: '出去走走 / 陪玩', type: 'weekend', isActive: true }, 
        { id: 'dr5', title: '晚餐', type: 'weekend', isActive: true }, 
        { id: 'dr6', title: '洗澡', type: 'weekend', isActive: true },
        { id: 'dr7', title: '講故事', type: 'weekend', isActive: true }, 
        { id: 'dr8', title: '睡覺', type: 'weekend', isActive: true }
    ] : [
        { id: 'dr9', title: '送去上學', type: 'weekday', isActive: true }, 
        { id: 'dr10', title: '接放學', type: 'weekday', isActive: true }, 
        { id: 'dr11', title: '洗澡', type: 'weekday', isActive: true },
        { id: 'dr12', title: '講故事', type: 'weekday', isActive: true }, 
        { id: 'dr13', title: '睡覺', type: 'weekday', isActive: true }
    ];

    const activeRoutines = routines && routines.length > 0 ? 
        routines.filter(r => r.isActive && (!r.type || r.type === 'daily' || (isWeekend ? r.type === 'weekend' : r.type === 'weekday'))) 
        : defaultRoutines;

    const handleRoutineItemClick = (r) => {
        const existing = r.title.includes('睡覺') 
            ? selectedDateRecords.find(k => k.type === 'event' && k.eventId === 'sleep')
            : selectedDateRecords.find(k => k.type === 'routine' && k.title === r.title);

        if (existing) {
            deleteItem && deleteItem('kidTimeline', existing.id);
        } else {
            const now = new Date();
            const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            
            if (r.title.includes('睡覺')) {
                saveDoc('kidTimeline', { 
                    type: 'event', 
                    eventId: 'sleep', 
                    value: hhmm, 
                    caregiver: currentRole || 'Kate', 
                    date: selectedDateStr, 
                    createdAt: Timestamp.now() 
                });
            } else {
                saveDoc('kidTimeline', { 
                    type: 'routine', 
                    title: r.title, 
                    caregiver: currentRole || 'Kate', 
                    status: 'completed', 
                    date: selectedDateStr, 
                    value: hhmm,
                    completedAt: Timestamp.now() 
                });
            }
        }
    };

    const isRoutineCompletedOnDate = (title) => {
        if (title.includes('睡覺')) {
            return selectedDateRecords.some(k => k.type === 'event' && k.eventId === 'sleep');
        }
        return selectedDateRecords.some(k => k.type === 'routine' && k.title === title && k.status === 'completed');
    };

    const RecordCard = ({ k, isPreview }) => {
        const isRoutine = k.type === 'routine';
        const isCompleted = k.status === 'completed';
        const isSelectedDate = k.date === selectedDateStr;
        const displayEventName = qaList.find(q => q.id === k.eventId)?.name || k.eventId;
        const tvDisplay = k.eventId === 'tv' ? `${k.startTime || ''} - ${k.endTime || '進行中'}` : '';

        return (
            <div className={`bg-white p-5 rounded-[32px] border ${isPreview ? 'border-indigo-200 bg-indigo-50/50 border-dashed' : 'border-stone-100'} shadow-sm flex items-center justify-between active:scale-[0.99] transition-all`} onClick={() => { if(!isPreview) { setEditData(k); setModalType('kid-event'); } }}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isRoutine ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-400'}`}>
                        {isRoutine ? <Clock size={20}/> : (k.eventId === 'tv' ? <Tv size={20}/> : k.eventId === 'sleep' ? <Moon size={20}/> : <Sparkles size={20}/>)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{isPreview ? '待確認例行' : isRoutine ? '例行' : '事件'}</span>
                            <span className="text-[9px] font-bold text-stone-400">{isSelectedDate ? '選定日' : k.date}</span>
                        </div>
                        <h4 className={`font-bold text-sm ${isPreview ? 'text-indigo-700' : (isCompleted === false ? 'text-stone-400' : 'text-stone-800')}`}>
                            {isRoutine ? k.title : displayEventName}
                            {!isPreview && (
                                <span className="text-stone-600">
                                    {k.eventId === 'tv' && (k.startTime || k.endTime) ? `: ${tvDisplay}` : (k.value ? `: ${k.value}` : (isCompleted ? ': 已完成' : ''))}
                                </span>
                            )}
                        </h4>
                        <p className="text-[10px] text-stone-300 font-bold mt-0.5 uppercase">{ROLE_DISPLAY[k.caregiver]} 紀錄</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isRoutine && !isPreview && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                    {isPreview && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                    {!isPreview && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteItem && deleteItem('kidTimeline', k.id); }} className="p-2 text-stone-300 hover:text-rose-400 transition-colors">
                            <Trash2 size={16}/>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-8 animate-in fade-in">
            <GlobalHeader title="育兒紀錄" currentRole={currentRole} setCurrentView={setCurrentView} />
            <div className="px-6 space-y-8">
                
                <div className="bg-white p-4 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <button onClick={handlePrev} className="p-2 text-stone-400 hover:text-stone-600"><ChevronLeft size={16}/></button>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-stone-800">{selectedDateStr}</span>
                            <button onClick={() => setViewMode(v => v === 'week' ? 'day' : 'week')} className="text-[9px] text-stone-400 font-bold uppercase mt-0.5 tracking-widest">{viewMode === 'week' ? '週檢視' : '日檢視'}</button>
                        </div>
                        <button onClick={handleNext} className="p-2 text-stone-400 hover:text-stone-600"><ChevronRight size={16}/></button>
                    </div>
                    {viewMode === 'week' && (
                        <div className="flex justify-between items-center px-1">
                            {weekDays.map(d => {
                                const dStr = getFormatDateStr(d);
                                const isSelected = dStr === selectedDateStr;
                                const isToday = dStr === formatToday();
                                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                                return (
                                    <button key={dStr} onClick={() => setSelectedDateStr(dStr)} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${isSelected ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:bg-stone-50'}`}>
                                        <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-stone-300' : isToday ? 'text-rose-400' : ''}`}>{dayName}</span>
                                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-rose-500' : 'text-stone-700'}`}>{d.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <section className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">選定日例行 ({activeRoutines.length})</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                        {activeRoutines.map(r => {
                            const done = isRoutineCompletedOnDate(r.title);
                            return (
                                <button key={r.id} onClick={() => handleRoutineItemClick(r)} className={`shrink-0 px-5 py-3 rounded-[20px] flex flex-col items-center gap-2 border transition-all ${done ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-indigo-100 shadow-sm active:scale-95'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-stone-200 text-stone-400' : 'bg-indigo-50 text-indigo-500'}`}>
                                        {done ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                                    </div>
                                    <span className={`text-[10px] font-bold ${done ? 'text-stone-400' : 'text-stone-700'}`}>{r.title}</span>
                                </button>
                            )
                        })}
                    </div>
                </section>

                <button onClick={() => { setEditData({ type: 'event', eventId: 'custom', value: '', date: selectedDateStr, caregiver: currentRole || 'Kate', note: '' }); setModalType('kid-event'); }} className="w-full bg-rose-400 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Plus size={18}/> 新增生活紀錄
                </button>

                <section className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">快選事件</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 px-1">
                        {qaList.map(qa => (
                            <button key={qa.id} onClick={() => { 
                                const now = new Date();
                                const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
                                if (qa.id === 'tv') {
                                    saveDoc('kidTimeline', {
                                        type: 'event',
                                        eventId: 'tv',
                                        startTime: hhmm,
                                        endTime: '',
                                        date: selectedDateStr,
                                        caregiver: currentRole || 'Kate',
                                        createdAt: Timestamp.now()
                                    });
                                } else {
                                    saveDoc('kidTimeline', {
                                        type: 'event',
                                        eventId: qa.id,
                                        value: hhmm,
                                        date: selectedDateStr,
                                        caregiver: currentRole || 'Kate',
                                        createdAt: Timestamp.now()
                                    });
                                }
                            }} className="px-4 py-2.5 bg-white border border-stone-100 shadow-sm rounded-2xl text-xs font-bold text-stone-600 active:scale-95 transition-all">
                                {qa.name}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">選定日紀錄 ({selectedDateRecords.length})</h3>
                    <div className="space-y-3">
                        {selectedDateRecords.length > 0 ? (
                            selectedDateRecords.map(k => <RecordCard key={k.id} k={k} isPreview={false} />)
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-stone-300 bg-stone-50/50 rounded-[32px] border border-dashed border-stone-100">
                                <Baby size={24} className="mb-2 opacity-20"/>
                                <p className="text-[10px] font-bold uppercase">此日期還沒有任何育兒記錄</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[11px] font-bold text-stone-600 uppercase tracking-widest px-1">近期歷史紀錄</h3>
                    <div className="space-y-3">
                        {historyRecords.length > 0 ? (
                            historyRecords.slice(0, 10).map(k => <RecordCard key={k.id} k={k} isPreview={false} />)
                        ) : (
                            <p className="text-center py-8 text-[10px] text-stone-300 font-bold uppercase">近期沒有歷史記錄</p>
                        )}
                    </div>
                </section>
            </div>
            <div className="h-8"/>
        </div>
    );
};

const RoutinesView = ({ routines, ROLE_DISPLAY, setEditData, setModalType, saveDoc, deleteItem }) => (
    <div className="pb-8 animate-in fade-in"><div className="px-6 pt-10 pb-6 flex items-center gap-4"><button onClick={()=>window.dispatchEvent(new Event('popstate'))} className="p-2 bg-white rounded-xl shadow-sm text-stone-400"><ChevronLeft size={20}/></button><h1 className="text-2xl font-bold text-stone-800">例行事項管理</h1></div><div className="px-6 space-y-4">{routines.map(r=>(<div key={r.id} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex items-center justify-between" onClick={()=>{setEditData(r); setModalType('routine');}}><div><h4 className="font-bold text-stone-800">{r.title}</h4><p className="text-[10px] text-stone-400 font-bold uppercase">{r.repeatType} · {ROLE_DISPLAY[r.assignee]}</p></div><button onClick={(e)=>{e.stopPropagation(); saveDoc('routines',{...r, isActive:!r.isActive});}} className={`w-12 h-6 rounded-full relative transition-all ${r.isActive?'bg-emerald-400':'bg-stone-200'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${r.isActive?'left-7':'left-1'}`}/></button></div>))}<button onClick={()=>{setModalType('routine');setEditData(null);}} className="w-full py-6 border-2 border-dashed border-stone-200 rounded-[32px] text-stone-400 font-bold flex items-center justify-center gap-2 mt-4"><Plus size={20}/> 新增例行項目</button></div><div className="h-8"/></div>
);
