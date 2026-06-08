import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, generateId, toPublicUser } from '../db.js';
import { authRequired, signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { fullName, email, password, phone, address, role, idProof, preferredArea } = req.body;

  if (!fullName || !email || !password || !phone || !address || !role || !idProof) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  if (!['donor', 'receiver'].includes(role)) {
    return res.status(400).json({ error: 'Role must be donor or receiver.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const id = generateId();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, phone, address, role, status, id_proof, preferred_area, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).run(id, fullName, email.toLowerCase(), passwordHash, phone, address, role, idProof, preferredArea || null, new Date().toISOString());

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.status(201).json({
    message: 'Registration submitted. An admin will verify your account before you can log in.',
    user: toPublicUser(user),
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Your account has been blocked. Contact admin for assistance.' });
  }

  if (user.role !== 'admin' && user.status === 'pending') {
    return res.status(403).json({ error: 'Your account is pending admin verification. Please wait for approval.' });
  }

  const publicUser = toPublicUser(user);
  const token = signToken(publicUser);

  res.json({ user: publicUser, token });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: toPublicUser(user) });
});

export default router;
