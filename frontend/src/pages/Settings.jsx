import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Download, 
  Upload, 
  User, 
  Sun,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const { user, updateUserSettings, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [darkMode, setDarkMode] = useState(user?.darkMode !== false);
  const [loading, setLoading] = useState(false);
  
  // Status feedback states
  const [profileMessage, setProfileMessage] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [clearMessage, setClearMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setLoading(true);
    try {
      await updateUserSettings({ username });
      setProfileMessage('Username updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    
    // Toggle class on document
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      await updateUserSettings({ darkMode: nextMode });
    } catch (err) {
      console.error('Failed to sync theme to server:', err);
    }
  };

  const handleExportData = async () => {
    try {
      setImportStatus('Fetching backup datasets...');
      const [topics, projects, journals, goals, resources] = await Promise.all([
        fetchAPI('/topics'),
        fetchAPI('/projects'),
        fetchAPI('/journals'),
        fetchAPI('/goals'),
        fetchAPI('/resources')
      ]);

      const backup = {
        topics,
        projects,
        journals,
        goals,
        resources,
        exportMeta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          user: user?.username
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `devquest_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setImportStatus('Backup downloaded successfully!');
      setTimeout(() => setImportStatus(''), 4000);
    } catch (err) {
      setImportStatus('Export failed: ' + err.message);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportStatus('Parsing backup file...');
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        if (!backup.topics || !backup.projects || !backup.journals || !backup.goals || !backup.resources) {
          throw new Error('Invalid file format. Ensure it is a valid DevQuest backup.');
        }

        setImportStatus('Uploading records to server...');

        const restoreTopics = backup.topics.map(t => 
          fetchAPI('/topics', { method: 'POST', body: JSON.stringify({ ...t, progress: parseInt(t.progress) }) })
        );
        const restoreProjects = backup.projects.map(p => 
          fetchAPI('/projects', { method: 'POST', body: JSON.stringify(p) })
        );
        const restoreJournals = backup.journals.map(j => 
          fetchAPI('/journals', { method: 'POST', body: JSON.stringify(j) })
        );
        const restoreGoals = backup.goals.map(g => 
          fetchAPI('/goals', { method: 'POST', body: JSON.stringify(g) })
        );
        const restoreResources = backup.resources.map(r => 
          fetchAPI('/resources', { method: 'POST', body: JSON.stringify(r) })
        );

        await Promise.all([
          ...restoreTopics,
          ...restoreProjects,
          ...restoreJournals,
          ...restoreGoals,
          ...restoreResources
        ]);

        setImportStatus('Backup imported fully! Reloading application workspace...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setImportStatus('Import error: ' + err.message);
      }
    };

    reader.readAsText(file);
  };

  const handleClearData = async () => {
    const confirmPhrase = "reset my workspace";
    const answer = prompt(`Warning! This deletes all topics, projects, logs, checklists, resources, and resets your streak to 1.\nType "${confirmPhrase}" to confirm:`);
    
    if (answer !== confirmPhrase) {
      alert("Clear operation cancelled.");
      return;
    }

    setClearMessage('Clearing user database records...');
    try {
      const response = await fetchAPI('/auth/clear', { method: 'POST' });
      setUser(response.user);
      setClearMessage('Account database reset successful!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setClearMessage('Clear failed: ' + err.message);
    }
  };

  return (
    <div className="flex-1 space-y-8 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Settings
          <SettingsIcon className="w-6 h-6 text-neonPurple" />
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Configure profile metrics, toggles, backups, and reset workspaces.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-neonPurple" />
          Developer Profile
        </h3>
        
        {profileMessage && (
          <div className="bg-neonPurple/10 border border-neonPurple/20 text-neonPurple p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neonPurple" />
            <span>{profileMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col gap-1.5 max-w-sm">
            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input text-sm"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="glass-button py-2 text-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Preferences / Toggles */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          App Preferences
        </h3>
        <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-glassBorder/40">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">Dark Mode</span>
            <span className="text-xs text-slate-500 dark:text-gray-400">Toggle dark-themed neon backgrounds</span>
          </div>
          <button
            onClick={toggleTheme}
            type="button"
            className={`${
              darkMode ? 'bg-neonPurple shadow-neon' : 'bg-slate-200 dark:bg-glassBg'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none border border-slate-300 dark:border-glassBorder/40`}
          >
            <span
              className={`${
                darkMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-slate-400 dark:bg-gray-300'
              } inline-block h-4 w-4 transform rounded-full transition-all duration-300`}
            />
          </button>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-neonIndigo" />
          Database Backup & Sync
        </h3>
        
        {importStatus && (
          <div className="bg-neonIndigo/10 border border-neonIndigo/20 text-neonIndigo p-3 rounded-xl text-xs font-semibold mb-4">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <div className="bg-white/80 dark:bg-glassBg/40 border border-slate-200/60 dark:border-glassBorder/40 p-4 rounded-xl flex flex-col justify-between h-36">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Export Dataset</h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mt-1">Download backup JSON containing all current learning topics, project builds, and logs.</p>
            </div>
            <button
              onClick={handleExportData}
              className="glass-button-secondary py-2 text-xs flex items-center justify-center gap-2 w-full mt-3"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="bg-white/80 dark:bg-glassBg/40 border border-slate-200/60 dark:border-glassBorder/40 p-4 rounded-xl flex flex-col justify-between h-36">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Import Dataset</h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mt-1">Upload a previously exported backup file to restore your tracks. Warning: this adds records to your database.</p>
            </div>
            <label className="glass-button-secondary py-2 text-xs flex items-center justify-center gap-2 w-full mt-3 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 border-red-500/20 bg-red-500/5">
        <h3 className="text-base font-bold text-red-500 dark:text-red-400 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Danger Zone
        </h3>

        {clearMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-xs font-semibold mb-4">
            {clearMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">Reset Developer Workspace</span>
            <span className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Deletes all records (topics, projects, journal entries, goals, resources) and resets learning streak.</span>
          </div>
          <button
            onClick={handleClearData}
            className="bg-red-500 hover:bg-red-500/90 text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-98"
          >
            <Trash2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
