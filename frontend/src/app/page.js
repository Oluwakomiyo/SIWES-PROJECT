"use client";
import { useEffect, useState } from 'react';
import { Database, Image as ImageIcon, Folders, Star, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAdmin(!!token); // Set to true if token exists
  }, []);
  const [stats, setStats] = useState({
    projects: 0,
    assets: 0,
    featured: 0,
    storage: '0 MB',
    activity: []
  });
  const [loading, setLoading] = useState(true);

  // 👇 Helper goes here
  const activityLabel = {
    PROJECT_CREATE: "New Project",
    PROJECT_DELETE: "Project Deleted",
    IMAGE_ADD: "Images Uploaded",
    IMAGE_DELETE: "Image Deleted"
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Optional: If not logged in, you could redirect them to the gallery
    // if (!token) { router.push('/gallery'); return; }

    fetch('http://localhost:5000/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` } // Send token to backend
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Loading Dashboard...</div>;

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Enterprise Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here is an overview of your media repository.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Total Projects */}
        <Link href="/gallery" className="flex flex-col group h-full">
          <StatCard
            icon={<Folders className="text-blue-600" />}
            label="Total Projects"
            value={stats.projects}
            color="bg-blue-50"
          />
        </Link>

        {/* Card 2: Total Assets */}
        <Link href="/gallery" className="flex flex-col group h-full">
          <StatCard
            icon={<ImageIcon className="text-purple-600" />}
            label="Total Assets"
            value={stats.assets}
            color="bg-purple-50"
          />
        </Link>

        {/* Card 3: Featured Projects */}
        <Link href="/gallery?filter=featured" className="flex flex-col group h-full">
          <StatCard
            icon={<Star className="text-amber-600" />}
            label="Featured Projects"
            value={stats.featured || 0}
            color="bg-amber-50"
          />
        </Link>

        {/* Card 4: Storage Used */}
        {isAdmin && (
          <div className="flex flex-col h-full">
            <StatCard
              icon={<Database className="text-emerald-600" />}
              label="Storage Used"
              value={stats.storage}
              color="bg-emerald-50"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-slate-400" /> Recent Activity
          </h3>
          <Link href="/gallery" className="text-xs font-bold text-blue-600 hover:underline">View repository</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {stats?.activity?.length > 0 ? (
            stats.activity.map((item, index) => (
              <div
                key={index}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                    {item.action_type?.charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.project_name}
                    </p>

                    <p className="text-xs text-slate-400 uppercase tracking-widest">
                      {activityLabel[item.action_type] || item.action_type} • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {activityLabel[item.action_type] || item.action_type}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 text-sm italic">
              No recent activity found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px] transition-all group-hover:border-blue-300 group-hover:shadow-md">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}