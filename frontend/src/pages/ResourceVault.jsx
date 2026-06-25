import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Plus, Trash2, X, AlertCircle, BookOpen, Link2, Search, ExternalLink, Video } from 'lucide-react';

const ResourceVault = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formType, setFormType] = useState('DOCS');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const loadResources = async () => {
    try {
      const data = await fetchAPI('/resources');
      setResources(data);
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const openAddModal = () => {
    setFormTitle('');
    setFormUrl('');
    setFormType('DOCS');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formUrl) {
      setFormError('Title and URL are required');
      return;
    }

    if (!formUrl.startsWith('http://') && !formUrl.startsWith('https://')) {
      setFormError('URL must start with http:// or https://');
      return;
    }

    try {
      const payload = {
        title: formTitle,
        url: formUrl,
        type: formType,
        notes: formNotes
      };

      const response = await fetchAPI('/resources', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setResources(prev => [response, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create resource');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource from your vault?')) return;
    try {
      await fetchAPI(`/resources/${id}`, { method: 'DELETE' });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete resource: ' + err.message);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeFilter === 'ALL' || res.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const getResourceIconAndColor = (type) => {
    const config = {
      YOUTUBE: { icon: Video, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
      DOCS: { icon: BookOpen, color: 'text-neonPurple bg-neonPurple/10 border-neonPurple/20' },
      ARTICLE: { icon: Link2, color: 'text-neonIndigo bg-neonIndigo/10 border-neonIndigo/20' }
    };
    const details = config[type] || config.DOCS;
    return details;
  };

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resource Vault</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Bookmark documentation, video guides, and articles for quick access during builds.</p>
        </div>
        <button onClick={openAddModal} className="glass-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vault resources..."
            className="w-full glass-input pl-11"
          />
        </div>

        {/* Filter categories */}
        <div className="md:col-span-2 flex gap-2">
          {['ALL', 'DOCS', 'YOUTUBE', 'ARTICLE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                activeFilter === filter
                  ? 'bg-neonPurple/20 text-white border-neonPurple shadow-sm'
                  : 'bg-glassBg/40 text-slate-500 dark:text-gray-400 border-slate-200/60 dark:border-glassBorder/60 hover:text-slate-800 hover:dark:text-white'
              }`}
            >
              {filter === 'ALL' ? 'All' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 text-neonPurple/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Resources Found</h3>
          <p className="text-sm">Vault empty. Save important web pages or tutorials using "Add Resource".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const config = getResourceIconAndColor(res.type);
            const Icon = config.icon;
            return (
              <div key={res.id} className="glass-panel p-5 flex flex-col justify-between h-48 group relative overflow-hidden">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className={`${config.color} p-2 border rounded-xl flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1 text-slate-400 dark:text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{res.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 h-8 leading-relaxed">
                      {res.notes || 'No description added.'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-glassBorder/40 pt-3 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase tracking-wider font-bold">
                    {res.type}
                  </span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-neonPurple hover:text-neonPurple/85 font-bold transition-all"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 border-slate-200/80 dark:border-glassBorder/40 bg-white dark:bg-darkBg/95 relative animate-float">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Add New Resource</h3>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Resource Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. React Docs, Postgres Cheat Sheet"
                  className="glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Resource URL</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="glass-input text-xs cursor-pointer"
                  >
                    <option value="DOCS">Docs</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="ARTICLE">Article</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Notes / Summary (optional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Brief description or quick summary..."
                  rows="3"
                  className="glass-input text-xs resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-button-secondary py-2.5 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="glass-button py-2.5 text-xs">
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceVault;
