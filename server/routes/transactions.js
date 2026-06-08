import { Router } from 'express';
import { db, generateId, toPublicUser } from '../db.js';
import { adminRequired, authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, adminRequired, (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all();
  const result = transactions.map((t) => ({
    id: t.id,
    donorId: t.donor_id,
    receiverId: t.receiver_id,
    amount: t.amount,
    postId: t.post_id,
    status: t.status,
    gatewayRef: t.gateway_ref,
    createdAt: t.created_at,
    donor: toPublicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(t.donor_id)),
    receiver: toPublicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(t.receiver_id)),
  }));
  res.json({ transactions: result });
});

router.get('/mine', authRequired, (req, res) => {
  const transactions = db.prepare(`
    SELECT * FROM transactions WHERE donor_id = ? OR receiver_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id, req.user.id);

  res.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      donorId: t.donor_id,
      receiverId: t.receiver_id,
      amount: t.amount,
      postId: t.post_id,
      status: t.status,
      gatewayRef: t.gateway_ref,
      createdAt: t.created_at,
    })),
  });
});

router.post('/pay', authRequired, async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user.role !== 'donor') {
    return res.status(403).json({ error: 'Only donors can initiate payments.' });
  }

  const { receiverId, amount, postId } = req.body;
  if (!receiverId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid receiver and amount are required.' });
  }

  const receiver = db.prepare('SELECT * FROM users WHERE id = ?').get(receiverId);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found.' });

  await new Promise((r) => setTimeout(r, 1200));

  const success = Math.random() > 0.05;
  const id = generateId();
  const now = new Date().toISOString();
  const gatewayRef = `GW-${id.toUpperCase().replace(/-/g, '').slice(0, 12)}`;
  const status = success ? 'completed' : 'failed';

  db.prepare(`
    INSERT INTO transactions (id, donor_id, receiver_id, amount, post_id, status, gateway_ref, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, receiverId, Number(amount), postId || null, status, gatewayRef, now);

  if (!success) {
    return res.status(402).json({ error: 'Payment gateway declined the transaction. Please try again.' });
  }

  res.status(201).json({
    transaction: {
      id,
      donorId: req.user.id,
      receiverId,
      amount: Number(amount),
      postId: postId || null,
      status,
      gatewayRef,
      createdAt: now,
    },
  });
});

export default router;
