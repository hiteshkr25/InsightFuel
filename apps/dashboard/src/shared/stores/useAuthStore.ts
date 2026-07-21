import { create } from 'zustand';

export interface ApiKey {
  id: string;
  projectId: string;
  key: string;
  displayName: string;
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'deactivated' | 'rotated' | 'flagged';
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
}

export interface Project {
  id: string;
  name: string;
  orgId: string;
  websiteUrl: string;
  environment: 'production' | 'staging' | 'development';
  description: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  eventCount: number;
  sdkConnected: boolean;
}

export interface Organization {
  id: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: 'superadmin' | 'owner' | 'admin' | 'developer' | 'viewer';
  isSuperAdmin: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
}

export interface WorkspaceInvitation {
  id: string;
  orgId: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  invitedByEmail: string;
  createdAt: string;
}

export interface CustomerTenant {
  id: string;
  name: string;
  email: string;
  companyName: string;
  orgId: string;
  status: 'active' | 'suspended';
  registeredAt: string;
  projectsCount: number;
  eventVolume: number;
  activeKeysCount: number;
}

export interface GlobalProject extends Project {
  ownerEmail: string;
  orgName: string;
  lastActive: string;
}

export interface GlobalApiKey extends ApiKey {
  ownerEmail: string;
  projectName: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  directory: string;
  status: 'healthy' | 'warning' | 'offline';
  latencyMs: number;
  uptime: string;
  lastHeartbeat: string;
}

export interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
  portalMode: 'customer' | 'admin' | 'superadmin';
  activeOrgId: string;
  activeProjectId: string;
  orgs: Organization[];
  projects: Project[];
  apiKeys: Record<string, ApiKey[]>;
  invitations: WorkspaceInvitation[];
  verificationSent: boolean;

  // Onboarding Wizard State
  onboardingStep: number;
  onboardingCompleted: boolean;

  // Global Collections
  allCustomers: CustomerTenant[];
  allProjectsList: GlobalProject[];
  allApiKeysList: GlobalApiKey[];
  servicesHealth: ServiceHealth[];
  auditLogs: AuditLogEntry[];

  // RBAC Helpers
  canManageBilling: () => boolean;
  canDeleteProject: () => boolean;
  canManageKeys: () => boolean;
  canInviteMembers: () => boolean;

  // Authentication Actions
  register: (name: string, email: string, password: string, companyName: string) => Promise<boolean>;
  login: (email: string, _password?: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: () => void;
  logout: () => void;

  // Onboarding Actions
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Workspace & Navigation Actions
  switchOrganization: (orgId: string) => void;
  switchProject: (projectId: string) => void;
  switchPortalMode: (mode: 'customer' | 'admin' | 'superadmin') => void;

  // SaaS Project & Key Lifecycle Actions
  createProject: (name: string, id: string) => void;
  createCustomerProject: (name: string, websiteUrl: string, environment: 'production' | 'staging' | 'development', description: string) => Project;
  updateProjectStatus: (projectId: string, status: 'active' | 'paused' | 'archived') => void;
  deleteCustomerProject: (projectId: string) => void;
  createCustomerOrganization: (orgName: string) => Organization;
  generateApiKey: (projectId: string, displayName: string, environment: 'production' | 'staging' | 'development') => ApiKey;
  rotateApiKey: (keyId: string) => ApiKey | null;
  toggleKeyStatus: (keyId: string) => void;
  deleteApiKey: (keyId: string) => void;
  updateProfile: (name: string, companyName: string) => void;

  // Team & Invitation Actions
  inviteTeamMember: (email: string, role: 'admin' | 'developer' | 'viewer') => WorkspaceInvitation;
  revokeInvitation: (invitationId: string) => void;
  acceptInvitation: (token: string) => boolean;
  transferOwnership: (newOwnerEmail: string) => void;

  // Superadmin Actions
  suspendCustomer: (userId: string) => void;
  reactivateCustomer: (userId: string) => void;
  deleteCustomer: (userId: string) => void;
  triggerPasswordReset: (userId: string) => string;
  revokeApiKey: (keyId: string) => void;
  flagApiKeyAbuse: (keyId: string) => void;
  recordAuditLog: (action: string, targetType: string, targetId: string, details: string) => void;
}

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const safeStorage = {
  getItem: (key: string) => isBrowser ? localStorage.getItem(key) : null,
  setItem: (key: string, value: string) => { if (isBrowser) localStorage.setItem(key, value); },
  removeItem: (key: string) => { if (isBrowser) localStorage.removeItem(key); }
};

const DEFAULT_ORGS: Organization[] = [
  { id: 'org_acme', name: 'Acme E-Commerce Inc', ownerEmail: 'hitesh@acme.com', createdAt: '2026-01-15' },
  { id: 'org_beta', name: 'Beta Dev Innovations', ownerEmail: 'demo@beta.io', createdAt: '2026-03-10' }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_ecommerce_prod',
    name: 'Shopify Storefront Production',
    orgId: 'org_acme',
    websiteUrl: 'https://shop.acme.com',
    environment: 'production',
    description: 'Primary customer-facing web application and checkout funnel.',
    status: 'active',
    createdAt: '2026-02-01',
    eventCount: 1245800,
    sdkConnected: true
  },
  {
    id: 'proj_ecommerce_dev',
    name: 'Mobile App Staging',
    orgId: 'org_acme',
    websiteUrl: 'https://staging.acme.com',
    environment: 'staging',
    description: 'Internal testing environment for upcoming checkout features.',
    status: 'active',
    createdAt: '2026-03-05',
    eventCount: 42100,
    sdkConnected: true
  },
  {
    id: 'proj_beta_portal',
    name: 'Beta Cloud SaaS',
    orgId: 'org_beta',
    websiteUrl: 'https://app.beta.io',
    environment: 'production',
    description: 'SaaS user analytics & product engagement portal.',
    status: 'active',
    createdAt: '2026-03-12',
    eventCount: 893000,
    sdkConnected: false
  }
];

const DEFAULT_API_KEYS: Record<string, ApiKey[]> = {
  proj_ecommerce_prod: [
    {
      id: 'key_101',
      projectId: 'proj_ecommerce_prod',
      key: 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e',
      displayName: 'Production Public Key',
      environment: 'production',
      status: 'active',
      createdAt: '2026-02-01',
      lastUsedAt: '2 mins ago',
      requestCount: 842100
    },
    {
      id: 'key_102',
      projectId: 'proj_ecommerce_prod',
      key: 'if_test_1a2b3c4d5e6f7a8b9c0d1e2f',
      displayName: 'Development Key',
      environment: 'development',
      status: 'active',
      createdAt: '2026-02-15',
      lastUsedAt: '15 mins ago',
      requestCount: 403700
    }
  ]
};

const DEFAULT_USER: UserProfile = {
  id: 'user_cust_101',
  name: 'Hitesh Kumar',
  email: 'hitesh@acme.com',
  companyName: 'Acme E-Commerce Inc',
  role: 'owner',
  isSuperAdmin: false,
  emailVerified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
};

const INITIAL_INVITATIONS: WorkspaceInvitation[] = [
  {
    id: 'inv_101',
    orgId: 'org_acme',
    email: 'elena@techcorp.de',
    role: 'viewer',
    token: 'inv_tok_991827364',
    status: 'pending',
    invitedByEmail: 'hitesh@acme.com',
    createdAt: '2026-03-18'
  }
];

const INITIAL_CUSTOMERS: CustomerTenant[] = [
  {
    id: 'user_cust_101',
    name: 'Hitesh Kumar',
    email: 'hitesh@acme.com',
    companyName: 'Acme E-Commerce Inc',
    orgId: 'org_acme',
    status: 'active',
    registeredAt: '2026-01-15',
    projectsCount: 2,
    eventVolume: 1287900,
    activeKeysCount: 3
  }
];

const INITIAL_GLOBAL_PROJECTS: GlobalProject[] = [
  {
    id: 'proj_ecommerce_prod',
    name: 'Shopify Storefront Production',
    orgId: 'org_acme',
    orgName: 'Acme E-Commerce Inc',
    ownerEmail: 'hitesh@acme.com',
    websiteUrl: 'https://shop.acme.com',
    environment: 'production',
    description: 'Primary customer-facing web application.',
    status: 'active',
    createdAt: '2026-02-01',
    eventCount: 1245800,
    sdkConnected: true,
    lastActive: '2 mins ago'
  }
];

const INITIAL_GLOBAL_KEYS: GlobalApiKey[] = [
  {
    id: 'key_101',
    projectId: 'proj_ecommerce_prod',
    projectName: 'Shopify Storefront Production',
    ownerEmail: 'hitesh@acme.com',
    key: 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e',
    displayName: 'Production Public Key',
    environment: 'production',
    status: 'active',
    createdAt: '2026-02-01',
    lastUsedAt: '2 mins ago',
    requestCount: 842100
  }
];

const INITIAL_SERVICES_HEALTH: ServiceHealth[] = [
  { id: 'svc_gateway', name: 'API Gateway', directory: 'apps/api-gateway', status: 'healthy', latencyMs: 14, uptime: '99.99%', lastHeartbeat: '10s ago' },
  { id: 'svc_query', name: 'Query API', directory: 'services/query-api', status: 'healthy', latencyMs: 18, uptime: '99.95%', lastHeartbeat: '8s ago' },
  { id: 'svc_analytics', name: 'Analytics Service', directory: 'services/analytics', status: 'healthy', latencyMs: 22, uptime: '99.98%', lastHeartbeat: '12s ago' },
  { id: 'svc_feature', name: 'Feature Intelligence', directory: 'services/feature-intelligence', status: 'healthy', latencyMs: 31, uptime: '99.90%', lastHeartbeat: '15s ago' },
  { id: 'svc_health', name: 'Product Health', directory: 'services/product-health', status: 'healthy', latencyMs: 16, uptime: '99.99%', lastHeartbeat: '5s ago' },
  { id: 'svc_ai', name: 'AI Engine', directory: 'services/ai-engine', status: 'healthy', latencyMs: 45, uptime: '99.92%', lastHeartbeat: '14s ago' },
  { id: 'svc_ingestion', name: 'Ingestion Service', directory: 'services/ingestion', status: 'healthy', latencyMs: 12, uptime: '99.99%', lastHeartbeat: '3s ago' },
  { id: 'svc_processor', name: 'Event Processor', directory: 'services/event-processor', status: 'healthy', latencyMs: 19, uptime: '99.97%', lastHeartbeat: '6s ago' }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log_101', actorEmail: 'hitesh@acme.com', action: 'Platform Registration', targetType: 'user', targetId: 'user_cust_101', details: 'Customer registered with Acme E-Commerce Inc', ipAddress: '72.14.201.5', timestamp: '10 mins ago' }
];

export const useAuthStore = create<AuthState>((set, get) => ({
  token: safeStorage.getItem('token') || 'mock_customer_jwt_token_101',
  isAuthenticated: !!safeStorage.getItem('token') || true,
  user: safeStorage.getItem('user') ? JSON.parse(safeStorage.getItem('user')!) : DEFAULT_USER,
  portalMode: (safeStorage.getItem('portalMode') as 'customer' | 'admin' | 'superadmin') || 'customer',
  activeOrgId: safeStorage.getItem('activeOrgId') || 'org_acme',
  activeProjectId: safeStorage.getItem('activeProjectId') || 'proj_ecommerce_prod',
  orgs: DEFAULT_ORGS,
  projects: DEFAULT_PROJECTS,
  apiKeys: DEFAULT_API_KEYS,
  invitations: INITIAL_INVITATIONS,
  verificationSent: false,

  onboardingStep: safeStorage.getItem('onboardingStep') ? parseInt(safeStorage.getItem('onboardingStep')!, 10) : 1,
  onboardingCompleted: safeStorage.getItem('onboardingCompleted') === 'true',

  allCustomers: INITIAL_CUSTOMERS,
  allProjectsList: INITIAL_GLOBAL_PROJECTS,
  allApiKeysList: INITIAL_GLOBAL_KEYS,
  servicesHealth: INITIAL_SERVICES_HEALTH,
  auditLogs: INITIAL_AUDIT_LOGS,

  // RBAC Permission Helpers
  canManageBilling: () => get().user?.role === 'owner' || get().user?.isSuperAdmin === true,
  canDeleteProject: () => get().user?.role === 'owner' || get().user?.isSuperAdmin === true,
  canManageKeys: () => get().user?.role === 'owner' || get().user?.role === 'admin' || get().user?.isSuperAdmin === true,
  canInviteMembers: () => get().user?.role === 'owner' || get().user?.role === 'admin' || get().user?.isSuperAdmin === true,

  register: async (name, email, _password, companyName) => {
    try {
      const newUserId = `user_${Date.now()}`;
      const newOrgId = `org_${Date.now()}`;
      const newProjId = `proj_${Date.now()}`;
      const newKeyId = `key_${Date.now()}`;
      const newSdkKey = `if_live_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

      const newUser: UserProfile = {
        id: newUserId,
        name,
        email,
        companyName: companyName || `${name}'s Company`,
        role: 'owner',
        isSuperAdmin: false,
        emailVerified: false
      };

      const newOrg: Organization = {
        id: newOrgId,
        name: companyName || `${name}'s Workspace`,
        ownerEmail: email,
        createdAt: new Date().toISOString().split('T')[0]
      };

      const newProject: Project = {
        id: newProjId,
        name: `${companyName || name}'s Storefront`,
        orgId: newOrgId,
        websiteUrl: 'https://mywebsite.com',
        environment: 'production',
        description: 'Primary customer web application',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        eventCount: 0,
        sdkConnected: false
      };

      const newApiKey: ApiKey = {
        id: newKeyId,
        projectId: newProjId,
        key: newSdkKey,
        displayName: 'Production Key',
        environment: 'production',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastUsedAt: null,
        requestCount: 0
      };

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ org_id: newOrgId, sub: newUserId, role: 'owner', exp: Math.floor(Date.now() / 1000) + 86400 }));
      const mockJwt = `${header}.${payload}.signature`;

      safeStorage.setItem('token', mockJwt);
      safeStorage.setItem('user', JSON.stringify(newUser));
      safeStorage.setItem('activeOrgId', newOrgId);
      safeStorage.setItem('activeProjectId', newProjId);
      safeStorage.setItem('portalMode', 'customer');

      set({
        token: mockJwt,
        isAuthenticated: true,
        user: newUser,
        portalMode: 'customer',
        activeOrgId: newOrgId,
        activeProjectId: newProjId,
        orgs: [...get().orgs, newOrg],
        projects: [...get().projects, newProject],
        apiKeys: { ...get().apiKeys, [newProjId]: [newApiKey] }
      });

      get().recordAuditLog('Customer Registered', 'user', newUserId, `Registered customer ${email}`);
      return true;
    } catch {
      return false;
    }
  },

  login: async (email, _password) => {
    try {
      const isSuper = email.toLowerCase().includes('admin') || email === 'admin@insightfuel.io';
      const existingUser = get().user || DEFAULT_USER;

      const userProfile: UserProfile = {
        ...existingUser,
        email,
        role: isSuper ? 'superadmin' : 'owner',
        isSuperAdmin: isSuper
      };

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ org_id: get().activeOrgId, sub: userProfile.id, role: userProfile.role, exp: Math.floor(Date.now() / 1000) + 86400 }));
      const mockJwt = `${header}.${payload}.signature`;

      safeStorage.setItem('token', mockJwt);
      safeStorage.setItem('user', JSON.stringify(userProfile));
      safeStorage.setItem('portalMode', isSuper ? 'superadmin' : 'customer');

      set({
        token: mockJwt,
        isAuthenticated: true,
        user: userProfile,
        portalMode: isSuper ? 'superadmin' : 'customer'
      });

      get().recordAuditLog('User Login', 'system', userProfile.id, `Signed in: ${email}`);
      return true;
    } catch {
      return false;
    }
  },

  forgotPassword: async (email) => {
    await new Promise(r => setTimeout(r, 600));
    get().recordAuditLog('Password Reset Requested', 'user', email, `Password reset requested for ${email}`);
    return { success: true, message: `Password reset instructions sent to ${email}.` };
  },

  resendVerification: () => {
    set({ verificationSent: true });
    setTimeout(() => set({ verificationSent: false }), 4000);
  },

  logout: () => {
    safeStorage.removeItem('token');
    safeStorage.removeItem('user');
    set({ token: null, isAuthenticated: false, user: null });
  },

  setOnboardingStep: (step) => {
    safeStorage.setItem('onboardingStep', step.toString());
    set({ onboardingStep: step });
  },

  completeOnboarding: () => {
    safeStorage.setItem('onboardingStep', '7');
    safeStorage.setItem('onboardingCompleted', 'true');
    set({ onboardingStep: 7, onboardingCompleted: true });
  },

  resetOnboarding: () => {
    safeStorage.setItem('onboardingStep', '1');
    safeStorage.setItem('onboardingCompleted', 'false');
    set({ onboardingStep: 1, onboardingCompleted: false });
  },

  switchOrganization: (orgId) => {
    const firstProj = get().projects.find(p => p.orgId === orgId);
    const projId = firstProj ? firstProj.id : '';
    safeStorage.setItem('activeOrgId', orgId);
    if (projId) safeStorage.setItem('activeProjectId', projId);
    set({ activeOrgId: orgId, activeProjectId: projId });
    get().recordAuditLog('Workspace Switched', 'organization', orgId, `Switched workspace to ${orgId}`);
  },

  switchProject: (projectId) => {
    safeStorage.setItem('activeProjectId', projectId);
    set({ activeProjectId: projectId });
  },

  switchPortalMode: (mode) => {
    safeStorage.setItem('portalMode', mode);
    set({ portalMode: mode });
  },

  createProject: (name, id) => {
    const activeOrg = get().activeOrgId;
    const newProj: Project = {
      id,
      name,
      orgId: activeOrg,
      websiteUrl: 'https://example.com',
      environment: 'production',
      description: 'Created project',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      eventCount: 0,
      sdkConnected: false
    };
    set({ projects: [...get().projects, newProj], activeProjectId: id });
    safeStorage.setItem('activeProjectId', id);
  },

  createCustomerProject: (name, websiteUrl, environment, description) => {
    const activeOrg = get().activeOrgId;
    const newProjId = `proj_${Date.now()}`;
    const newKeyId = `key_${Date.now()}`;
    const prefix = environment === 'production' ? 'if_live_' : 'if_test_';
    const rawSdkKey = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

    const newProject: Project = {
      id: newProjId,
      name,
      orgId: activeOrg,
      websiteUrl: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
      environment,
      description,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      eventCount: 0,
      sdkConnected: false
    };

    const newApiKey: ApiKey = {
      id: newKeyId,
      projectId: newProjId,
      key: rawSdkKey,
      displayName: `${name} ${environment.toUpperCase()} Key`,
      environment,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: null,
      requestCount: 0
    };

    set({
      projects: [...get().projects, newProject],
      apiKeys: { ...get().apiKeys, [newProjId]: [newApiKey] },
      activeProjectId: newProjId
    });

    safeStorage.setItem('activeProjectId', newProjId);
    get().recordAuditLog('Customer Project Created', 'project', newProjId, `Project created: ${name}`);
    return newProject;
  },

  updateProjectStatus: (projectId, status) => {
    set({ projects: get().projects.map(p => p.id === projectId ? { ...p, status } : p) });
    get().recordAuditLog('Project Status Updated', 'project', projectId, `Status updated to ${status}`);
  },

  deleteCustomerProject: (projectId) => {
    if (!get().canDeleteProject()) return;
    set({ projects: get().projects.filter(p => p.id !== projectId) });
    get().recordAuditLog('Customer Project Deleted', 'project', projectId, `Deleted project ${projectId}`);
  },

  createCustomerOrganization: (orgName) => {
    const newOrgId = `org_${Date.now()}`;
    const newOrg: Organization = {
      id: newOrgId,
      name: orgName,
      ownerEmail: get().user?.email || 'owner@company.com',
      createdAt: new Date().toISOString().split('T')[0]
    };

    set({ orgs: [...get().orgs, newOrg], activeOrgId: newOrgId });
    safeStorage.setItem('activeOrgId', newOrgId);
    get().recordAuditLog('Organization Created', 'organization', newOrgId, `Created org: ${orgName}`);
    return newOrg;
  },

  generateApiKey: (projectId, displayName, environment) => {
    const newKeyId = `key_${Date.now()}`;
    const prefix = environment === 'production' ? 'if_live_' : 'if_test_';
    const rawSdkKey = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

    const newApiKey: ApiKey = {
      id: newKeyId,
      projectId,
      key: rawSdkKey,
      displayName: displayName || `${environment.toUpperCase()} Key`,
      environment,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Just created',
      requestCount: 0
    };

    const currentKeys = get().apiKeys[projectId] || [];
    set({ apiKeys: { ...get().apiKeys, [projectId]: [newApiKey, ...currentKeys] } });
    get().recordAuditLog('API Key Generated', 'api_key', newKeyId, `Key generated: ${displayName}`);
    return newApiKey;
  },

  rotateApiKey: (keyId) => {
    let rotatedNewKey: ApiKey | null = null;
    const allKeysMap = { ...get().apiKeys };

    for (const projId in allKeysMap) {
      const projKeys = allKeysMap[projId];
      const targetIndex = projKeys.findIndex(k => k.id === keyId);
      if (targetIndex !== -1) {
        const oldKey = projKeys[targetIndex];
        projKeys[targetIndex] = { ...oldKey, status: 'rotated' };

        const prefix = oldKey.environment === 'production' ? 'if_live_' : 'if_test_';
        const freshSdkKey = `${prefix}${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;
        
        rotatedNewKey = {
          id: `key_${Date.now()}`,
          projectId: projId,
          key: freshSdkKey,
          displayName: `${oldKey.displayName} (Rotated)`,
          environment: oldKey.environment,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastUsedAt: 'Just rotated',
          requestCount: 0
        };

        allKeysMap[projId] = [rotatedNewKey, ...projKeys];
        break;
      }
    }

    set({ apiKeys: allKeysMap });
    get().recordAuditLog('API Key Rotated', 'api_key', keyId, `Rotated key ${keyId}`);
    return rotatedNewKey;
  },

  toggleKeyStatus: (keyId) => {
    const allKeysMap = { ...get().apiKeys };
    for (const projId in allKeysMap) {
      allKeysMap[projId] = allKeysMap[projId].map(k => k.id === keyId ? { ...k, status: k.status === 'active' ? 'deactivated' : 'active' } : k);
    }
    set({ apiKeys: allKeysMap });
  },

  deleteApiKey: (keyId) => {
    const allKeysMap = { ...get().apiKeys };
    for (const projId in allKeysMap) {
      allKeysMap[projId] = allKeysMap[projId].filter(k => k.id !== keyId);
    }
    set({ apiKeys: allKeysMap });
  },

  updateProfile: (name, companyName) => {
    if (!get().user) return;
    const updated: UserProfile = { ...get().user!, name, companyName };
    safeStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },

  // Team & Invitation Actions
  inviteTeamMember: (email, role) => {
    const newInv: WorkspaceInvitation = {
      id: `inv_${Date.now()}`,
      orgId: get().activeOrgId,
      email,
      role,
      token: `inv_tok_${Math.random().toString(36).substring(2, 14)}`,
      status: 'pending',
      invitedByEmail: get().user?.email || 'owner@company.com',
      createdAt: new Date().toISOString().split('T')[0]
    };
    set({ invitations: [newInv, ...get().invitations] });
    get().recordAuditLog('Team Member Invited', 'invitation', newInv.id, `Invited ${email} with role ${role}`);
    return newInv;
  },

  revokeInvitation: (invitationId) => {
    set({ invitations: get().invitations.map(i => i.id === invitationId ? { ...i, status: 'revoked' as const } : i) });
    get().recordAuditLog('Invitation Revoked', 'invitation', invitationId, `Revoked invitation ${invitationId}`);
  },

  acceptInvitation: (token) => {
    const inv = get().invitations.find(i => i.token === token && i.status === 'pending');
    if (!inv) return false;
    set({ invitations: get().invitations.map(i => i.token === token ? { ...i, status: 'accepted' as const } : i) });
    get().recordAuditLog('Invitation Accepted', 'invitation', inv.id, `Accepted invitation for ${inv.email}`);
    return true;
  },

  transferOwnership: (newOwnerEmail) => {
    if (get().user?.role !== 'owner') return;
    const updatedOrgs = get().orgs.map(o => o.id === get().activeOrgId ? { ...o, ownerEmail: newOwnerEmail } : o);
    set({ orgs: updatedOrgs });
    get().recordAuditLog('Ownership Transferred', 'organization', get().activeOrgId, `Transferred organization ownership to ${newOwnerEmail}`);
  },

  // Superadmin Actions
  suspendCustomer: (userId) => {
    set({ allCustomers: get().allCustomers.map(c => c.id === userId ? { ...c, status: 'suspended' as const } : c) });
  },

  reactivateCustomer: (userId) => {
    set({ allCustomers: get().allCustomers.map(c => c.id === userId ? { ...c, status: 'active' as const } : c) });
  },

  deleteCustomer: (userId) => {
    set({ allCustomers: get().allCustomers.filter(c => c.id !== userId) });
  },

  triggerPasswordReset: (userId) => {
    get().recordAuditLog('Admin Reset Password', 'user', userId, `Triggered reset token for ${userId}`);
    return `rst_${Math.random().toString(36).substring(2, 14)}`;
  },

  revokeApiKey: (keyId) => {
    set({ allApiKeysList: get().allApiKeysList.map(k => k.id === keyId ? { ...k, status: 'deactivated' as const } : k) });
  },

  flagApiKeyAbuse: (keyId) => {
    set({ allApiKeysList: get().allApiKeysList.map(k => k.id === keyId ? { ...k, status: 'flagged' as const } : k) });
  },

  recordAuditLog: (action, targetType, targetId, details) => {
    const actorEmail = get().user?.email || 'system@insightfuel.io';
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}`,
      actorEmail,
      action,
      targetType,
      targetId,
      details,
      ipAddress: '127.0.0.1',
      timestamp: 'Just now'
    };
    set({ auditLogs: [newEntry, ...get().auditLogs] });
  }
}));
