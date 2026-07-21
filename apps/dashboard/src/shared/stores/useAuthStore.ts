import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  isSuperAdmin?: boolean;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  websiteUrl: string;
  environment: 'production' | 'staging' | 'development';
  description?: string;
  status?: 'active' | 'paused' | 'archived';
  createdAt: string;
  eventCount?: number;
  framework?: string;
}

export interface ApiKey {
  id: string;
  projectId: string;
  projectName?: string;
  ownerEmail?: string;
  displayName: string;
  key: string;
  environment: 'production' | 'development' | 'staging';
  status: 'active' | 'disabled' | 'flagged';
  createdAt: string;
  lastUsedAt?: string;
  requestCount?: number;
}

export interface GlobalApiKey extends ApiKey {
  projectName: string;
  ownerEmail: string;
}

export interface WorkspaceInvitation {
  id: string;
  orgId: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  token: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  invitedByEmail: string;
  createdAt: string;
  expiresAt: string;
}

export interface CustomerTenant {
  id: string;
  name: string;
  email: string;
  organization: string;
  companyName: string;
  projectCount: number;
  projectsCount: number;
  monthlyEvents: string;
  eventVolume: number;
  registeredAt: string;
  status: 'active' | 'suspended';
  joinedDate: string;
}

export interface GlobalProject {
  id: string;
  name: string;
  orgName: string;
  ownerEmail: string;
  websiteUrl: string;
  environment: 'production' | 'staging' | 'development';
  status: 'active' | 'paused' | 'archived';
  eventCount: number;
  lastActive: string;
  lastActivity: string;
  sdkConnected: boolean;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: string;
  latencyMs: number;
  uptime: string;
  port: number;
  directory: string;
  lastHeartbeat: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  targetType?: string;
  details?: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

export interface OnboardingChecklist {
  orgCreated: boolean;
  projectCreated: boolean;
  keyGenerated: boolean;
  sdkInstalled: boolean;
  firstEventReceived: boolean;
  dashboardExplored: boolean;
}

export type SupportedFramework = 'react' | 'next' | 'vue' | 'angular' | 'js' | 'node' | 'python' | 'other';
export type AutoDetectionStatus = 'idle' | 'listening' | 'connected';

interface AuthStoreState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
  orgs: Organization[];
  activeOrgId: string;
  projects: Project[];
  activeProjectId: string;
  apiKeys: Record<string, ApiKey[]>;
  invitations: WorkspaceInvitation[];
  portalMode: 'customer' | 'superadmin';
  onboardingCompleted: boolean;
  onboardingStep: number;
  isSetupSkipped: boolean;

  // First Value SaaS Journey State
  selectedFramework: SupportedFramework;
  autoDetectionStatus: AutoDetectionStatus;
  hasReceivedFirstEvent: boolean;
  lastReceivedEvent: {
    name: string;
    timestamp: string;
    project: string;
    environment: string;
    payload?: string;
  } | null;
  onboardingChecklist: OnboardingChecklist;

  // SuperAdmin Data
  allCustomers: CustomerTenant[];
  allProjectsList: GlobalProject[];
  allApiKeysList: GlobalApiKey[];
  servicesHealth: ServiceHealth[];
  auditLogs: AuditLogEntry[];

  // Actions
  login: (email: string, isSuperAdmin?: boolean) => void;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  switchProject: (projectId: string) => void;
  switchPortalMode: (mode: 'customer' | 'superadmin') => void;
  setSelectedFramework: (framework: SupportedFramework) => void;
  createCustomerProject: (name: string, websiteUrl: string, environment: 'production' | 'staging' | 'development', description?: string, framework?: string) => void;
  createProject: (name: string, websiteUrl: string, environment: 'production' | 'staging' | 'development', description?: string, framework?: string) => void;
  updateProjectStatus: (projectId: string, status: 'active' | 'paused' | 'archived') => void;
  createOrganization: (name: string) => void;
  generateApiKey: (projectId: string, displayName: string, environment: 'production' | 'development' | 'staging') => void;
  rotateApiKey: (keyId: string) => void;
  toggleKeyStatus: (keyId: string) => void;
  deleteApiKey: (keyId: string) => void;
  inviteTeamMember: (email: string, role: 'admin' | 'developer' | 'viewer') => void;
  revokeInvitation: (invitationId: string) => void;
  acceptInvitation: (token: string) => void;
  transferOwnership: (newOwnerEmail: string) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  reopenOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  
  // Journey Ingestion Verification Actions
  startAutoSdkDetection: () => void;
  sendTestEvent: (eventName?: string) => void;
  markChecklistStep: (stepKey: keyof OnboardingChecklist, value?: boolean) => void;

  // SuperAdmin Management Actions
  suspendCustomer: (customerId: string) => void;
  reactivateCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => void;
  triggerPasswordReset: (email: string) => void;
  revokeApiKey: (keyId: string) => void;
  flagApiKeyAbuse: (keyId: string) => void;

  // Permission Checks
  canManageBilling: () => boolean;
  canDeleteProject: () => boolean;
  canManageKeys: () => boolean;
  canInviteMembers: () => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      token: 'mock_jwt_token_insightfuel',
      isAuthenticated: true,
      user: {
        id: 'usr_owner_101',
        name: 'Hitesh Kumar',
        email: 'hitesh@insightfuel.io',
        role: 'owner',
        isSuperAdmin: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      orgs: [
        {
          id: 'org_acme_1',
          name: 'Acme E-Commerce Inc',
          slug: 'acme-ecommerce',
          ownerEmail: 'hitesh@insightfuel.io',
          plan: 'pro',
          createdAt: '2026-01-10'
        },
        {
          id: 'org_beta_2',
          name: 'Beta Dev Innovations',
          slug: 'beta-dev',
          ownerEmail: 'hitesh@insightfuel.io',
          plan: 'free',
          createdAt: '2026-02-01'
        }
      ],
      activeOrgId: 'org_acme_1',
      projects: [
        {
          id: 'proj_1',
          orgId: 'org_acme_1',
          name: 'Primary Web Storefront',
          websiteUrl: 'https://shop.acme.com',
          environment: 'production',
          description: 'Main customer e-commerce web storefront analytics',
          status: 'active',
          createdAt: '2026-01-15',
          eventCount: 142850,
          framework: 'react'
        },
        {
          id: 'proj_2',
          orgId: 'org_acme_1',
          name: 'Mobile Web Checkout App',
          websiteUrl: 'https://m.acme.com',
          environment: 'production',
          description: 'Responsive mobile checkout portal tracking',
          status: 'active',
          createdAt: '2026-02-10',
          eventCount: 89400,
          framework: 'next'
        },
        {
          id: 'proj_3',
          orgId: 'org_beta_2',
          name: 'Beta Sandbox Web',
          websiteUrl: 'https://sandbox.beta.io',
          environment: 'development',
          description: 'Staging environment analytics testing',
          status: 'active',
          createdAt: '2026-03-01',
          eventCount: 120,
          framework: 'js'
        }
      ],
      activeProjectId: 'proj_1',
      apiKeys: {
        proj_1: [
          {
            id: 'key_prod_1',
            projectId: 'proj_1',
            displayName: 'Production Web Write Key',
            key: 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e',
            environment: 'production',
            status: 'active',
            createdAt: '2026-01-15',
            lastUsedAt: '2 mins ago',
            requestCount: 142850
          },
          {
            id: 'key_dev_1',
            projectId: 'proj_1',
            displayName: 'Staging Test Key',
            key: 'if_test_4a3b2c1d0e9f8a7b6c5d4e3f',
            environment: 'development',
            status: 'active',
            createdAt: '2026-01-20',
            lastUsedAt: '1 hour ago',
            requestCount: 3820
          }
        ],
        proj_2: [
          {
            id: 'key_prod_2',
            projectId: 'proj_2',
            displayName: 'Mobile Web Key',
            key: 'if_live_7c6b5a4d3e2f1a0b9c8d7e6f',
            environment: 'production',
            status: 'active',
            createdAt: '2026-02-10',
            lastUsedAt: '5 mins ago',
            requestCount: 89400
          }
        ],
        proj_3: [
          {
            id: 'key_dev_3',
            projectId: 'proj_3',
            displayName: 'Sandbox Development Key',
            key: 'if_test_1e2d3c4b5a6f7e8d9c0b1a2f',
            environment: 'development',
            status: 'active',
            createdAt: '2026-03-01',
            lastUsedAt: 'Yesterday',
            requestCount: 120
          }
        ]
      },
      invitations: [
        {
          id: 'inv_101',
          orgId: 'org_acme_1',
          email: 'alex.dev@acme.com',
          role: 'developer',
          token: 'inv_tok_8f9a2b',
          status: 'pending',
          invitedByEmail: 'hitesh@insightfuel.io',
          createdAt: '2026-07-20',
          expiresAt: '2026-07-27'
        }
      ],
      portalMode: 'customer',
      onboardingCompleted: true,
      onboardingStep: 1,
      isSetupSkipped: false,

      // Journey State Defaults
      selectedFramework: 'react',
      autoDetectionStatus: 'connected',
      hasReceivedFirstEvent: true,
      lastReceivedEvent: {
        name: 'checkout_completed',
        timestamp: 'Just now',
        project: 'Primary Web Storefront',
        environment: 'production',
        payload: '{"order_id": "ord_9421", "amount": 149.50}'
      },
      onboardingChecklist: {
        orgCreated: true,
        projectCreated: true,
        keyGenerated: true,
        sdkInstalled: true,
        firstEventReceived: true,
        dashboardExplored: true
      },

      allCustomers: [
        { id: 'cust_1', name: 'Hitesh Kumar', email: 'hitesh@insightfuel.io', organization: 'Acme E-Commerce Inc', companyName: 'Acme E-Commerce Inc', projectCount: 2, projectsCount: 2, monthlyEvents: '232.2k', eventVolume: 232250, registeredAt: '2026-01-10', status: 'active', joinedDate: '2026-01-10' },
        { id: 'cust_2', name: 'Sarah Connor', email: 'sarah@acme.com', organization: 'Acme E-Commerce Inc', companyName: 'Acme E-Commerce Inc', projectCount: 1, projectsCount: 1, monthlyEvents: '89.4k', eventVolume: 89400, registeredAt: '2026-02-10', status: 'active', joinedDate: '2026-02-10' },
        { id: 'cust_3', name: 'Michael Scott', email: 'mscott@beta.io', organization: 'Beta Dev Innovations', companyName: 'Beta Dev Innovations', projectCount: 1, projectsCount: 1, monthlyEvents: '120', eventVolume: 120, registeredAt: '2026-03-01', status: 'active', joinedDate: '2026-03-01' }
      ],

      allProjectsList: [
        { id: 'proj_1', name: 'Primary Web Storefront', orgName: 'Acme E-Commerce Inc', ownerEmail: 'hitesh@insightfuel.io', websiteUrl: 'https://shop.acme.com', environment: 'production', status: 'active', eventCount: 142850, lastActive: '2 mins ago', lastActivity: '2 mins ago', sdkConnected: true },
        { id: 'proj_2', name: 'Mobile Web Checkout App', orgName: 'Acme E-Commerce Inc', ownerEmail: 'hitesh@insightfuel.io', websiteUrl: 'https://m.acme.com', environment: 'production', status: 'active', eventCount: 89400, lastActive: '5 mins ago', lastActivity: '5 mins ago', sdkConnected: true },
        { id: 'proj_3', name: 'Beta Sandbox Web', orgName: 'Beta Dev Innovations', ownerEmail: 'mscott@beta.io', websiteUrl: 'https://sandbox.beta.io', environment: 'development', status: 'active', eventCount: 120, lastActive: 'Yesterday', lastActivity: 'Yesterday', sdkConnected: false }
      ],

      allApiKeysList: [
        { id: 'key_prod_1', projectId: 'proj_1', projectName: 'Primary Web Storefront', ownerEmail: 'hitesh@insightfuel.io', displayName: 'Production Web Write Key', key: 'if_live_9f8a3c2b1e4d5f6a7b8c9d0e', environment: 'production', status: 'active', createdAt: '2026-01-15', lastUsedAt: '2 mins ago', requestCount: 142850 },
        { id: 'key_dev_1', projectId: 'proj_1', projectName: 'Primary Web Storefront', ownerEmail: 'hitesh@insightfuel.io', displayName: 'Staging Test Key', key: 'if_test_4a3b2c1d0e9f8a7b6c5d4e3f', environment: 'development', status: 'active', createdAt: '2026-01-20', lastUsedAt: '1 hour ago', requestCount: 3820 },
        { id: 'key_prod_2', projectId: 'proj_2', projectName: 'Mobile Web Checkout App', ownerEmail: 'hitesh@insightfuel.io', displayName: 'Mobile Web Key', key: 'if_live_7c6b5a4d3e2f1a0b9c8d7e6f', environment: 'production', status: 'active', createdAt: '2026-02-10', lastUsedAt: '5 mins ago', requestCount: 89400 }
      ],

      servicesHealth: [
        { id: 'svc_1', name: 'API Gateway Service', status: 'healthy', latency: '12ms', latencyMs: 12, uptime: '99.99%', port: 8000, directory: 'apps/api-gateway', lastHeartbeat: '10s ago' },
        { id: 'svc_2', name: 'Analytics Ingestion Service', status: 'healthy', latency: '18ms', latencyMs: 18, uptime: '99.98%', port: 8001, directory: 'services/ingestion', lastHeartbeat: '8s ago' },
        { id: 'svc_3', name: 'Event Processor Stream', status: 'healthy', latency: '8ms', latencyMs: 8, uptime: '99.99%', port: 8002, directory: 'services/event-processor', lastHeartbeat: '5s ago' },
        { id: 'svc_4', name: 'Query Engine Service', status: 'healthy', latency: '24ms', latencyMs: 24, uptime: '99.95%', port: 8003, directory: 'services/query-api', lastHeartbeat: '12s ago' },
        { id: 'svc_5', name: 'Feature Intelligence Service', status: 'healthy', latency: '32ms', latencyMs: 32, uptime: '99.92%', port: 8004, directory: 'services/feature-intelligence', lastHeartbeat: '15s ago' },
        { id: 'svc_6', name: 'Product Health Service', status: 'healthy', latency: '15ms', latencyMs: 15, uptime: '99.99%', port: 8005, directory: 'services/product-health', lastHeartbeat: '10s ago' },
        { id: 'svc_7', name: 'AI Recommendation Engine', status: 'healthy', latency: '45ms', latencyMs: 45, uptime: '99.90%', port: 8006, directory: 'services/ai-engine', lastHeartbeat: '20s ago' }
      ],

      auditLogs: [
        { id: 'log_1', timestamp: '2026-07-21 16:30:12', actorEmail: 'hitesh@insightfuel.io', action: 'API Key Created', target: 'key_prod_1', targetType: 'API Key', details: 'Generated production write key for Primary Web Storefront', ipAddress: '192.168.1.1', status: 'success' },
        { id: 'log_2', timestamp: '2026-07-21 15:45:00', actorEmail: 'sarah@acme.com', action: 'Project Updated', target: 'proj_1', targetType: 'Project', details: 'Updated environment configuration', ipAddress: '192.168.1.45', status: 'success' }
      ],

      setSelectedFramework: (framework: SupportedFramework) => {
        set({ selectedFramework: framework });
      },

      login: (email: string, isSuperAdmin = false) => {
        const role: 'owner' | 'admin' | 'developer' | 'viewer' = 'owner';
        set({
          token: 'mock_jwt_token_insightfuel',
          isAuthenticated: true,
          user: {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0],
            email,
            role,
            isSuperAdmin,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          },
          portalMode: isSuperAdmin ? 'superadmin' : 'customer'
        });
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          portalMode: 'customer'
        });
      },

      switchOrganization: (orgId: string) => {
        const { projects } = get();
        const orgProjects = projects.filter((p) => p.orgId === orgId);
        const nextProjectId = orgProjects[0]?.id || '';
        set({
          activeOrgId: orgId,
          activeProjectId: nextProjectId
        });
      },

      switchProject: (projectId: string) => {
        set({ activeProjectId: projectId });
      },

      switchPortalMode: (mode: 'customer' | 'superadmin') => {
        set({ portalMode: mode });
      },

      createCustomerProject: (name: string, websiteUrl: string, environment: 'production' | 'staging' | 'development', description?: string, framework = 'react') => {
        const { activeOrgId, projects, apiKeys, allProjectsList, onboardingChecklist } = get();
        const newProjId = `proj_${Date.now()}`;
        const newProject: Project = {
          id: newProjId,
          orgId: activeOrgId,
          name,
          websiteUrl,
          environment,
          description,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          eventCount: 0,
          framework
        };

        const prefix = environment === 'production' ? 'if_live_' : 'if_test_';
        const randomHex = Math.random().toString(36).substring(2, 18);
        const newKey: ApiKey = {
          id: `key_${Date.now()}`,
          projectId: newProjId,
          displayName: `${name} Key`,
          key: `${prefix}${randomHex}`,
          environment,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastUsedAt: 'Just now',
          requestCount: 0
        };

        const newGlobalProject: GlobalProject = {
          id: newProjId,
          name,
          orgName: 'Acme E-Commerce Inc',
          ownerEmail: 'hitesh@insightfuel.io',
          websiteUrl,
          environment,
          status: 'active',
          eventCount: 0,
          lastActive: 'Just now',
          lastActivity: 'Just now',
          sdkConnected: false
        };

        set({
          projects: [...projects, newProject],
          allProjectsList: [newGlobalProject, ...allProjectsList],
          activeProjectId: newProjId,
          selectedFramework: framework as SupportedFramework,
          apiKeys: {
            ...apiKeys,
            [newProjId]: [newKey]
          },
          onboardingChecklist: {
            ...onboardingChecklist,
            projectCreated: true,
            keyGenerated: true
          }
        });
      },

      createProject: (name: string, websiteUrl: string, environment: 'production' | 'staging' | 'development', description?: string, framework?: string) => {
        get().createCustomerProject(name, websiteUrl, environment, description, framework);
      },

      updateProjectStatus: (projectId: string, status: 'active' | 'paused' | 'archived') => {
        const { projects, allProjectsList } = get();
        set({
          projects: projects.map(p => p.id === projectId ? { ...p, status } : p),
          allProjectsList: allProjectsList.map(p => p.id === projectId ? { ...p, status } : p)
        });
      },

      createOrganization: (name: string) => {
        const { orgs, user, onboardingChecklist } = get();
        const newOrgId = `org_${Date.now()}`;
        const newOrg: Organization = {
          id: newOrgId,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          ownerEmail: user?.email || 'owner@acme.com',
          plan: 'pro',
          createdAt: new Date().toISOString().split('T')[0]
        };

        set({
          orgs: [...orgs, newOrg],
          activeOrgId: newOrgId,
          onboardingChecklist: {
            ...onboardingChecklist,
            orgCreated: true
          }
        });
      },

      generateApiKey: (projectId: string, displayName: string, environment: 'production' | 'development' | 'staging') => {
        const { apiKeys, allApiKeysList, onboardingChecklist } = get();
        const prefix = environment === 'production' ? 'if_live_' : 'if_test_';
        const randomHex = Math.random().toString(36).substring(2, 18);

        const newKey: ApiKey = {
          id: `key_${Date.now()}`,
          projectId,
          displayName,
          key: `${prefix}${randomHex}`,
          environment,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastUsedAt: 'Never',
          requestCount: 0
        };

        const newGlobalKey: GlobalApiKey = {
          ...newKey,
          projectName: 'Primary Storefront',
          ownerEmail: 'hitesh@insightfuel.io'
        };

        const existing = apiKeys[projectId] || [];
        set({
          apiKeys: {
            ...apiKeys,
            [projectId]: [newKey, ...existing]
          },
          allApiKeysList: [newGlobalKey, ...allApiKeysList],
          onboardingChecklist: {
            ...onboardingChecklist,
            keyGenerated: true
          }
        });
      },

      rotateApiKey: (keyId: string) => {
        const { apiKeys, activeProjectId, allApiKeysList } = get();
        const list = apiKeys[activeProjectId] || [];
        const updated = list.map(k => {
          if (k.id === keyId) {
            const prefix = k.environment === 'production' ? 'if_live_' : 'if_test_';
            const randomHex = Math.random().toString(36).substring(2, 18);
            return { ...k, key: `${prefix}${randomHex}`, lastUsedAt: 'Rotated just now' };
          }
          return k;
        });

        set({
          apiKeys: {
            ...apiKeys,
            [activeProjectId]: updated
          },
          allApiKeysList: allApiKeysList.map(k => k.id === keyId ? { ...k, key: updated.find(u => u.id === keyId)?.key || k.key } : k)
        });
      },

      toggleKeyStatus: (keyId: string) => {
        const { apiKeys, activeProjectId, allApiKeysList } = get();
        const list = apiKeys[activeProjectId] || [];
        const updated = list.map(k => {
          if (k.id === keyId) {
            return { ...k, status: (k.status === 'active' ? 'disabled' : 'active') as 'active' | 'disabled' };
          }
          return k;
        });

        set({
          apiKeys: {
            ...apiKeys,
            [activeProjectId]: updated
          },
          allApiKeysList: allApiKeysList.map(k => k.id === keyId ? { ...k, status: k.status === 'active' ? 'disabled' : 'active' } : k)
        });
      },

      deleteApiKey: (keyId: string) => {
        const { apiKeys, activeProjectId, allApiKeysList } = get();
        const list = apiKeys[activeProjectId] || [];
        const updated = list.filter(k => k.id !== keyId);

        set({
          apiKeys: {
            ...apiKeys,
            [activeProjectId]: updated
          },
          allApiKeysList: allApiKeysList.filter(k => k.id !== keyId)
        });
      },

      inviteTeamMember: (email: string, role: 'admin' | 'developer' | 'viewer') => {
        const { invitations, activeOrgId, user } = get();
        const newInv: WorkspaceInvitation = {
          id: `inv_${Date.now()}`,
          orgId: activeOrgId,
          email,
          role,
          token: `inv_tok_${Math.random().toString(36).substring(2, 10)}`,
          status: 'pending',
          invitedByEmail: user?.email || 'owner@acme.com',
          createdAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
        };

        set({ invitations: [newInv, ...invitations] });
      },

      revokeInvitation: (invitationId: string) => {
        const { invitations } = get();
        set({
          invitations: invitations.map(i => i.id === invitationId ? { ...i, status: 'revoked' } : i)
        });
      },

      acceptInvitation: (token: string) => {
        const { invitations } = get();
        set({
          invitations: invitations.map(i => i.token === token ? { ...i, status: 'accepted' } : i)
        });
      },

      transferOwnership: (newOwnerEmail: string) => {
        const { orgs, activeOrgId } = get();
        set({
          orgs: orgs.map(o => o.id === activeOrgId ? { ...o, ownerEmail: newOwnerEmail } : o)
        });
      },

      completeOnboarding: () => {
        const { onboardingChecklist } = get();
        set({ 
          onboardingCompleted: true, 
          onboardingStep: 7,
          isSetupSkipped: false,
          onboardingChecklist: {
            ...onboardingChecklist,
            dashboardExplored: true
          }
        });
      },

      skipOnboarding: () => {
        set({ isSetupSkipped: true, onboardingCompleted: false });
      },

      reopenOnboarding: () => {
        set({ isSetupSkipped: false, onboardingStep: 1 });
      },

      setOnboardingStep: (step: number) => {
        set({ onboardingStep: step });
      },

      startAutoSdkDetection: () => {
        set({ autoDetectionStatus: 'listening' });
        setTimeout(() => {
          get().sendTestEvent('auto_detected_event');
          set({ autoDetectionStatus: 'connected' });
        }, 2500);
      },

      sendTestEvent: (eventName = 'test_signal_ping') => {
        const { projects, activeProjectId, onboardingChecklist, allProjectsList } = get();
        const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

        const updatedEventCount = (activeProj?.eventCount || 0) + 1;
        const nowStr = new Date().toLocaleTimeString();

        set({
          hasReceivedFirstEvent: true,
          autoDetectionStatus: 'connected',
          lastReceivedEvent: {
            name: eventName,
            timestamp: nowStr,
            project: activeProj?.name || 'Primary Storefront',
            environment: activeProj?.environment || 'production',
            payload: JSON.stringify({ event: eventName, status: 'success', latency_ms: 14 })
          },
          projects: projects.map(p => p.id === activeProjectId ? { ...p, eventCount: updatedEventCount } : p),
          allProjectsList: allProjectsList.map(p => p.id === activeProjectId ? { ...p, sdkConnected: true, lastActivity: nowStr, eventCount: updatedEventCount } : p),
          onboardingChecklist: {
            ...onboardingChecklist,
            sdkInstalled: true,
            firstEventReceived: true
          }
        });
      },

      markChecklistStep: (stepKey: keyof OnboardingChecklist, value = true) => {
        const { onboardingChecklist } = get();
        set({
          onboardingChecklist: {
            ...onboardingChecklist,
            [stepKey]: value
          }
        });
      },

      suspendCustomer: (customerId: string) => {
        const { allCustomers } = get();
        set({
          allCustomers: allCustomers.map(c => c.id === customerId ? { ...c, status: 'suspended' } : c)
        });
      },

      reactivateCustomer: (customerId: string) => {
        const { allCustomers } = get();
        set({
          allCustomers: allCustomers.map(c => c.id === customerId ? { ...c, status: 'active' } : c)
        });
      },

      deleteCustomer: (customerId: string) => {
        const { allCustomers } = get();
        set({
          allCustomers: allCustomers.filter(c => c.id !== customerId)
        });
      },

      triggerPasswordReset: (email: string) => {
        console.log(`Password reset link dispatched to ${email}`);
      },

      revokeApiKey: (keyId: string) => {
        get().deleteApiKey(keyId);
      },

      flagApiKeyAbuse: (keyId: string) => {
        get().toggleKeyStatus(keyId);
      },

      canManageBilling: () => {
        const { user } = get();
        return user?.role === 'owner';
      },

      canDeleteProject: () => {
        const { user } = get();
        return user?.role === 'owner';
      },

      canManageKeys: () => {
        const { user } = get();
        return user?.role === 'owner' || user?.role === 'admin';
      },

      canInviteMembers: () => {
        const { user } = get();
        return user?.role === 'owner' || user?.role === 'admin';
      }
    }),
    {
      name: 'insightfuel_auth_store'
    }
  )
);
