import React, { useState } from 'react';
import { UserRole } from '../types';
import { useStore } from '../store'; // Or context if available
import { Monitor, Eye, X, ChevronUp, ChevronDown } from 'lucide-react';

export const ReviewerWidget = ({ store }: { store: ReturnType<typeof useStore> }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Widget only appears if:
  // 1. Real user is Superadmin (we are impersonating)
  // 2. OR Current user is Superadmin (we are not impersonating yet)
  const isSuperAccess = 
    store.realUser?.role === UserRole.SUPERADMIN || 
    store.currentUser?.role === UserRole.SUPERADMIN;

  if (!isSuperAccess) return null;

  const currentRole = store.currentUser?.role;
  const isImpersonating = !!store.realUser;

  const roles = [UserRole.OWNER, UserRole.MANAGER, UserRole.FINANCE, UserRole.STAFF];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom duration-500">
      <div className={`bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'w-64' : 'w-14 h-14 rounded-full'}`}>
        
        {/* Header / Toggle */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 p-4 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition"
        >
          <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
            <Monitor size={16} />
            {isOpen && <span>Dev Control</span>}
          </div>
          {isOpen ? <ChevronDown size={16} className="text-white/70" /> : null}
        </div>

        {/* Content */}
        {isOpen && (
          <div className="p-4 space-y-4">
             <div className="space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CURRENT VIEW:</p>
               <div className="flex items-center gap-2 text-white font-bold text-xs bg-slate-800 p-2 rounded-lg border border-slate-700">
                 <Eye size={14} className="text-emerald-400" />
                 {isImpersonating ? (
                   <span className="text-emerald-400">PREVIEW: {currentRole}</span>
                 ) : (
                   <span className="text-blue-400">SUPERADMIN (REAL)</span>
                 )}
               </div>
             </div>

             <div className="space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SWITCH ROLE:</p>
               <div className="grid grid-cols-2 gap-2">
                 {roles.map(role => (
                   <button
                     key={role}
                     onClick={() => store.impersonate(role)}
                     className={`text-[9px] font-bold p-2 rounded-lg border transition uppercase ${
                       currentRole === role && isImpersonating
                         ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                         : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                     }`}
                   >
                     {role}
                   </button>
                 ))}
               </div>
             </div>

             {isImpersonating && (
               <button 
                 onClick={() => store.stopImpersonation()}
                 className="w-full py-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
               >
                 <X size={14} /> STOP PREVIEW
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
