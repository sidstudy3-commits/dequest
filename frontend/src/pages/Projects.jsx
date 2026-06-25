import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Plus, Edit2, Trash2, X, AlertCircle, Calendar, Tag, ShieldCheck, Search } from 'lucide-react';

const Projects = ({ onAchievementUnlock }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTechStack, setFormTechStack] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [formStatus, setFormStatus] = useState('PLANNING');
  const [formError, setFormError] = useState('');

  const loadProjects = async () => {
    try {
      const data = await fetchAPI('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormDescription('');
    setFormTechStack('');
    setFormDeadline('');
    setFormProgress(0);
    setFormStatus('PLANNING');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormDescription(project.description || '');
    setFormTechStack(project.techStack);
    
    let formattedDate = '';
    if (project.deadline) {
      formattedDate = new Date(project.deadline).toISOString().split('T')[0];
    }
    setFormDeadline(formattedDate);
    setFormProgress(project.progress);
    setFormStatus(project.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formTechStack) {
      setFormError('Title and Tech Stack are required');
      return;
    }

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        techStack: formTechStack,
        deadline: formDeadline || null,
        progress: parseInt(formProgress),
        status: formStatus
      };

      if (editingProject) {
        const updated = await fetchAPI(`/projects/${editingProject.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updated : p));
      } else {
        const response = await fetchAPI('/projects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setProjects(prev => [response.project, ...prev]);

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
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetchAPI(`/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PLANNING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      IN_PROGRESS: 'bg-neonIndigo/10 text-neonIndigo border-neonIndigo/20',
      COMPLETED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
    };
    return (
      <span className={`border px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${styles[status] || ''}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', style: 'text-red-500 dark:text-red-400 font-bold' };
    if (diffDays === 0) return { label: 'Due Today', style: 'text-orange-600 dark:text-orange-400 font-bold' };
    return { label: `${diffDays} days left`, style: 'text-slate-500 dark:text-gray-400' };
  };

  const filteredProjects = projects.filter(project => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      project.title.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query)) ||
      project.techStack.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Project Tracker</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Plan and log tech stacks, progress, and milestones for your developer builds.</p>
        </div>
        <button onClick={openAddModal} className="glass-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by title, stack, or description..."
          className="w-full glass-input pl-11"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-500 dark:text-gray-400">
          <AlertCircle className="w-12 h-12 text-neonPurple/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Projects Found</h3>
          <p className="text-sm">
            {searchQuery 
              ? 'No projects match your search keywords.' 
              : 'Start tracking your developer builds by clicking "Add Project".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const daysLeft = getDaysRemaining(project.deadline);
            return (
              <div key={project.id} className="glass-panel p-6 flex flex-col justify-between h-[300px] group relative overflow-hidden">
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      {project.status === 'COMPLETED' ? (
                        <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="w-2.5 h-2.5 bg-neonPurple rounded-full animate-pulse"></div>
                      )}
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate max-w-[200px]">{project.title}</h3>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-glassBg/80 text-slate-400 dark:text-gray-400 hover:text-slate-800 hover:dark:text-white rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 hover:bg-red-500/10 text-slate-400 dark:text-gray-400 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-3 leading-relaxed min-h-[48px]">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.split(',').map((tech, tIdx) => (
                      <span key={tIdx} className="flex items-center gap-1 bg-slate-100 dark:bg-darkBg/60 text-slate-700 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-glassBorder/60">
                        <Tag className="w-2.5 h-2.5 text-neonPurple" />
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-glassBorder/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-neonPurple" />
                      <span>{formatDate(project.deadline)}</span>
                      {daysLeft && (
                        <span className={`ml-1 font-semibold ${daysLeft.style}`}>
                          ({daysLeft.label})
                        </span>
                      )}
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-gray-400">
                      <span>COMPLETION PROGRESS</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-darkBg/60 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-neonPurple to-neonIndigo h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              {editingProject ? 'Edit Project Details' : 'Add New Project'}
            </h3>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Portfolio Builder, Chat App"
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summary of the build, key objectives..."
                  rows="3"
                  className="glass-input text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={formTechStack}
                  onChange={(e) => setFormTechStack(e.target.value)}
                  placeholder="e.g. React, Node, Tailwind, PostgreSQL"
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="glass-input text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setFormStatus(newStatus);
                      if (newStatus === 'COMPLETED') setFormProgress(100);
                      if (newStatus === 'PLANNING') setFormProgress(0);
                    }}
                    className="glass-input text-sm cursor-pointer"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
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
                    else setFormStatus('PLANNING');
                  }}
                  className="h-2 bg-slate-200 dark:bg-darkBg/60 rounded-full appearance-none cursor-pointer mt-3 accent-neonPurple"
                />
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
