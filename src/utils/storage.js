const STORAGE_KEYS = {
  USERS: 'udp_users',
  POSTS: 'udp_posts',
  MESSAGES: 'udp_messages',
  TRANSACTIONS: 'udp_transactions',
  CURRENT_USER: 'udp_current_user',
};

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };
