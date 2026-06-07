import { defineStore } from 'pinia';
import { ref } from 'vue';

const AUTH_KEY = 'hes_auth';
const USERS_KEY = 'hes_users';

function loadAuth() {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function buildUser(userData) {
  const name = userData.name || userData.email?.split('@')[0] || 'User';
  return {
    name,
    email: userData.email,
    role: userData.role || 'User',
    initials: name.charAt(0).toUpperCase(),
    provider: userData.provider || 'email',
    picture: userData.picture || null
  };
}

const saved = loadAuth();

export const useAuthStore = defineStore('auth', () => {
  const user = ref(saved?.user || null);
  const isAuthenticated = ref(!!saved?.user);

  function persist() {
    if (user.value) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ user: user.value }));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }

  function setUser(userData) {
    user.value = buildUser(userData);
    isAuthenticated.value = true;
    persist();
  }

  function login(userData) {
    setUser(userData);
  }

  function loginWithEmail({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (found) {
      setUser({ name: found.name, email: found.email });
      return;
    }

    if (normalizedEmail === 'admin@health.ps' && password === 'admin123') {
      setUser({ name: 'Admin', email: normalizedEmail, role: 'Administrator' });
      return;
    }

    throw new Error('Invalid email or password.');
  }

  function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    users.push({ name: name.trim(), email: normalizedEmail, password });
    saveUsers(users);
    setUser({ name: name.trim(), email: normalizedEmail });
  }

  function loginWithGoogle(profile) {
    setUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      provider: 'google'
    });
  }

  function updateProfile({ name }) {
    if (!user.value) return;
    user.value = buildUser({ ...user.value, name });
    persist();
  }

  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    persist();
  }

  return {
    user,
    isAuthenticated,
    login,
    loginWithEmail,
    register,
    loginWithGoogle,
    updateProfile,
    logout
  };
});
