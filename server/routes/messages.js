import { Router } from 'express';
import { db, generateId, toPublicUser } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function conversationId(a, b) {
  return [a, b].sort().join('__');
}

router.get('/conversations', authRequired, (req, res) => {
  const messages = db.prepare(`
    SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id, req.user.id);

  const partnerMap = new Map();
  messages.forEach((m) => {
    const partnerId = m.sender_id === req.user.id ? m.receiver_id : m.sender_id;
    if (!partnerMap.has(partnerId)) {
      const partner = db.prepare('SELECT * FROM users WHERE id = ?').get(partnerId);
      partnerMap.set(partnerId, {
        partnerId,
        partner: toPublicUser(partner),
        lastMessage: {
          content: m.content,
          createdAt: m.created_at,
          senderId: m.sender_id,
        },
      });
    }
  });

  res.json({ conversations: Array.from(partnerMap.values()) });
});

router.get('/:partnerId', authRequired, (req, res) => {
  const convId = conversationId(req.user.id, req.params.partnerId);
  const messages = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
  `).all(convId);

  res.json({
    messages: messages.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      content: m.content,
      createdAt: m.created_at,
    })),
  });
});

router.post('/', authRequired, (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content?.trim()) {
    return res.status(400).json({ error: 'Receiver and message content are required.' });
  }

  const receiver = db.prepare('SELECT * FROM users WHERE id = ?').get(receiverId);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found.' });

  const id = generateId();
  const convId = conversationId(req.user.id, receiverId);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, receiver_id, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, convId, req.user.id, receiverId, content.trim(), now);

  res.status(201).json({
    message: {
      id,
      conversationId: convId,
      senderId: req.user.id,
      receiverId,
      content: content.trim(),
      createdAt: now,
    },
  });
});

export default router;
