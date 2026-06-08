import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'kindlink.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('donor', 'receiver', 'admin')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'blocked')),
      id_proof TEXT NOT NULL,
      preferred_area TEXT,
      bio TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('donation', 'reception')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      area_of_interest TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL REFERENCES users(id),
      receiver_id TEXT NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      post_id TEXT REFERENCES posts(id),
      status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed')),
      gateway_ref TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_area ON posts(area_of_interest);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_donor ON transactions(donor_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
  `);

  seedIfEmpty();
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return;

  const now = new Date().toISOString();
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const users = [
    {
      id: 'admin-1',
      full_name: 'Platform Admin',
      email: 'admin@kindlink.com',
      password_hash: hash('admin123'),
      phone: '9999999999',
      address: 'Admin Office, City Center',
      role: 'admin',
      status: 'approved',
      id_proof: 'ADMIN-001',
      preferred_area: null,
      bio: 'Platform administrator',
    },
    {
      id: 'donor-1',
      full_name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password_hash: hash('demo123'),
      phone: '9876543210',
      address: '123 Oak Street, Boston',
      role: 'donor',
      status: 'approved',
      id_proof: 'DL-12345',
      preferred_area: 'Education',
      bio: 'Passionate about supporting education initiatives.',
    },
    {
      id: 'receiver-1',
      full_name: 'Michael Chen',
      email: 'michael@example.com',
      password_hash: hash('demo123'),
      phone: '9123456780',
      address: '456 Pine Ave, Seattle',
      role: 'receiver',
      status: 'approved',
      id_proof: 'PASS-67890',
      preferred_area: 'Healthcare',
      bio: 'Seeking support for medical treatment.',
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, phone, address, role, status, id_proof, preferred_area, bio, created_at)
    VALUES (@id, @full_name, @email, @password_hash, @phone, @address, @role, @status, @id_proof, @preferred_area, @bio, @created_at)
  `);

  users.forEach((u) => insertUser.run({ ...u, created_at: now }));

  db.prepare(`
    INSERT INTO posts (id, user_id, type, title, description, area_of_interest, amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'post-1', 'donor-1', 'donation',
    'Supporting Education for Underprivileged Children',
    'Looking to donate funds directly to individuals or organizations working in education. Prefer transparent one-to-one transfers.',
    'Education', 5000, now
  );

  db.prepare(`
    INSERT INTO posts (id, user_id, type, title, description, area_of_interest, amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'post-2', 'receiver-1', 'reception',
    'Need Support for Medical Treatment',
    'Seeking direct financial assistance for ongoing medical treatment. All documentation available for verification.',
    'Healthcare', 3000, now
  );

  console.log('✓ Database seeded with demo data');
}

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    role: row.role,
    status: row.status,
    idProof: row.id_proof,
    preferredArea: row.preferred_area,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

export function toPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    description: row.description,
    areaOfInterest: row.area_of_interest,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

export { db, generateId };
