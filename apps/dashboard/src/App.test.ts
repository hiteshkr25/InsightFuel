import { describe, it, expect, beforeEach } from 'vitest';

// Define a browser-like environment in global scope
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(globalThis, 'window', { value: globalThis });
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Now import the store
import { useAuthStore } from './shared/stores/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    const store = useAuthStore.getState();
    store.logout();
  });

  it('starts as unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('authenticates successfully after login', async () => {
    const store = useAuthStore.getState();
    const success = await store.login('admin@insightfuel.io', 'password');
    
    expect(success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('admin@insightfuel.io');
  });

  it('switches projects within active organization', () => {
    const store = useAuthStore.getState();
    store.switchProject('proj_456');
    expect(useAuthStore.getState().activeProjectId).toBe('proj_456');
  });

  it('clears state on logout', async () => {
    const store = useAuthStore.getState();
    await store.login('admin@insightfuel.io', 'password');
    store.logout();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });
});
