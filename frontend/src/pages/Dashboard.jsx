import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../utils/api';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  BookOpen, 
  Briefcase, 
  CheckSquare, 
  Flame, 
  Clock, 
  Code,
  Award,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [projects, setProjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [topicsData, projectsData, goalsData] = await Promise.all([
          fetchAPI('/topics'),
          fetchAPI('/projects'),
          fetchAPI('/goals')
        ]);
        setTopics(topicsData);
        setProjects(projectsData);
        setGoals(goalsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    );
  }

  // Stats calculations
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'COMPLETED').length;
  const activeTopics = topics.filter(t => t.status === 'IN_PROGRESS').length;
  const totalProjects = projects.length;
  const goalsCompleted = goals.filter(g => g.completed).length;

  const cards = [
    { name: 'Total Topics', value: totalTopics, icon: BookOpen, color: 'text-neonPurple', bg: 'bg-neonPurple/10' },
    { name: 'Active Topics', value: activeTopics, icon: Clock, color: 'text-neonIndigo', bg: 'bg-neonIndigo/10' },
    { name: 'Completed Topics', value: completedTopics, icon: CheckSquare, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-500/10' },
    { name: 'Total Projects', value: totalProjects, icon: Briefcase, color: 'text-neonPink', bg: 'bg-neonPink/10' },
    { name: 'Goals Completed', value: goalsCompleted, icon: Award, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Learning Streak', value: `${user?.streak || 0} Days`, icon: Flame, color: 'text-orange-500 animate-pulse', bg: 'bg-orange-500/10' },
  ];

  // Topic Status Chart Data
  const statusData = [
    { name: 'Not Started', value: topics.filter(t => t.status === 'NOT_STARTED').length },
    { name: 'In Progress', value: activeTopics },
    { name: 'Completed', value: completedTopics },
  ].filter(d => d.value > 0);

  const defaultStatusData = [
    { name: 'Not Started', value: 1 },
    { name: 'In Progress', value: 2 },
    { name: 'Completed', value: 1 },
  ];

  const STATUS_COLORS = ['#ec4899', '#8b5cf6', '#10b981'];

  // Project Progress Chart Data
  const projectChartData = projects.map(p => ({
    name: p.title.length > 12 ? `${p.title.slice(0, 10)}...` : p.title,
    progress: p.progress
  })).slice(0, 5);

  const defaultProjectData = [
    { name: 'Project Alpha', progress: 80 },
    { name: 'Project Beta', progress: 45 },
    { name: 'Project Gamma', progress: 20 },
  ];

  return (
    <div className="flex-1 space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Developer Workspace
            <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 fill-current animate-pulse" />
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Hello, {user?.username}. Here is your learning progress overview.</p>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-panel p-5 flex flex-col justify-between h-36 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{card.name}</span>
              <div className={`${card.bg} p-2 rounded-xl text-gray-100 ${card.color} transition-all duration-300 group-hover:scale-115`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Status Distribution */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-neonPurple" />
              Topic Status Distribution
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            {topics.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-gray-500">
                <span className="mb-2 italic">No topics loaded. Displaying sample metrics:</span>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={defaultStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        opacity={0.3}
                      >
                        {defaultStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg, #fff)', borderColor: 'rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--color-text, #0f172a)' }}
                  />
                  <Legend formatter={(value) => <span className="text-xs text-slate-600 dark:text-gray-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-neonIndigo" />
              Project Completion Progress (%)
            </h3>
          </div>
          <div className="h-64">
            {projects.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 dark:text-gray-500">
                <span className="mb-2 italic">No projects loaded. Displaying sample progress:</span>
                <div className="w-full h-48 opacity-30">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={defaultProjectData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                      <Bar dataKey="progress" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg, #fff)', borderColor: 'rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--color-text, #0f172a)' }}
                  />
                  <Bar dataKey="progress" fill="url(#colorProgress)" radius={[8, 8, 0, 0]}>
                    {projectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#6366f1'} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recents Table Layout */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-neonPink" />
          Active Study Topics
        </h3>
        {topics.filter(t => t.status === 'IN_PROGRESS').length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-gray-400 italic">No topics are currently marked in progress. Head over to the learning tracker to start a topic!</p>
        ) : (
          <div className="space-y-4">
            {topics.filter(t => t.status === 'IN_PROGRESS').slice(0, 3).map((topic) => (
              <div key={topic.id} className="bg-white/80 dark:bg-glassBg/40 border border-slate-200/60 dark:border-glassBorder/40 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-glassBg/60 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{topic.title}</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">{topic.category} • {topic.difficulty}</span>
                </div>
                <div className="flex items-center gap-4 w-1/3">
                  <div className="w-full bg-slate-200 dark:bg-darkBg/60 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-neonPurple to-neonIndigo h-2 rounded-full" 
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-neonPurple">{topic.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
