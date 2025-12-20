
import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAppStore } from '../context/StoreContext';
import { Users, LogOut, ChevronUp, ChevronDown, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const RoleSwitcher = () => {
  const store = useAppStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // ONLY show if the REAL user is a Superadmin
  // If we are impersonating, realUser will be set. If not, currentUser is checked.
  const isSuperAdmin = (store.realUser?.role === UserRole.SUPERADMIN) || (store.currentUser?.role === UserRole.SUPERADMIN);

  if (!isSuperAdmin) return null;

  const handleSwitch = (role: UserRole) => {
    store.impersonate(role);
    setIsOpen(false);
    
    // Redirect to the role's default dashboard
    if (role === UserRole.OWNER) router.push('/owner/dashboard');
    else if (role === UserRole.MANAGER) router.push('/manager/kanban');
    else if (role === UserRole.FINANCE) router.push('/finance/dashboard');
    else if (role === UserRole.STAFF) router.push('/staff/attendance');
    else router.push('/superadmin/dashboard'); // Fallback (concept)
  };

  const handleStop = () => {
     store.stopImpersonation();
     setIsOpen(false);
     router.push('/login'); // Or superadmin home?
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 animate-in slide-in-from-bottom duration-500">
       
       {/* Active Indicator Strip */}
       {store.realUser && (
         <div className="bg-rose-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 animate-pulse">
            <UserCheck size={14} /> MODE PREVIEW: {store.currentUser?.role}
         </div>
       )}

       {isOpen && (
         <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 w-64 mb-2 overflow-hidden animate-in zoom-in duration-200 origin-bottom-right">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 mb-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SWITCH ROLE VIEW</p>
            </div>
            
            {[UserRole.OWNER, UserRole.MANAGER, UserRole.FINANCE, UserRole.STAFF].map(role => (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${store.currentUser?.role === role ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                 <div className={`w-2 h-2 rounded-full ${
                    role === UserRole.OWNER ? 'bg-purple-500' :
                    role === UserRole.MANAGER ? 'bg-amber-500' :
                    role === UserRole.FINANCE ? 'bg-emerald-500' : 'bg-blue-500'
                 }`}></div>
                 {role}
              </button>
            ))}

            {store.realUser && (
               <div className="border-t border-slate-100 mt-1 pt-1">
                  <button onClick={handleStop} className="w-full text-left px-4 py-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 transition flex items-center gap-2">
                     <LogOut size={14} /> STOP PREVIEW
                  </button>
               </div>
            )}
         </div>
       )}

       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 transition hover:scale-110 active:scale-95 flex items-center gap-2"
       >
          <Users size={20} />
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
       </button>
    </div>
  );
};
