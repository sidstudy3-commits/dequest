import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  BookMarked, 
  CheckSquare, 
  FolderGit, 
  Award, 
  Settings, 
  LogOut, 
  Flame 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Learning Tracker', path: '/learning', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Journal', path: '/journal', icon: BookMarked },
    { name: 'Goals', path: '/goals', icon: CheckSquare },
    { name: 'Resource Vault', path: '/vault', icon: FolderGit },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel h-[calc(100vh-2rem)] sticky top-4 left-4 p-6 flex flex-col justify-between z-10">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-neonPurple to-neonIndigo p-2.5 rounded-xl shadow-neon">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-neonPurple dark:from-white dark:via-gray-200 bg-clip-text text-transparent">
              DevQuest
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-neonPurple/80 dark:text-neonPurple/95 font-semibold">
              AI Learning Hub
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-sm
                ${isActive 
                  ? 'bg-neonPurple/10 dark:bg-neonPurple/20 text-neonPurple dark:text-white border-l-4 border-neonPurple font-medium shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 hover:dark:text-white hover:bg-slate-100 dark:hover:bg-glassBg/40'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-all group-hover:scale-110 ${isActive ? 'text-neonPurple' : 'text-slate-400 dark:text-gray-400 group-hover:text-neonPurple'}`} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Info & Logout */}
      <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-glassBorder/60 pt-4">
        {user && (
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col overflow-hidden max-w-[120px]">
              <span className="text-sm font-semibold truncate text-slate-800 dark:text-gray-100">{user.username}</span>
              <span className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 px-2 py-1 rounded-lg text-xs font-bold shadow-sm select-none">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{user.streak}🔥</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-gray-400 hover:text-red-600 hover:dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
