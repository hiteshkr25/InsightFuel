import React, { useState } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';

export default function ProjectAdmin() {
  const { projects, createCustomerProject } = useAuthStore();
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !websiteUrl) return;

    createCustomerProject(name, websiteUrl, 'production', 'Created via Project Admin');
    setName('');
    setWebsiteUrl('');
  };

  return (
    <div className="space-y-6 font-sans text-neutral-100">
      <h1 className="text-xl font-semibold text-white">Internal Project Registry</h1>

      <form onSubmit={handleSubmit} className="bg-neutral-950 p-6 border border-neutral-800 rounded-xl space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Project Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-lg text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Website URL</label>
          <input
            type="url"
            required
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
            className="w-full px-3 py-2 bg-black border border-neutral-800 rounded-lg text-xs text-white"
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg">
          Add Project
        </button>
      </form>

      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3">Registered Projects ({projects.length})</h2>
        <ul className="divide-y divide-neutral-900 text-xs">
          {projects.map(p => (
            <li key={p.id} className="py-2.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-[10px] text-neutral-500 font-mono">{p.websiteUrl}</p>
              </div>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                {p.environment}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
