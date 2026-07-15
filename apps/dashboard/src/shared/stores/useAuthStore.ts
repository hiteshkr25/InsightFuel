import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: { id: string; email: string; role: string } | null;
  activeOrgId: string;
  activeProjectId: string;
  orgs: { id: string; name: string }[];
  projects: { id: string; name: string; orgId: string }[];
  
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  switchProject: (projectId: string) => void;
  createProject: (name: string, id: string) => void;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const safeStorage = {
  getItem: (key: string) => isBrowser ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => { if (isBrowser) localStorage.setItem(key, value); },
  removeItem: (key: string) => { if (isBrowser) localStorage.removeItem(key); }
};

const DEFAULT_ORGS = [
  { id: 'org_123', name: 'Acme Analytics Org' },
  { id: 'org_456', name: 'Beta Dev Enterprise' }
];

const DEFAULT_PROJECTS = [
  { id: 'proj_123', name: 'Universal App Production', orgId: 'org_123' },
  { id: 'proj_456', name: 'Staging Test Portal', orgId: 'org_456' }
];

export const useAuthStore = create<AuthState>((set, get) => ({
  token: safeStorage.getItem('token'),
  isAuthenticated: !!safeStorage.getItem('token'),
  user: safeStorage.getItem('user') ? JSON.parse(safeStorage.getItem('user')!) : null,
  activeOrgId: safeStorage.getItem('activeOrgId') || 'org_123',
  activeProjectId: safeStorage.getItem('activeProjectId') || 'proj_123',
  orgs: DEFAULT_ORGS,
  projects: DEFAULT_PROJECTS,

  login: async (email, _password) => {
    try {
      const mockUser = { id: 'user_123', email, role: 'owner' };
      
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        org_id: 'org_123',
        sub: 'user_123',
        exp: Math.floor(Date.now() / 1000) + 3600
      }));
      const mockJwt = `${header}.${payload}.signature`;

      safeStorage.setItem('token', mockJwt);
      safeStorage.setItem('user', JSON.stringify(mockUser));
      safeStorage.setItem('activeOrgId', 'org_123');
      safeStorage.setItem('activeProjectId', 'proj_123');

      set({
        token: mockJwt,
        isAuthenticated: true,
        user: mockUser,
        activeOrgId: 'org_123',
        activeProjectId: 'proj_123'
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('user');
    set({ token: null, isAuthenticated: false, user: null });
  },

  switchOrganization: (orgId) => {
    const firstProj = get().projects.find(p => p.orgId === orgId);
    const projId = firstProj ? firstProj.id : '';
    
    safeStorage.setItem('activeOrgId', orgId);
    if (projId) {
      safeStorage.setItem('activeProjectId', projId);
    }
    
    set({ activeOrgId: orgId, activeProjectId: projId });
  },

  switchProject: (projectId) => {
    safeStorage.setItem('activeProjectId', projectId);
    set({ activeProjectId: projectId });
  },

  createProject: (name, id) => {
    const activeOrg = get().activeOrgId;
    const newProj = { id, name, orgId: activeOrg };
    const updated = [...get().projects, newProj];
    set({ projects: updated, activeProjectId: id });
    safeStorage.setItem('activeProjectId', id);
  }
}));
