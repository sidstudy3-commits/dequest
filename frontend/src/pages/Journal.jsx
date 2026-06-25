import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Calendar } from 'lucide-react';

const Journal = ({ onAchievementUnlock }) => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formError, setFormError] = useState('');

  const loadJournals = async () => {
    try {
      const data = await fetchAPI('/journals');
      setJournals(data);
    } catch (err) {
      console.error('Error loading journals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournals();
  }, []);

  const openAddModal = () => {
    setEditingJournal(null);
    setFormTitle('');
    setFormContent('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (journal) => {
    setEditingJournal(journal);
    setFormTitle(journal.title);
    setFormContent(journal.content);
    setFormDate(new Date(journal.date).toISOString().split('T')[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      setFormError('Title and Content are required');
      return;
    }

    try {
      const payload = {
        title: formTitle,
        content: formContent,
        date: formDate
      };

      if (editingJournal) {
        const updated = await fetchAPI(`/journals/${editingJournal.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setJournals(prev => prev.map(j => j.id === editingJournal.id ? updated : j));
      } else {
        const response = await fetchAPI('/journals', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setJournals(prev => [response.journal, ...prev]);

        if (response.newAchievements && response.newAchievements.length > 0) {
          response.newAchievements.forEach(ach => onAchievementUnlock(ach));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await fetchAPI(`/journals/${id}`, { method: 'DELETE' });
      setJournals(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      alert('Failed to delete journal entry: ' + err.message);
    }
  };

  const filteredJournals = journals.filter(journal => {
    const term = searchQuery.toLowerCase();
    return journal.title.toLowerCase().includes(term) || 
           journal.content.toLowerCase().includes(term);
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Journal</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Keep a daily record of your learning notes, challenges, and code updates.</p>
        </div>
        <button onClick={openAddModal} className="glass-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries by title or content keywords..."
          className="w-full glass-input pl-11"
        />
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 text-neonPurple/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Entries Found</h3>
          <p className="text-sm">Write down your first developer diary log to start documenting your progress.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJournals.map((journal) => (
            <div key={journal.id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 relative group overflow-hidden">
              <div className="flex-grow space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neonPurple" />
                    <span>{formatDate(journal.date)}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{journal.title}</h3>
                <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{journal.content}</p>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex md:flex-col gap-2 justify-end self-end md:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(journal)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-glassBg/80 text-slate-400 dark:text-gray-400 hover:text-slate-800 hover:dark:text-white rounded-lg transition-all"
                  title="Edit Entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(journal.id)}
                  className="p-2 hover:bg-red-500/10 text-slate-400 dark:text-gray-400 hover:text-red-500 rounded-lg transition-all"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl glass-panel p-6 border-slate-200/80 dark:border-glassBorder/40 bg-white dark:bg-darkBg/95 relative animate-float">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingJournal ? 'Edit Journal Entry' : 'Create New Journal Entry'}
            </h3>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Entry Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Worked on JWT Authentication, Debugged Database Connection"
                    className="glass-input text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Log Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="glass-input text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Write Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Document what you learned, issues you solved, and tasks you completed..."
                  rows="8"
                  className="glass-input text-sm resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-button-secondary py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button py-2.5 text-sm">
                  {editingJournal ? 'Save Log' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
