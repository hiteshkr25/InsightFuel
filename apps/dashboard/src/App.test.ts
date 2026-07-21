import { describe, it, expect } from 'vitest';
import { useAuthStore } from './shared/stores/useAuthStore';

describe('InsightFuel Dashboard Application Logic', () => {
  it('initializes auth state with default workspace', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('hitesh@insightfuel.io');
    expect(state.orgs.length).toBeGreaterThan(0);
    expect(state.projects.length).toBeGreaterThan(0);
  });

  it('allows switching active organization and project', () => {
    const store = useAuthStore.getState();
    const secondOrg = store.orgs[1] || store.orgs[0];
    
    store.switchOrganization(secondOrg.id);
    expect(useAuthStore.getState().activeOrgId).toBe(secondOrg.id);
  });

  it('supports generating new API keys bound to project', () => {
    const store = useAuthStore.getState();
    const activeProjId = store.activeProjectId;
    const initialKeysCount = (store.apiKeys[activeProjId] || []).length;

    store.generateApiKey(activeProjId, 'Unit Test Key', 'production');
    
    const updatedKeys = useAuthStore.getState().apiKeys[activeProjId] || [];
    expect(updatedKeys.length).toBe(initialKeysCount + 1);
    expect(updatedKeys[0].displayName).toBe('Unit Test Key');
  });

  it('evaluates RBAC permission checkers correctly', () => {
    const store = useAuthStore.getState();
    expect(store.canManageBilling()).toBe(true);
    expect(store.canManageKeys()).toBe(true);
    expect(store.canInviteMembers()).toBe(true);
  });

  it('supports logout and login authentication flow', () => {
    const store = useAuthStore.getState();
    store.logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    store.login('operator@insightfuel.io', true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('operator@insightfuel.io');
  });
});
