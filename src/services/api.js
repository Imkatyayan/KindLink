const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('udp_token');
}

function setToken(token) {
  if (token) localStorage.setItem('udp_token', token);
  else localStorage.removeItem('udp_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// Auth
export async function registerUser(userData) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
}

export async function loginUser(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  const data = await request('/auth/me');
  return data.user;
}

export function logoutUser() {
  setToken(null);
}

// Users
export async function getAllUsers() {
  const data = await request('/users');
  return data.users;
}

export async function getPendingUsers() {
  const data = await request('/users/pending');
  return data.users;
}

export async function getUserById(id) {
  const data = await request(`/users/${id}`);
  return data.user;
}

export async function updateUserStatus(userId, status) {
  const data = await request(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.user;
}

export async function updateProfile(updates) {
  const data = await request('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return data.user;
}

export async function getAdminStats() {
  const data = await request('/users/stats/overview');
  return data.stats;
}

// Posts
export async function getAllPosts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.area) params.set('area', filters.area);
  const qs = params.toString();
  const data = await request(`/posts${qs ? `?${qs}` : ''}`);
  return data.posts;
}

export async function getPostById(id) {
  const data = await request(`/posts/${id}`);
  return data.post;
}

export async function getMyPosts() {
  const data = await request('/posts/mine');
  return data.posts;
}

export async function getMatchingPosts() {
  const data = await request('/posts/matches');
  return data.posts;
}

export async function createPost(postData) {
  const data = await request('/posts', { method: 'POST', body: JSON.stringify(postData) });
  return data.post;
}

// Messages
export async function getConversations() {
  const data = await request('/messages/conversations');
  return data.conversations;
}

export async function getMessages(partnerId) {
  const data = await request(`/messages/${partnerId}`);
  return data.messages;
}

export async function sendMessage(receiverId, content) {
  const data = await request('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content }),
  });
  return data.message;
}

// Transactions
export async function getMyTransactions() {
  const data = await request('/transactions/mine');
  return data.transactions;
}

export async function getAllTransactions() {
  const data = await request('/transactions');
  return data.transactions;
}

export async function processPayment({ receiverId, amount, postId }) {
  const data = await request('/transactions/pay', {
    method: 'POST',
    body: JSON.stringify({ receiverId, amount, postId }),
  });
  return data.transaction;
}

export { getToken, setToken };
