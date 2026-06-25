import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const LearningTracker = ({ onAchievementUnlock }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  
  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('BEGINNER');
  const [formStatus, setFormStatus] = useState('NOT_STARTED');
  const [formProgress, setFormProgress] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const loadTopics = async () => {
    try {
      const data = await fetchAPI('/topics');
      setTopics(data);
    } catch (err) {
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const openAddModal = () => {
    setEditingTopic(null);
    setFormTitle('');
    setFormCategory('');
    setFormDifficulty('BEGINNER');
    setFormStatus('NOT_STARTED');
    setFormProgress(0);
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormTitle(topic.title);
    setFormCategory(topic.category);
    setFormDifficulty(topic.difficulty);
    setFormStatus(topic.status);
    setFormProgress(topic.progress);
    setFormNotes(topic.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formCategory) {
      setFormError('Title and Category are required');
      return;
    }

    try {
      const payload = {
        title: formTitle,
        category: formCategory,
        difficulty: formDifficulty,
        status: formStatus,
        progress: parseInt(formProgress),
        notes: formNotes
      };

      if (editingTopic) {
        const updated = await fetchAPI(`/topics/${editingTopic.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setTopics(prev => prev.map(t => t.id === editingTopic.id ? updated : t));
      } else {
        const response = await fetchAPI('/topics', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setTopics(prev => [response.topic, ...prev]);
        
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
    if (!window.confirm('Are you sure you want to delete this learning topic?')) return;
    try {
      await fetchAPI(`/topics/${id}`, { method: 'DELETE' });
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete topic: ' + err.message);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || topic.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'ALL' || topic.difficulty === difficultyFilter;
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      BEGINNER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      INTERMEDIATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      ADVANCED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    };
    return (
      <span className={`border px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${styles[difficulty] || ''}`}>
        {difficulty}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      NOT_STARTED: 'bg-gray-500/10 text-slate-600 dark:text-gray-400 border-gray-500/20',
      IN_PROGRESS: 'bg-neonPurple/10 text-neonPurple border-neonPurple/20',
      COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
    };
    const labels = {
      NOT_STARTED: 'Not Started',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed'
    };
    return (
      <span className={`border px-2.5 py-0.5 rounded-lg text-xs font-semibold ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Learning Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Manage, categorize, and track progress on all your coding topics.</p>
        </div>
        <button onClick={openAddModal} className="glass-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic title or category..."
            className="w-full glass-input pl-11"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="glass-input cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="glass-input cursor-pointer"
        >
          <option value="ALL">All Difficulties</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 text-neonPurple/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Topics Found</h3>
          <p className="text-sm">Try tweaking your filters or create a new topic to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="glass-panel p-6 flex flex-col justify-between h-72 group relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-neonPurple uppercase tracking-wider bg-neonPurple/10 px-2.5 py-1 rounded-lg">
                    {topic.category}
                  </span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(topic)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-glassBg/80 text-slate-400 dark:text-gray-400 hover:text-slate-800 hover:dark:text-white rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(topic.id)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-400 dark:text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{topic.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-3 h-12 leading-relaxed">
                    {topic.notes || 'No description or notes provided.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-glassBorder/40">
                <div className="flex justify-between items-center text-xs">
                  {getDifficultyBadge(topic.difficulty)}
                  {getStatusBadge(topic.status)}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-gray-400">
                    <span>PROGRESS</span>
                    <span>{topic.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-darkBg/60 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-neonPurple to-neonIndigo h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 border-slate-200/80 dark:border-glassBorder/40 bg-white dark:bg-darkBg/95 relative animate-float">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingTopic ? 'Edit Learning Topic' : 'Add New Topic'}
            </h3>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Topic Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Redux Toolkit, PostgreSQL Joins"
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Frontend, DB"
                    className="glass-input text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="glass-input text-sm cursor-pointer"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormStatus(newStatus);
                      if (newStatus === 'COMPLETED') setFormProgress(100);
                      if (newStatus === 'NOT_STARTED') setFormProgress(0);
                    }}
                    className="glass-input text-sm cursor-pointer"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Progress ({formProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formProgress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormProgress(val);
                      if (val === 100) setFormStatus('COMPLETED');
                      else if (val > 0) setFormStatus('IN_PROGRESS');
                      else setFormStatus('NOT_STARTED');
                    }}
                    className="h-2 bg-slate-200 dark:bg-darkBg/60 rounded-full appearance-none cursor-pointer mt-3 accent-neonPurple"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Notes & Descriptions</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes, roadmaps, topics to cover..."
                  rows="3"
                  className="glass-input text-sm resize-none"
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
                  {editingTopic ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTracker;
