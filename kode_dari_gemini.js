import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  setDoc,
  getDoc,
  getDocs,
  arrayUnion,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Users, 
  LogOut,
  TrendingUp,
  Briefcase,
  Lock,
  User as UserIcon,
  Search,
  MoreHorizontal,
  Shield,
  Settings,
  KeyRound,
  Calendar,
  ListTodo,
  X,
  History,
  PartyPopper,
  Trophy,
  Check,
  ChevronDown,
  Pencil,
  GripHorizontal,
  Loader2,
  Camera,
  MapPin,
  UserCheck,
  Map,
  FileText,
  AlertTriangle,
  FilePlus,
  Database,
  UploadCloud,
  CheckSquare,
  XSquare,
  PlusCircle,
  Send,
  Phone,
  BellRing,
  Eye,
  EyeOff,
  Menu,
  MessageSquare,
  Smartphone,
  Unlock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Konfigurasi Firebase ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Helper Functions ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; 
  return d;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

// Dapatkan ID Perangkat Unik (Disimpan di Browser)
const getDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
};

// --- Telegram Service ---
const sendTelegramMessage = async (message, targetChatId = null) => {
    const storedConfig = localStorage.getItem('telegram_config');
    if (!storedConfig) return;
    
    const { botToken, chatId: groupChatId } = JSON.parse(storedConfig);
    const finalChatId = targetChatId || groupChatId;

    if (!botToken || !finalChatId) return;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: finalChatId,
                text: message,
                parse_mode: 'HTML' 
            })
        });
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
    }
};

// --- Komponen Utama ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAuthInit, setIsAuthInit] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // State Login & Sesi
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); 
  const [currentUserRole, setCurrentUserRole] = useState('Staff'); 
  const [currentUsername, setCurrentUsername] = useState(''); 
  const [currentDisplayName, setCurrentDisplayName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null); 
  
  const [dbError, setDbError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Mobile & Modals
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  // 1. Init Auth & Seeding Data
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setIsAuthInit(true);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const savedSession = localStorage.getItem('proyekkita_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      // Validasi Device ID saat auto-login juga
      const currentDeviceId = getDeviceId();
      if (session.deviceId && session.deviceId !== currentDeviceId) {
          alert("Sesi kadaluarsa atau perangkat tidak valid.");
          localStorage.removeItem('proyekkita_session');
          setIsUserLoggedIn(false);
      } else {
          setCurrentUsername(session.username);
          setCurrentDisplayName(session.name);
          setCurrentUserRole(session.role);
          setCurrentUserId(session.userId);
          setIsUserLoggedIn(true);
          if (session.role === 'Staff') setActiveTab('kanban');
      }
    }

    return () => unsubscribe();
  }, []);

  // --- AUTOMATIC DATA SEEDING (PERMANENT DATA) ---
  useEffect(() => {
    if (!user) return;

    const seedDatabase = async () => {
      setIsSeeding(true);
      try {
        const membersRef = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
        const qOwner = query(membersRef, where('username', '==', 'owner'));
        const snapOwner = await getDocs(qOwner);
        if (snapOwner.empty) {
           await addDoc(membersRef, {
             name: 'Owner Utama', username: 'owner', password: 'sukses123', role: 'Owner', status: 'Active', phoneNumber: '081234567890', telegramUsername: 'owner_tele', createdAt: serverTimestamp()
           });
        }
      } catch (e) {
        console.error("Seeding error:", e);
      } finally {
        setIsSeeding(false);
      }
    };

    seedDatabase();
  }, [user]);

  // Fetch Data Tasks
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'team_tasks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
      setDbError(null);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Data Team Members
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(membersData);
      setDbError(null);
    });
    return () => unsubscribe();
  }, [user]);

  // --- AUTOMATED DAILY REPORT ---
  useEffect(() => {
      if (tasks.length === 0) return;
      const checkAndSendReport = () => {
          const now = new Date();
          if (now.getHours() >= 5) {
              const todayStr = now.toISOString().split('T')[0];
              const lastReport = localStorage.getItem('last_daily_report_date');

              if (lastReport !== todayStr) {
                  const total = tasks.length;
                  const done = tasks.filter(t => t.status === 'Done').length;
                  const doing = tasks.filter(t => t.status === 'Doing').length;
                  const pending = tasks.filter(t => t.status === 'Pending').length;
                  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

                  const msg = `<b>📊 Rekap Progres Harian 📊</b>\n\n📅 Tanggal: ${todayStr}\n\n✅ Total Proyek: ${total}\n🏆 Selesai: ${done}\n🚧 Sedang Proses: ${doing}\n⏳ Pending: ${pending}\n📈 Progress Global: ${progress}%\n\n<i>Laporan otomatis ProyekKita</i>`;
                  sendTelegramMessage(msg);
                  localStorage.setItem('last_daily_report_date', todayStr);
              }
          }
      };
      checkAndSendReport();
      const interval = setInterval(checkAndSendReport, 60000);
      return () => clearInterval(interval);
  }, [tasks]);


  // Filter Tasks (Visibility Logic)
  const filteredTasks = useMemo(() => {
    if (currentUserRole === 'Owner' || currentUserRole === 'Admin') return tasks;
    if (currentUserRole === 'Staff') {
        return tasks.filter(t => {
            if (t.visibility === 'management') return false; 
            const isAssigned = t.assignees?.some(a => a.uid === currentUserId);
            const isCreator = t.createdBy === currentUsername;
            return isAssigned || isCreator;
        });
    }
    return [];
  }, [tasks, currentUserRole, currentUsername, currentUserId]);

  // Deadline Alert Logic
  const urgentTasks = useMemo(() => {
      if (currentUserRole === 'Staff') return [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return tasks.filter(t => {
          if (!t.deadline || t.status === 'Done') return false;
          const d = new Date(t.deadline);
          d.setHours(0,0,0,0);
          return d.getTime() === today.getTime() || d.getTime() === tomorrow.getTime();
      });
  }, [tasks, currentUserRole]);

  // --- Handlers ---
  const handleLoginSuccess = async (username, name, role, existingId, deviceId) => {
    setCurrentUsername(username);
    setCurrentDisplayName(name);
    setCurrentUserRole(role);
    setCurrentUserId(existingId);
    setIsUserLoggedIn(true);
    
    // Simpan Device ID ke LocalStorage session
    localStorage.setItem('proyekkita_session', JSON.stringify({
      username, name, role, userId: existingId, deviceId, loginTime: Date.now()
    }));
    
    if (role === 'Staff') {
        setActiveTab('kanban');
    } else {
        setActiveTab('dashboard');
    }

    if (user && existingId) {
      try {
        const memberRef = doc(db, 'artifacts', appId, 'public', 'data', 'team_members', existingId);
        // Update deviceId di database jika belum ada (binding pertama kali)
        const updateData = { status: 'Active', lastLogin: serverTimestamp() };
        // Kita update deviceId di sini juga untuk memastikan sync, 
        // tapi logika validasi utama ada di AuthPage
        await updateDoc(memberRef, updateData);
      } catch (e) { console.error(e); }
    }
  };

  const handleSignOut = () => {
    setIsUserLoggedIn(false);
    setCurrentUsername('');
    setCurrentUserRole('Staff');
    setActiveTab('dashboard');
    localStorage.removeItem('proyekkita_session'); 
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000); 
  };

  const confirmDeleteProject = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_tasks', confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) { console.error(error); }
  };

  if (!isAuthInit || isSeeding) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Sistem...</p>
        </div>
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} db={db} appId={appId} />;
  }

  if (isUserLoggedIn && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-900 font-sans overflow-hidden relative">
      {showCelebration && <CelebrationOverlay />}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Proyek?</h3>
            <p className="text-sm text-slate-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Batal</button>
              <button onClick={confirmDeleteProject} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {isTelegramModalOpen && (
          <TelegramSettingsModal onClose={() => setIsTelegramModalOpen(false)} />
      )}

      {/* Mobile Hamburger Menu (Toggle Sidebar) */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        className="md:hidden fixed top-4 left-4 z-[60] bg-slate-800 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar with Mobile Responsive State */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
            displayName={currentDisplayName}
            username={currentUsername}
            userRole={currentUserRole}
            onSignOut={handleSignOut} 
          />
          {/* Close button for mobile inside sidebar */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden absolute top-4 right-4 text-white hover:text-slate-400"
          >
            <X size={20} />
          </button>
      </div>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none z-0"></div>

        <div className="relative z-10 flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8"> {/* Added padding top for mobile header */}
          <Header 
            activeTab={activeTab} 
            displayName={currentDisplayName} 
            role={currentUserRole} 
            onOpenTelegram={() => setIsTelegramModalOpen(true)}
          />
          
          {urgentTasks.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4">
                  <div className="bg-red-100 p-2 rounded-lg"><BellRing className="text-red-600" size={20} /></div>
                  <div>
                      <h4 className="font-bold text-red-800">Perhatian: Deadline Mendekat!</h4>
                      <p className="text-sm text-red-600 mb-2">Proyek berikut harus selesai hari ini atau besok:</p>
                      <ul className="list-disc list-inside text-sm text-red-700">
                          {urgentTasks.map(t => (
                              <li key={t.id}><b>{t.title}</b> (Deadline: {t.deadline})</li>
                          ))}
                      </ul>
                  </div>
              </div>
          )}
          
          {dbError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              <p>{dbError}</p>
            </div>
          )}
          
          <div className="mt-8">
            {activeTab === 'dashboard' && <DashboardView tasks={tasks} teamMembers={teamMembers} userRole={currentUserRole} />}
            
            {activeTab === 'kanban' && (
                <KanbanBoard 
                    tasks={filteredTasks} 
                    teamMembers={teamMembers} 
                    user={user} 
                    userRole={currentUserRole} 
                    username={currentUsername} 
                    displayName={currentDisplayName}
                    currentUserId={currentUserId}
                    onCelebrate={triggerCelebration}
                    onRequestDelete={setConfirmDeleteId}
                />
            )}
            
            {activeTab === 'team' && (
                <TeamManagement 
                    teamMembers={teamMembers} 
                    user={user} 
                    userRole={currentUserRole} 
                    currentUsername={currentUsername} 
                />
            )}

            {activeTab === 'attendance' && (
                <AttendanceView 
                    user={user}
                    username={currentUsername}
                    displayName={currentDisplayName}
                    userRole={currentUserRole}
                    teamMembers={teamMembers}
                />
            )}

            {activeTab === 'requests' && (
                <RequestsView 
                    user={user}
                    username={currentUsername}
                    displayName={currentDisplayName}
                    userRole={currentUserRole}
                    teamMembers={teamMembers}
                />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Telegram Settings Modal ---
function TelegramSettingsModal({ onClose }) {
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('telegram_config');
        if (stored) {
            const data = JSON.parse(stored);
            setBotToken(data.botToken || '');
            setChatId(data.chatId || '');
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('telegram_config', JSON.stringify({ botToken, chatId }));
        alert("Konfigurasi Telegram tersimpan!");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Send size={20} className="text-blue-500"/> Pengaturan Bot Telegram</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Bot Token</label>
                        <input className="w-full border rounded p-2 text-sm" placeholder="123456:ABC-DEF1234..." value={botToken} onChange={e => setBotToken(e.target.value)} />
                        <p className="text-[10px] text-slate-500 mt-1">Dapat dari @BotFather</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Group Chat ID (Default)</label>
                        <input className="w-full border rounded p-2 text-sm" placeholder="-100xxxxxxx" value={chatId} onChange={e => setChatId(e.target.value)} />
                        <p className="text-[10px] text-slate-500 mt-1">ID Grup tempat notifikasi umum dikirim</p>
                    </div>
                    <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Simpan Konfigurasi</button>
                </div>
            </div>
        </div>
    )
}

// --- Celebration Component ---
function CelebrationOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)],
            left: `${Math.random() * 100}vw`,
            top: `-20px`,
            animation: `fall ${2 + Math.random() * 3}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center border-4 border-emerald-100 animate-in zoom-in-50 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <PartyPopper size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Selamat!</h2>
        <p className="text-slate-600 font-medium">Tugas diselesaikan dengan gemilang.</p>
        <div className="mt-4 flex justify-center gap-1">
           <Trophy size={16} className="text-amber-500" />
           <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Kerja Bagus</span>
        </div>
      </div>
      <style>{`@keyframes fall { to { transform: translateY(105vh) rotate(720deg); } }`}</style>
    </div>
  );
}

// --- Auth Component ---
function AuthPage({ onLoginSuccess, db, appId }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const membersRef = collection(db, 'artifacts', appId, 'public', 'data', 'team_members');
      const q = query(membersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        
        // DEVICE LOCK CHECK
        const currentDeviceId = getDeviceId();
        if (userData.deviceId && userData.deviceId !== currentDeviceId) {
             // BLOCK ACTION
             sendTelegramMessage(`🚨 <b>SECURITY ALERT</b>\nUser: ${userData.name}\nMencoba login dari perangkat tak dikenal.\nAkses diblokir. Perlu reset oleh Owner.`);
             setError('Akses DIBLOKIR: Anda mencoba login dari perangkat lain. Hubungi Management untuk reset.');
             setLoading(false);
             return;
        }

        if (userData.password !== password) { 
            setError('Password salah.'); 
            setLoading(false); 
            return; 
        }

        // Jika berhasil dan belum ada device ID, kunci ke perangkat ini
        if (!userData.deviceId) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', userId), {
                deviceId: currentDeviceId
            });
        }

        setTimeout(() => { onLoginSuccess(username, userData.name, userData.role, userId, currentDeviceId); }, 500);
        return;
      }
      
      if (username === 'owner' && password === 'sukses123') {
           setTimeout(() => { onLoginSuccess('owner', 'Owner Utama', 'Owner', null, 'owner-device'); }, 500);
           return;
      }

      setError('Username tidak ditemukan.');
      setLoading(false);
    } catch (err) { setError('Koneksi bermasalah.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden">
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/50 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg"><TrendingUp size={24} /></div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ProyekKita</h1>
          <p className="text-slate-500 mt-2">Sistem Manajemen & Absensi</p>
        </div>
        {error && <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Username</label><div className="relative"><UserIcon className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></div></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400" size={18} /><input type="password" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-lg">{loading ? 'Memverifikasi...' : 'Masuk Aplikasi'}</button>
        </form>
      </div>
    </div>
  );
}

// --- Sidebar Component ---
function Sidebar({ activeTab, setActiveTab, displayName, username, userRole, onSignOut }) {
  let menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'kanban', icon: KanbanSquare, label: 'Papan Kerja' },
    { id: 'attendance', icon: UserCheck, label: 'Absensi' },
    { id: 'requests', icon: FilePlus, label: 'Permohonan' },
  ];
  if (userRole === 'Owner' || userRole === 'Admin') menuItems.push({ id: 'team', icon: Users, label: 'Kelola Tim' });

  return (
    <div className="h-full flex flex-col p-6">
      <div className="pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight"><div className="bg-blue-600 p-1 rounded-lg"><TrendingUp size={18} className="text-white" /></div>ProyekKita</h1>
        <p className="text-slate-500 text-[10px] mt-2 ml-1 uppercase tracking-widest">{userRole} ACCESS</p>
      </div>
      <nav className="flex-1 space-y-1 mt-6">{menuItems.map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium text-sm ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' : 'hover:bg-slate-800 hover:text-white'}`}><item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : ''} /><span>{item.label}</span></button>))}</nav>
      <div className="mt-auto p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-xs">{displayName ? displayName.substring(0,2).toUpperCase() : 'U'}</div><div className="overflow-hidden"><p className="text-sm font-semibold text-white truncate">{displayName || 'User'}</p><div className="flex items-center gap-1.5 mt-0.5"><span className={`w-1.5 h-1.5 rounded-full ${userRole === 'Owner' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span><p className="text-[10px] text-slate-400 truncate uppercase">{userRole}</p></div></div></div>
        <button onClick={onSignOut} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-[10px] font-medium transition-colors text-slate-300 uppercase tracking-wider"><LogOut size={12} /> Keluar</button>
      </div>
    </div>
  );
}

// --- Header Component ---
function Header({ activeTab, displayName, role, onOpenTelegram }) {
  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard Kinerja';
      case 'kanban': return 'Status Proyek';
      case 'team': return 'Manajemen Akses';
      case 'attendance': return 'Absensi & Jadwal';
      case 'requests': return 'Permohonan Izin/Cuti';
      default: return '';
    }
  };
  return (
    <header className="flex justify-between items-center mb-2">
      <div><h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2><p className="text-slate-500 text-xs md:text-sm mt-1 flex items-center gap-2">Halo, <span className="font-semibold text-slate-700">{displayName}</span></p></div>
      <div className="flex items-center gap-3">
        {(role === 'Owner' || role === 'Admin') && <button onClick={onOpenTelegram} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Setting Telegram"><Send size={18} /></button>}
        <span className={`px-3 py-1 rounded-full text-xs font-bold border hidden md:inline-block ${role === 'Owner' ? 'bg-amber-100 text-amber-700 border-amber-200' : role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{role.toUpperCase()}</span>
      </div>
    </header>
  );
}

// --- Dashboard View ---
function DashboardView({ tasks, teamMembers, userRole }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const review = tasks.filter(t => t.status === 'Review').length;
    const doing = tasks.filter(t => t.status === 'Doing').length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const pending = tasks.filter(t => t.status === 'Pending').length; 
    const queue = tasks.filter(t => t.status === 'Antrian Project').length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    const statusData = [{ name: 'Selesai', value: done, color: '#10B981' }, { name: 'Review', value: review, color: '#F59E0B' }, { name: 'Doing', value: doing, color: '#3B82F6' }, { name: 'To Do', value: todo, color: '#6366F1' }, { name: 'Antrian', value: queue, color: '#94A3B8' }, { name: 'Pending', value: pending, color: '#CBD5E1' }].filter(d => d.value > 0);
    return { total, done, review, doing, todo, queue, pending, progress, statusData };
  }, [tasks]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Proyek" value={stats.total} icon={<Briefcase size={20} />} trend="Global" />
        <StatCard title="Project Selesai" value={`${stats.progress}%`} icon={<TrendingUp size={20} />} trend="Penyelesaian" active />
        <StatCard title="Sedang Dikerjakan" value={stats.doing} icon={<Clock size={20} />} trend="Aktif" />
        <StatCard title="Menunggu Review" value={stats.review} icon={<CheckCircle2 size={20} />} trend="QA Check" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4">Grafik Distribusi Status</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={[stats]} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} /><XAxis type="number" hide /><YAxis type="category" dataKey="name" hide /><Tooltip cursor={{fill: 'transparent'}} /><Legend /><Bar dataKey="done" name="Done" stackId="a" fill="#10B981" barSize={30} radius={[0, 4, 4, 0]} /><Bar dataKey="review" name="Review" stackId="a" fill="#F59E0B" barSize={30} /><Bar dataKey="doing" name="Doing" stackId="a" fill="#3B82F6" barSize={30} /><Bar dataKey="todo" name="To Do" stackId="a" fill="#6366F1" barSize={30} /><Bar dataKey="queue" name="Antrian" stackId="a" fill="#94A3B8" barSize={30} /><Bar dataKey="pending" name="Pending" stackId="a" fill="#CBD5E1" barSize={30} radius={[4, 0, 0, 4]} /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col"><h3 className="text-lg font-bold text-slate-800 mb-2">Persentase Status</h3><div className="flex-1 min-h-[200px] relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={6}>{stats.statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} iconType="circle" /></PieChart></ResponsiveContainer></div></div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, active }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${active ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/20' : 'bg-white text-slate-800 border-slate-100 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-4"><div className={`p-3 rounded-xl ${active ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div><span className={`text-xs font-medium px-2 py-1 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>{trend}</span></div>
      <div><p className={`text-sm font-medium ${active ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p><h4 className="text-3xl font-bold mt-1">{value}</h4></div>
    </div>
  );
}

// --- Team Management ---
function TeamManagement({ teamMembers, user, userRole, currentUsername }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Staff');
  const [newPhone, setNewPhone] = useState('');
  const [newTelegramUser, setNewTelegramUser] = useState(''); // New Field
  const [newTelegramChatId, setNewTelegramChatId] = useState(''); // New Field

  const openAddModal = () => {
      setIsEditMode(false);
      setNewUsername(''); setNewPassword(''); setNewName(''); setNewRole('Staff'); setNewPhone(''); setNewTelegramUser(''); setNewTelegramChatId('');
      setIsInviteOpen(true);
  }

  const openEditModal = (member) => {
      setIsEditMode(true);
      setEditingId(member.id);
      setNewUsername(member.username);
      setNewPassword(member.password);
      setNewName(member.name);
      setNewRole(member.role);
      setNewPhone(member.phoneNumber || '');
      setNewTelegramUser(member.telegramUsername || '');
      setNewTelegramChatId(member.telegramChatId || '');
      setIsInviteOpen(true);
  }

  // --- Reset Device ID ---
  const handleResetDevice = async (userId) => {
      if (userRole !== 'Owner') return;
      if (!confirm("Reset kunci perangkat user ini?")) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', userId), {
              deviceId: null
          });
          alert("Perangkat berhasil di-reset. User bisa login di HP baru.");
      } catch(e) { alert("Gagal reset."); }
  }

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && editingId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', editingId), {
              name: newName, username: newUsername, password: newPassword, role: newRole, phoneNumber: newPhone,
              telegramUsername: newTelegramUser, telegramChatId: newTelegramChatId
          });
          alert("User berhasil diperbarui!");
      } else {
          if (teamMembers.some(m => m.username === newUsername)) return alert("Username sudah dipakai.");
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'team_members'), { 
              name: newName, username: newUsername, password: newPassword, role: newRole, phoneNumber: newPhone, 
              telegramUsername: newTelegramUser, telegramChatId: newTelegramChatId,
              status: 'Active', createdBy: currentUsername, joinedAt: serverTimestamp() 
          });
          alert("User dibuat!");
      }
      setIsInviteOpen(false);
    } catch (e) { alert("Gagal menyimpan."); }
  };

  const handleDeleteUser = async (id) => {
    if (userRole !== 'Owner') return alert("Hanya Owner.");
    if(!window.confirm("Hapus permanen?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_members', id));
  };

  if (userRole !== 'Owner' && userRole !== 'Admin') return <div className="p-4 text-red-500">Akses Ditolak</div>;

  return (
    <div className="animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800">Daftar Pengguna</h3>{userRole === 'Owner' && <button onClick={openAddModal} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700">Tambah User</button>}</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-600"><thead className="bg-slate-50 font-semibold uppercase text-xs"><tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Device ID</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{teamMembers.map(m => (<tr key={m.id}><td className="px-6 py-4 font-medium">{m.name}<br/><span className="text-[10px] text-slate-400">{m.username}</span></td><td className="px-6 py-4 font-mono text-xs">{m.deviceId ? <span className="text-emerald-600 flex items-center gap-1"><Smartphone size={12}/> Terkunci</span> : <span className="text-slate-400">Belum ada</span>}</td><td className="px-6 py-4"><span className="px-2 py-0.5 rounded border text-xs font-medium">{m.role}</span></td><td className="px-6 py-4 text-right flex justify-end gap-2">{userRole === 'Owner' && <><button onClick={() => handleResetDevice(m.id)} title="Reset Device" className="p-1 bg-slate-100 rounded hover:bg-amber-100 text-amber-600"><Unlock size={14}/></button><button onClick={() => openEditModal(m)} className="p-1 bg-slate-100 rounded hover:bg-blue-100 text-blue-600"><Pencil size={14}/></button><button onClick={() => handleDeleteUser(m.id)} className="p-1 bg-slate-100 rounded hover:bg-red-100 text-red-600"><Trash2 size={14}/></button></>}</td></tr>))}</tbody></table></div>
      </div>
      {isInviteOpen && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-md w-full"><h3 className="font-bold text-lg mb-4">{isEditMode ? 'Edit User' : 'Tambah User'}</h3><form onSubmit={handleSaveUser} className="space-y-3"><input className="w-full border rounded p-2" placeholder="Nama" value={newName} onChange={e=>setNewName(e.target.value)}/><input className="w-full border rounded p-2" placeholder="Username" value={newUsername} onChange={e=>setNewUsername(e.target.value)}/><input className="w-full border rounded p-2" placeholder="Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><div className="grid grid-cols-2 gap-2"><input className="w-full border rounded p-2" placeholder="No HP" value={newPhone} onChange={e=>setNewPhone(e.target.value)}/><input className="w-full border rounded p-2" placeholder="Tele Username (tanpa @)" value={newTelegramUser} onChange={e=>setNewTelegramUser(e.target.value)}/></div><input className="w-full border rounded p-2" placeholder="Tele Chat ID (Opsional, untuk DM)" value={newTelegramChatId} onChange={e=>setNewTelegramChatId(e.target.value)}/><select className="w-full border rounded p-2" value={newRole} onChange={e=>setNewRole(e.target.value)}><option value="Staff">Staff</option><option value="Admin">Admin</option><option value="Owner">Owner</option></select><div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 py-2 bg-slate-100 rounded">Batal</button><button className="flex-1 py-2 bg-blue-600 text-white rounded">{isEditMode ? 'Update' : 'Simpan'}</button></div></form></div></div>}
    </div>
  );
}

// --- Requests View ---
function RequestsView({ user, username, displayName, userRole }) {
  const [activeView, setActiveView] = useState(userRole === 'Staff' ? 'my_requests' : 'approval');
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('Izin');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [quotas, setQuotas] = useState({ izinUsed: 0, cutiUsed: 0 });

  useEffect(() => {
    if (!user) return;
    const reqRef = collection(db, 'artifacts', appId, 'public', 'data', 'leave_requests');
    let q = (userRole === 'Owner' || userRole === 'Admin') ? query(reqRef) : query(reqRef, where('username', '==', username));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setRequests(data);
        const myReqs = data.filter(r => r.username === username && r.status === 'Disetujui');
        const currentYear = new Date().getFullYear();
        const currentWeek = getWeekNumber(new Date());
        setQuotas({ 
            izinUsed: myReqs.filter(r => r.type === 'Izin' && r.week === currentWeek).length,
            cutiUsed: myReqs.filter(r => r.type === 'Cuti' && r.year === currentYear).reduce((acc, curr) => acc + curr.daysCount, 0)
        });
    });
    return () => unsubscribe();
  }, [user, username, userRole]);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setEvidence(reader.result);
          reader.readAsDataURL(file);
      }
  };

  const validateRequest = () => {
      const now = new Date();
      const start = new Date(startDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = start - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (type === 'Izin') {
          if (quotas.izinUsed >= 1) return "Kuota Izin mingguan (1x) sudah habis.";
          if (diffDays <= 0) return "Izin harus diajukan H-1 sebelum jam 17:00.";
          if (diffDays === 1 && now.getHours() >= 17) return "Batas pengajuan Izin untuk besok adalah jam 17:00 hari ini.";
      }
      if (type === 'Sakit') {
          if (diffDays === 0 && now.getHours() >= 12) return "Batas pemberitahuan Sakit adalah jam 12:00 siang.";
          if (diffDays < 0) return "Tidak bisa mengajukan sakit untuk tanggal yang sudah lewat.";
      }
      if (type === 'Cuti') {
          if (diffDays < 14) return "Pengajuan Cuti wajib minimal 14 hari sebelumnya.";
          const end = new Date(endDate);
          const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          if (quotas.cutiUsed + duration > 12) return `Sisa kuota cuti tahunan tidak mencukupi. (Sisa: ${12 - quotas.cutiUsed} hari)`;
      }
      return null;
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const errorMsg = validateRequest();
      if (errorMsg) return alert("Gagal: " + errorMsg);
      try {
          const start = new Date(startDate);
          const end = new Date(endDate || startDate);
          const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leave_requests'), {
              username, name: displayName, type, reason, start: startDate, end: endDate || startDate, daysCount, evidence, status: 'Menunggu', year: new Date().getFullYear(), week: getWeekNumber(new Date()), createdAt: serverTimestamp()
          });
          setIsModalOpen(false); setReason(''); setEvidence(null); setStartDate(''); setEndDate('');
          alert("Pengajuan berhasil dikirim.");
          sendTelegramMessage(`📄 *Permohonan Baru*\nOleh: ${displayName}\nJenis: ${type}\nTanggal: ${startDate}`);
      } catch (e) { console.error(e); }
  };

  const handleApproval = async (id, status, reqName) => {
      if (userRole !== 'Owner' && userRole !== 'Admin') return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leave_requests', id), { status, approvedBy: displayName, approvedAt: serverTimestamp() });
          sendTelegramMessage(`📢 *Update Permohonan*\n${reqName}\nStatus: ${status} oleh ${displayName}`);
      } catch(e) { console.error(e); }
  };

  return (
      <div className="space-y-6 animate-in fade-in">
          {(userRole === 'Owner' || userRole === 'Manager' || userRole === 'Admin') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Kuota Cuti Tahunan</p><div className="flex justify-between items-end mt-2"><span className="text-2xl font-bold text-slate-800">{12 - quotas.cutiUsed} <span className="text-sm font-normal text-slate-400">/ 12 Hari</span></span><Briefcase size={20} className="text-blue-500 opacity-50" /></div></div>
               <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs text-slate-500 font-bold uppercase">Izin Minggu Ini</p><div className="flex justify-between items-end mt-2"><span className="text-2xl font-bold text-slate-800">{1 - quotas.izinUsed} <span className="text-sm font-normal text-slate-400">/ 1 Kesempatan</span></span><AlertCircle size={20} className="text-amber-500 opacity-50" /></div></div>
               <button onClick={() => setActiveView(activeView === 'approval' ? 'my_requests' : 'approval')} className="bg-slate-800 text-white p-4 rounded-xl shadow-sm hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-2">{activeView === 'approval' ? <History size={20} /> : <CheckSquare size={20} />}<span className="text-sm font-bold">{activeView === 'approval' ? 'Lihat Riwayat Saya' : 'Mode Approval'}</span></button>
            </div>
          )}
          
          <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">{activeView === 'approval' ? 'Menunggu Persetujuan' : 'Riwayat Pengajuan Saya'}</h3>{activeView !== 'approval' && <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700"><Plus size={16} /> Buat Pengajuan</button>}</div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             {activeView === 'approval' && (userRole === 'Owner' || userRole === 'Admin') ? (
                 <div className="divide-y divide-slate-100">
                     {requests.filter(r => r.status === 'Menunggu').length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada pengajuan pending.</div>}
                     {requests.filter(r => r.status === 'Menunggu').map(req => (
                         <div key={req.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div className="flex gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${req.type === 'Sakit' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{req.type.charAt(0)}</div>
                                 <div><h4 className="font-bold text-slate-800">{req.name} <span className="font-normal text-slate-500 text-xs">({req.type})</span></h4><p className="text-sm text-slate-600 mt-1">{req.reason}</p><div className="flex gap-4 mt-2 text-xs text-slate-500"><span className="flex items-center gap-1"><Calendar size={12}/> {req.start} s.d {req.end}</span>{req.evidence && <span className="text-blue-500 underline cursor-pointer" onClick={() => {const w=window.open(); w.document.write('<img src="'+req.evidence+'"/>')}}>Lihat Bukti</span>}</div></div>
                             </div>
                             <div className="flex gap-2"><button onClick={() => handleApproval(req.id, 'Ditolak', req.name)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center gap-1"><X size={14}/> Tolak</button><button onClick={() => handleApproval(req.id, 'Disetujui', req.name)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"><Check size={14}/> Setujui</button></div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="divide-y divide-slate-100">
                     {requests.filter(r => r.username === username).map(req => (
                         <div key={req.id} className="p-4 flex justify-between items-center">
                             <div><div className="flex items-center gap-2"><span className={`text-xs font-bold px-2 py-0.5 rounded ${req.type==='Sakit'?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>{req.type}</span><span className="text-sm font-medium text-slate-800">{req.reason}</span></div><p className="text-xs text-slate-400 mt-1">{req.start} - {req.end}</p></div>
                             <span className={`text-xs font-bold px-3 py-1 rounded-full ${req.status === 'Menunggu' ? 'bg-amber-100 text-amber-700' : req.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
                         </div>
                     ))}
                     {requests.filter(r => r.username === username).length === 0 && <div className="p-8 text-center text-slate-400">Belum ada riwayat pengajuan.</div>}
                 </div>
             )}
          </div>
          {isModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="font-bold text-slate-800">Form Pengajuan</h3><button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button></div>
                      <form onSubmit={handleSubmit} className="p-6 space-y-4">
                          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg mb-2"><p className="font-bold mb-1">Aturan:</p><ul className="list-disc ml-4 space-y-0.5"><li>Izin: Maks H-1 (17:00).</li><li>Sakit: Hari H (12:00).</li><li>Cuti: Min H-14.</li></ul></div>
                          <div><label className="block text-xs font-bold text-slate-500 mb-1">Jenis</label><select className="w-full border rounded-lg p-2 text-sm bg-white" value={type} onChange={e => setType(e.target.value)}><option value="Izin">Izin (Pribadi)</option><option value="Sakit">Sakit</option><option value="Cuti">Cuti Tahunan</option></select></div>
                          <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-bold text-slate-500 mb-1">Mulai</label><input type="date" required className="w-full border rounded-lg p-2 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} /></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Sampai</label><input type="date" required className="w-full border rounded-lg p-2 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} /></div></div>
                          <div><label className="block text-xs font-bold text-slate-500 mb-1">Alasan</label><textarea required className="w-full border rounded-lg p-2 text-sm h-20 resize-none" placeholder="Jelaskan..." value={reason} onChange={e => setReason(e.target.value)}></textarea></div>
                          <div><label className="block text-xs font-bold text-slate-500 mb-1">Bukti (Opsional)</label><div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 relative"><input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><div className="flex flex-col items-center gap-1 pointer-events-none">{evidence ? <CheckCircle2 size={24} className="text-emerald-500"/> : <UploadCloud size={24} className="text-slate-400"/>}<span className="text-xs text-slate-500">{evidence ? "File Terlampir" : "Upload foto/surat"}</span></div></div></div>
                          <div className="pt-2 flex gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 bg-slate-100 rounded-lg text-sm font-medium">Batal</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Kirim</button></div>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
}

// --- Attendance View ---
function AttendanceView({ user, username, displayName, userRole, teamMembers }) {
  const [schedule, setSchedule] = useState({ start: '09:00', end: '17:00', officeLat: -6.2088, officeLng: 106.8456 });
  const [todayLog, setTodayLog] = useState(null);
  const [allLogs, setAllLogs] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('in');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchAttendanceData = async () => {
        const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'attendance_settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) setSchedule(prev => ({...prev, ...settingsSnap.data()}));
        const todayStr = new Date().toISOString().split('T')[0];
        const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'attendance_logs');
        const q = query(logsRef, where('username', '==', username), where('date', '==', todayStr));
        onSnapshot(q, (snapshot) => { setTodayLog(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }); });
        if (userRole === 'Owner' || userRole === 'Admin') {
            onSnapshot(query(logsRef, where('date', '==', todayStr)), (snapshot) => { setAllLogs(snapshot.docs.map(d => ({id: d.id, ...d.data()}))); });
        }
    };
    fetchAttendanceData();
  }, [user, username]);

  const handleUpdateSchedule = async (e) => {
      e.preventDefault();
      try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance_settings', 'global'), schedule); alert("Jadwal disimpan!"); } catch (e) { console.error(e); }
  };

  const startCamera = (mode) => {
      // Permission Check UI could be added here
      const now = new Date();
      if (mode === 'in' && now.toTimeString().slice(0, 5) > schedule.start) { setShowLateModal(true); return; }
      openCameraFlow(mode);
  };

  const openCameraFlow = (mode) => {
      setCameraMode(mode);
      setIsCameraOpen(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => {
                alert("Gagal akses kamera: " + err.message + ". Pastikan izin kamera diberikan di browser.");
                setIsCameraOpen(false);
            });
      } else {
          alert("Browser tidak mendukung.");
          setIsCameraOpen(false);
      }
  };

  const captureAndSubmit = async () => {
      setIsProcessing(true);
      if (!navigator.geolocation) return alert("Geolocation tidak didukung.");
      
      // Request permission explicit if needed (browser handles this)
      navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const dist = calculateDistance(latitude, longitude, schedule.officeLat, schedule.officeLng);
          const context = canvasRef.current.getContext('2d');
          context.drawImage(videoRef.current, 0, 0, 320, 240);
          const imageSrc = canvasRef.current.toDataURL('image/jpeg', 0.5);
          stopCamera();
          const now = new Date();
          const timeString = now.toTimeString().slice(0, 5);
          const todayStr = now.toISOString().split('T')[0];
          try {
              if (cameraMode === 'in') {
                  let status = timeString > schedule.start ? 'Telat' : 'Tepat Waktu';
                  await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'attendance_logs'), {
                      username, name: displayName, date: todayStr, clockIn: timeString, clockInPhoto: imageSrc, locationIn: { lat: latitude, lng: longitude },
                      distanceIn: Math.round(dist), locationStatusIn: dist > 5 ? 'Diluar Jangkauan' : 'Di Kantor', lateReason: status === 'Telat' ? lateReason : null, statusIn: status, createdAt: serverTimestamp()
                  });
              } else {
                  let status = timeString >= schedule.end ? 'Normal' : 'Pulang Cepat';
                  await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'attendance_logs', todayLog.id), { clockOut: timeString, clockOutPhoto: imageSrc, locationOut: { lat: latitude, lng: longitude }, statusOut: status });
              }
              alert("Absen Berhasil!"); setLateReason('');
          } catch (e) { alert("Gagal absen."); } finally { setIsProcessing(false); }
      }, (error) => { alert("Gagal ambil lokasi: " + error.message); setIsProcessing(false); }, {enableHighAccuracy: true, timeout: 20000});
  };

  const stopCamera = () => { videoRef.current?.srcObject?.getTracks().forEach(track => track.stop()); setIsCameraOpen(false); };

  return (
      <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Absensi Saya</h3>
                  <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div><p className="text-xs text-slate-500 font-semibold">MASUK</p><p className="font-bold text-slate-800">{todayLog?.clockIn || '--:--'}</p>{todayLog?.locationStatusIn === 'Diluar Jangkauan' && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle size={10}/> Diluar Area ({todayLog.distanceIn}m)</span>}</div>
                          {todayLog ? <div className="text-right"><span className={`px-2 py-1 rounded text-xs font-bold ${todayLog.statusIn === 'Telat' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{todayLog.statusIn}</span>{todayLog.lateReason && <p className="text-[10px] text-slate-500 mt-1 max-w-[100px] truncate">{todayLog.lateReason}</p>}</div> : <button onClick={() => startCamera('in')} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm">Masuk (Izinkan Kamera)</button>}
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div><p className="text-xs text-slate-500 font-semibold">PULANG</p><p className="font-bold text-slate-800">{todayLog?.clockOut || '--:--'}</p></div>
                          {todayLog?.clockOut ? <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">{todayLog.statusOut}</span> : <button disabled={!todayLog} onClick={() => startCamera('out')} className={`px-4 py-1.5 rounded-lg text-sm ${!todayLog ? 'bg-slate-200 text-slate-400' : 'bg-amber-500 text-white'}`}>Pulang (Izinkan Kamera)</button>}
                      </div>
                  </div>
              </div>
              {(userRole === 'Owner' || userRole === 'Admin') && <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={20}/> Jadwal & Lokasi</h3><form onSubmit={handleUpdateSchedule} className="space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-500">Masuk</label><input type="time" className="w-full border rounded p-1.5 text-sm" value={schedule.start} onChange={e => setSchedule({...schedule, start: e.target.value})} /></div><div><label className="text-xs font-bold text-slate-500">Pulang</label><input type="time" className="w-full border rounded p-1.5 text-sm" value={schedule.end} onChange={e => setSchedule({...schedule, end: e.target.value})} /></div><div><label className="text-xs font-bold text-slate-500">Lat</label><input type="number" step="any" className="w-full border rounded p-1.5 text-sm" value={schedule.officeLat} onChange={e => setSchedule({...schedule, officeLat: parseFloat(e.target.value)})} /></div><div><label className="text-xs font-bold text-slate-500">Lng</label><input type="number" step="any" className="w-full border rounded p-1.5 text-sm" value={schedule.officeLng} onChange={e => setSchedule({...schedule, officeLng: parseFloat(e.target.value)})} /></div></div><button className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm mt-2">Simpan</button></form></div>}
          </div>
          {(userRole === 'Owner' || userRole === 'Admin') && <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-800">Rekap Hari Ini</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-600"><thead className="bg-slate-50 font-semibold text-xs uppercase"><tr><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Masuk</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Lokasi</th></tr></thead><tbody className="divide-y divide-slate-100">{allLogs.map(log => (<tr key={log.id}><td className="px-6 py-4 font-medium">{log.name}</td><td className="px-6 py-4 font-mono">{log.clockIn}</td><td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.statusIn==='Telat'?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700'}`}>{log.statusIn}</span></td><td className="px-6 py-4 text-xs">{log.locationStatusIn}</td></tr>))}</tbody></table></div></div>}
          {showLateModal && <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full"><h3 className="font-bold text-lg text-center mb-2">Terlambat!</h3><textarea className="w-full border rounded-xl p-3 text-sm mb-4" rows="3" placeholder="Alasan..." value={lateReason} onChange={e => setLateReason(e.target.value)}></textarea><button onClick={() => {if(!lateReason)return alert('Isi alasan!'); setShowLateModal(false); openCameraFlow('in');}} className="w-full bg-red-600 text-white py-2.5 rounded-xl">Lanjut Foto</button></div></div>}
          {isCameraOpen && <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"><div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"><div className="relative bg-black aspect-[4/3]"><video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video><canvas ref={canvasRef} width="320" height="240" className="hidden"></canvas>{isProcessing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><Loader2 className="animate-spin"/></div>}</div><div className="p-4 flex justify-center gap-4"><button onClick={stopCamera} className="text-slate-500">Batal</button><button disabled={isProcessing} onClick={captureAndSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-full">Ambil Foto & Lokasi</button></div></div></div>}
      </div>
  );
}

// --- Kanban Components ---
function KanbanBoard({ tasks, teamMembers, user, userRole, username, displayName, onCelebrate, onRequestDelete, currentUserId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectPriority, setProjectPriority] = useState('Medium');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [projectVisibility, setProjectVisibility] = useState('all'); 
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [comments, setComments] = useState([]); // New Comments State
  const [newComment, setNewComment] = useState(''); // New Comment Input
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempSubTaskAssignees, setTempSubTaskAssignees] = useState([]); 
  const [isSubTaskAssigneeOpen, setIsSubTaskAssigneeOpen] = useState(false);

  const canAdd = userRole === 'Owner' || userRole === 'Admin';
  // Staff bisa edit jika tugas ini milik mereka atau ditugaskan
  const canEdit = canAdd || userRole === 'Staff';
  const canDelete = userRole === 'Owner';

  const toggleAssignee = (memberId) => {
    if (selectedAssignees.includes(memberId)) setSelectedAssignees(selectedAssignees.filter(id => id !== memberId));
    else setSelectedAssignees([...selectedAssignees, memberId]);
  };

  const toggleSubTaskAssignee = (memberId) => {
    if (tempSubTaskAssignees.includes(memberId)) setTempSubTaskAssignees(tempSubTaskAssignees.filter(id => id !== memberId));
    else setTempSubTaskAssignees([...tempSubTaskAssignees, memberId]);
  };

  const addSubTask = () => {
    if (!tempTaskName.trim()) return;
    const currentAssigneesData = tempSubTaskAssignees.map(id => {
        const m = teamMembers.find(mem => mem.id === id);
        return { uid: id, name: m ? m.name : 'Unknown' };
    });
    setSubTasks([...subTasks, { 
        id: Date.now().toString(), 
        title: tempTaskName, 
        assignees: currentAssigneesData, 
        isDone: false 
    }]);
    setTempTaskName('');
    setTempSubTaskAssignees([]);
    setIsSubTaskAssigneeOpen(false);
  };

  const handleAddComment = () => {
      if (!newComment.trim()) return;
      setComments([...comments, { 
          id: Date.now().toString(), 
          text: newComment, 
          author: displayName, 
          role: userRole, 
          time: new Date().toISOString() 
      }]);
      setNewComment('');
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!canAdd && (!editingTaskId || userRole !== 'Staff')) return;

    try {
      let finalSubTasks = [...subTasks];
      if (tempTaskName.trim()) {
          const currentAssigneesData = tempSubTaskAssignees.map(id => {
              const m = teamMembers.find(mem => mem.id === id);
              return { uid: id, name: m ? m.name : 'Unknown' };
          });
          finalSubTasks.push({ id: Date.now().toString(), title: tempTaskName, assignees: currentAssigneesData, isDone: false });
      }

      const fullAssignees = selectedAssignees.map(id => { const m = teamMembers.find(x => x.id === id); return { uid: m.id, name: m.name, role: m.role }; });
      const data = { 
          title: projectTitle, 
          description: projectDesc, 
          priority: projectPriority, 
          deadline: projectDeadline, 
          visibility: projectVisibility, 
          assignees: fullAssignees, 
          subTasks: finalSubTasks,
          comments: comments // Save comments
      };
      
      let telegramMsg = '';
      const taggedUsers = fullAssignees.map(a => {
          const m = teamMembers.find(tm => tm.id === a.uid);
          return m && m.telegramUsername ? `@${m.telegramUsername}` : a.name;
      }).join(' ');

      const detailMsg = `\n\n📌 <b>${projectTitle}</b>\n📝 ${projectDesc}\n📅 Deadline: ${projectDeadline}\n🚨 Prioritas: ${projectPriority}\n👥 Assignees: ${taggedUsers}`;

      if (editingTaskId) {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_tasks', editingTaskId), { ...data, history: arrayUnion({ action: 'Edited', by: displayName, at: new Date().toISOString() }) });
         telegramMsg = `✏️ <b>Proyek Diupdate</b>${detailMsg}\n\nOleh: ${displayName}`;
      } else {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'team_tasks'), { ...data, status: 'Antrian Project', createdBy: username, createdAt: serverTimestamp(), history: [{ action: 'Created', by: displayName, at: new Date().toISOString() }] });
         telegramMsg = `🚀 <b>Proyek Baru Dibuat</b>${detailMsg}\n\nOleh: ${displayName}`;
      }
      
      if (projectVisibility === 'management') {
          fullAssignees.forEach(assignee => {
              const member = teamMembers.find(m => m.id === assignee.uid);
              if (member && member.telegramChatId) {
                 sendTelegramMessage(`🔒 <b>Management Alert</b>\n${telegramMsg}`, member.telegramChatId);
              }
          });
      } else {
          sendTelegramMessage(telegramMsg);
      }

      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id, status, old) => {
      if (status === old) return;
      if (old === 'Review' && status === 'Done' && userRole === 'Staff') {
          alert("Hanya Manager/Owner yang bisa memvalidasi ke Done.");
          return;
      }
      
      const task = tasks.find(t => t.id === id);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_tasks', id), { status, history: arrayUnion({ action: 'Move', by: displayName, at: new Date().toISOString(), detail: `${old} -> ${status}` }) });
      
      const taggedUsers = task.assignees?.map(a => {
          const m = teamMembers.find(tm => tm.id === a.uid);
          return m && m.telegramUsername ? `@${m.telegramUsername}` : a.name;
      }).join(' ');
      
      const msg = `🔄 <b>Status Berubah</b>\n\n📌 <b>${task.title}</b>\n${old} ➡️ <b>${status}</b>\n👥 Assignees: ${taggedUsers}\n\nOleh: ${displayName}`;

      if (task.visibility === 'management') {
          task.assignees?.forEach(assignee => {
              const member = teamMembers.find(m => m.id === assignee.uid);
              if (member && member.telegramChatId) sendTelegramMessage(`🔒 ${msg}`, member.telegramChatId);
          });
      } else {
          sendTelegramMessage(msg);
      }

      if (status === 'Done') onCelebrate();
  };

  const handleToggleSubTask = async (task, idx) => {
      const newSubTasks = [...(task.subTasks || [])];
      newSubTasks[idx].isDone = !newSubTasks[idx].isDone;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_tasks', task.id), { subTasks: newSubTasks });
  };

  const handleDragStart = (e, id) => e.dataTransfer.setData('text/plain', id);
  const handleDrop = (e, status) => {
      const id = e.dataTransfer.getData('text/plain');
      const task = tasks.find(t => t.id === id);
      if (task) handleUpdateStatus(id, status, task.status);
  };

  const columns = [
    { id: 'Antrian Project', title: 'Antrian', bg: 'bg-slate-50' },
    { id: 'Pending', title: 'Pending', bg: 'bg-red-50' },
    { id: 'To Do', title: 'To Do', bg: 'bg-indigo-50' },
    { id: 'Doing', title: 'Doing', bg: 'bg-blue-50' },
    { id: 'Review', title: 'Review', bg: 'bg-amber-50' },
    { id: 'Done', title: 'Done', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">{canAdd && <button onClick={() => { setEditingTaskId(null); setProjectTitle(''); setProjectDesc(''); setProjectDeadline(''); setProjectVisibility('all'); setSubTasks([]); setSelectedAssignees([]); setComments([]); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 text-sm"><Plus size={16}/> Proyek Baru</button>}</div>
      <div className="flex-1 overflow-x-auto pb-2"><div className="flex h-full gap-4 min-w-[1600px]">{columns.map(col => (
          <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, col.id)} className={`flex-1 flex flex-col h-full min-w-[240px] rounded-xl border border-slate-200 p-2 ${col.bg}`}>
              <div className="flex justify-between px-2 mb-2"><span className="font-bold text-slate-700 text-sm">{col.title}</span><span className="text-xs bg-white px-2 py-0.5 rounded border">{tasks.filter(t => t.status === col.id).length}</span></div>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">{tasks.filter(t => t.status === col.id).map(t => {
                  const isAssigned = t.assignees?.some(a => a.uid === currentUserId);
                  const isCreator = t.createdBy === username;
                  const canEditCard = canAdd || (userRole === 'Staff' && (isAssigned || isCreator));
                  
                  return (
                    <TaskCard key={t.id} task={t} 
                        canEdit={true} 
                        canDelete={canDelete} 
                        onDragStart={handleDragStart} 
                        onEdit={() => { 
                            if (userRole === 'Staff' && !isAssigned && !isCreator) { alert("Anda tidak memiliki akses edit."); return; }
                            setEditingTaskId(t.id); setProjectTitle(t.title); setProjectDesc(t.description); setProjectDeadline(t.deadline||''); setProjectVisibility(t.visibility || 'all'); setSubTasks(t.subTasks||[]); setSelectedAssignees(t.assignees?.map(a=>a.uid)||[]); setComments(t.comments || []); setIsModalOpen(true); 
                        }} 
                        onDelete={() => onRequestDelete(t.id)} 
                        onStatusChange={handleUpdateStatus} 
                        onToggleSubTask={handleToggleSubTask} 
                    />
                  );
              })}</div>
          </div>
      ))}</div></div>
      
      {/* Modal Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <h3 className="font-bold text-lg mb-4">{editingTaskId ? 'Edit Proyek / Tambah Task' : 'Proyek Baru'}</h3>
                <form onSubmit={handleSaveProject} className="space-y-4">
                    {/* ... (Existing Inputs) ... */}
                    <input disabled={userRole==='Staff'} className={`w-full border rounded p-2 ${userRole==='Staff'?'bg-slate-100 text-slate-500':''}`} placeholder="Judul Proyek" value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} />
                    
                    {(userRole === 'Owner' || userRole === 'Admin') && (
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${projectVisibility === 'all' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'text-slate-500'}`}>
                                <input type="radio" name="visibility" value="all" checked={projectVisibility === 'all'} onChange={() => setProjectVisibility('all')} className="hidden" />
                                <Eye size={16} /> Semua Tim
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${projectVisibility === 'management' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'text-slate-500'}`}>
                                <input type="radio" name="visibility" value="management" checked={projectVisibility === 'management'} onChange={() => setProjectVisibility('management')} className="hidden" />
                                <EyeOff size={16} /> Management Only
                            </label>
                        </div>
                    )}
                    
                    <textarea disabled={userRole==='Staff'} className={`w-full border rounded p-2 h-20 ${userRole==='Staff'?'bg-slate-100 text-slate-500':''}`} placeholder="Deskripsi Singkat" value={projectDesc} onChange={e=>setProjectDesc(e.target.value)} />
                    <div><label className="text-xs font-bold text-slate-500 mb-1 block">Prioritas & Deadline</label><div className="flex gap-2"><select disabled={userRole==='Staff'} className="w-1/2 border rounded p-2" value={projectPriority} onChange={e=>setProjectPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select><input disabled={userRole==='Staff'} type="date" className="w-1/2 border rounded p-2" value={projectDeadline} onChange={e=>setProjectDeadline(e.target.value)} /></div></div>
                    
                    <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tim Inti Proyek</label>
                        <div className={`flex flex-wrap gap-2 border p-2 rounded max-h-24 overflow-y-auto ${userRole==='Staff'?'bg-slate-50':''}`}>
                            {teamMembers.map(m => (
                                <div key={m.id} onClick={() => userRole!=='Staff' && toggleAssignee(m.id)} className={`px-2 py-1 rounded text-xs border ${selectedAssignees.includes(m.id) ? 'bg-blue-100 border-blue-300' : 'bg-slate-50'} ${userRole!=='Staff'?'cursor-pointer':''}`}>{m.name}</div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <label className="text-xs font-bold text-slate-500 mb-2 block">Task List (Staff Bisa Menambah)</label>
                        <div className="flex gap-2 mb-2 relative">
                            <input className="flex-1 border rounded p-2 text-sm" placeholder="Tambah tugas baru..." value={tempTaskName} onChange={e=>setTempTaskName(e.target.value)} />
                            <button type="button" onClick={() => setIsSubTaskAssigneeOpen(!isSubTaskAssigneeOpen)} className="border rounded px-3 text-sm bg-white text-slate-600">{tempSubTaskAssignees.length > 0 ? `${tempSubTaskAssignees.length} Orang` : 'Pilih PIC'}</button>
                            {isSubTaskAssigneeOpen && (
                                <div className="absolute top-10 right-12 w-48 bg-white border shadow-lg rounded p-1 z-10 max-h-40 overflow-y-auto">
                                    {teamMembers.map(m => (
                                        <div key={m.id} onClick={() => toggleSubTaskAssignee(m.id)} className={`px-2 py-1 text-xs cursor-pointer hover:bg-slate-50 ${tempSubTaskAssignees.includes(m.id) ? 'text-blue-600 font-bold' : ''}`}>{m.name}</div>
                                    ))}
                                </div>
                            )}
                            <button type="button" onClick={addSubTask} className="bg-slate-800 text-white px-3 rounded"><Plus size={16}/></button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {subTasks.map((st, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border text-sm">
                                    <span>{st.title} <span className="text-[10px] text-blue-600 ml-2">({st.assignees?.map(a=>a.name).join(', ') || 'Unassigned'})</span></span>
                                    <button type="button" onClick={() => {const n = [...subTasks]; n.splice(i,1); setSubTasks(n);}} className="text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEW: Comments Section */}
                    {editingTaskId && (
                        <div className="border-t pt-4">
                             <label className="text-xs font-bold text-slate-500 mb-2 block">Komentar & Review</label>
                             <div className="bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto space-y-3 mb-3">
                                 {comments.length > 0 ? comments.map((c) => (
                                     <div key={c.id} className={`flex flex-col ${c.author === displayName ? 'items-end' : 'items-start'}`}>
                                         <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${c.author === displayName ? 'bg-blue-100 text-blue-800' : 'bg-white border text-slate-700'}`}>
                                             <p>{c.text}</p>
                                         </div>
                                         <span className="text-[10px] text-slate-400 mt-1">{c.author} • {new Date(c.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                     </div>
                                 )) : <p className="text-center text-xs text-slate-400 italic">Belum ada komentar.</p>}
                             </div>
                             <div className="flex gap-2">
                                 <input className="flex-1 border rounded p-2 text-sm" placeholder="Tulis komentar..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                                 <button type="button" onClick={handleAddComment} className="bg-slate-200 p-2 rounded text-slate-600 hover:bg-slate-300"><Send size={16}/></button>
                             </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded">Batal</button>
                        <button className="flex-1 py-2 bg-blue-600 text-white rounded">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onDragStart, onEdit, onDelete, onStatusChange, onToggleSubTask, canEdit, canDelete }) {
  const subTasks = task.subTasks || [];
  const completed = subTasks.filter(s => s.isDone).length;
  const progress = subTasks.length ? Math.round((completed / subTasks.length) * 100) : 0;
  
  return (
    <div draggable onDragStart={e => onDragStart(e, task.id)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">{task.priority}</span>
                {task.visibility === 'management' && <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-1"><EyeOff size={10}/> Private</span>}
                {task.deadline && <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-50 text-red-600 border border-red-100"><Calendar size={9}/> {task.deadline}</span>}
            </div>
            <div className="flex gap-1">
               {/* Show buttons directly without hover group for better UX on mobile/touch */}
               <button onClick={onEdit} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-500" title="Edit / Tambah Task"><Pencil size={12}/></button>
               {canEdit && <button onClick={onEdit} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-green-500" title="Cepat Tambah"><PlusCircle size={12}/></button>}
               {canDelete && <button onClick={onDelete} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>}
            </div>
        </div>
        <h4 className="font-bold text-sm text-slate-800 mb-1">{task.title}</h4>
        
        {/* Progress Bar */}
        {subTasks.length > 0 && <div className="mt-2 mb-1"><div className="flex justify-between text-[10px] text-slate-500 mb-0.5"><span>Progress</span><span>{progress}%</span></div><div className="h-1 bg-slate-100 rounded-full"><div className="h-1 bg-blue-500 rounded-full transition-all" style={{width: `${progress}%`}}></div></div></div>}
        
        {/* Subtasks Checklist */}
        {subTasks.length > 0 && <div className="mt-2 space-y-1 max-h-20 overflow-y-auto custom-scrollbar">{subTasks.map((st, i) => (
            <div key={i} className="flex items-start gap-2"><input type="checkbox" checked={st.isDone} onChange={() => onToggleSubTask(task, i)} className="mt-0.5 w-3 h-3 cursor-pointer"/><div className="flex-1 min-w-0"><p className={`text-[10px] truncate ${st.isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</p><div className="flex -space-x-1 mt-0.5">{st.assignees?.map((a, j) => <div key={j} className="w-3 h-3 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[6px] font-bold text-blue-600" title={a.name}>{a.name.charAt(0)}</div>)}</div></div></div>
        ))}</div>}
        
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
            <div className="flex -space-x-1">{task.assignees?.slice(0,3).map((a,i) => <div key={i} className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[8px] font-bold text-blue-600" title={a.name}>{a.name.charAt(0)}</div>)}</div>
            <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value, task.status)} className="text-[10px] border rounded bg-white px-1 py-0.5 max-w-[80px]"><option>To Do</option><option>Doing</option><option>Done</option><option>Review</option><option>Pending</option><option>Antrian Project</option></select>
        </div>
    </div>
  );
}

