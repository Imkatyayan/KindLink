import { Router } from 'express';
import { db, toPublicUser } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, adminRequired, (req, res) => {
  const users = db.prepare('SELECT * FROM users WHERE role != ? ORDER BY created_at DESC').all('admin');
  res.json({ users: users.map(toPublicUser) });
});

router.get('/pending', authRequired, adminRequired, (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE status = 'pending' ORDER BY created_at DESC").all();
  res.json({ users: users.map(toPublicUser) });
});

router.get('/:id', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: toPublicUser(user) });
});

router.patch('/:id/status', authRequired, adminRequired, (req, res) => {
  const { status } = req.body;
  if (!['approved', 'blocked', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot modify admin account.' });

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json({ user: toPublicUser(updated), message: `User ${status} successfully.` });
});

router.patch('/me/profile', authRequired, (req, res) => {
  const { phone, address, bio, preferredArea } = req.body;
  db.prepare(`
    UPDATE users SET phone = COALESCE(?, phone), address = COALESCE(?, address),
    bio = COALESCE(?, bio), preferred_area = COALESCE(?, preferred_area)
    WHERE id = ?
  `).run(phone, address, bio, preferredArea, req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: toPublicUser(user) });
});

router.get('/stats/overview', authRequired, adminRequired, (req, res) => {
  const stats = {
    totalUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'admin'").get().c,
    pendingUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'pending'").get().c,
    totalPosts: db.prepare('SELECT COUNT(*) as c FROM posts').get().c,
    totalTransactions: db.prepare('SELECT COUNT(*) as c FROM transactions').get().c,
    totalVolume: db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM transactions WHERE status = 'completed'").get().s,
  };
  res.json({ stats });
});

export default router;
