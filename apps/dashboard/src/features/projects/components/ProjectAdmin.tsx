import React, { useState } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { ShieldCheck, Copy, Check, Terminal, ExternalLink, Code } from 'lucide-react';

export default function ProjectAdmin() {
  const { activeProjectId, createProject } = useAuthStore();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjId, setNewProjId] = useState('');
  const [keyCreated, setKeyCreated] = useState('if_pk_live_f8a3d902a7b3c104e5d6');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(keyCreated);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName && newProjId) {
      createProject(newProjName, newProjId);
      setNewProjName('');
      setNewProjId('');
      setKeyCreated(`if_pk_live_${Math.random().toString(16).slice(2, 22)}`);
    }
  };

  const sdkScript = `import { InsightFuelSDK } from '@insightfuel/sdk-browser';

const tracker = new InsightFuelSDK({
  apiKey: "${keyCreated}",
  projectId: "${activeProjectId}",
  endpoint: "http://localhost:3000/api/v1/events"
});

tracker.init();
tracker.track('page_view', { path: window.location.pathname });`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Administration</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage API keys, register new analytics project spaces, and inspect SDK installation guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-500 mr-2" />
              API Credentials Management
            </h2>
            <p className="text-slate-500 text-xs mt-1">Authenticate telemetry event streams from client browsers.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Write Key</span>
              <p className="font-mono text-xs text-slate-700 font-semibold mt-1">{keyCreated}</p>
            </div>
            <button 
              onClick={handleCopyKey}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 transition-colors shadow-sm"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-4">Create New Project Space</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateProject}>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold uppercase">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Marketing Site Tracker"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="mt-1 block w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-semibold uppercase">Project ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="proj_marketing_y26"
                  value={newProjId}
                  onChange={e => setNewProjId(e.target.value)}
                  className="mt-1 block w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center">
              <Terminal className="h-4.5 w-4.5 text-slate-500 mr-2" />
              SDK Installation Manual
            </h2>
            <p className="text-slate-500 text-xs mt-1">Integrate our browser tracker package into your code in minutes.</p>
          </div>
          <div className="my-4 flex-1 flex flex-col justify-center border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Package install command</span>
            <div className="p-3 bg-slate-900 rounded font-mono text-[10px] text-slate-300 flex items-center justify-between">
              <span>npm install @insightfuel/sdk-browser</span>
              <button 
                onClick={() => handleCopyScript('npm install @insightfuel/sdk-browser')}
                className="text-slate-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <a 
            href="#" 
            className="flex items-center justify-center space-x-1.5 py-2 border border-slate-200 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <span>Read full developer docs</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <div className="flex items-center space-x-2">
            <Code className="h-4.5 w-4.5 text-blue-400" />
            <span>Initialization Script Setup</span>
          </div>
          <button 
            onClick={() => handleCopyScript(sdkScript)}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
          >
            {copiedScript ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
        <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg leading-relaxed">
          {sdkScript}
        </pre>
      </div>
    </div>
  );
}
