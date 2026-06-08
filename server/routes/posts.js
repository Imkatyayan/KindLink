import { Router } from 'express';
import { db, generateId, toPost, toPublicUser } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { type, area } = req.query;
  let query = 'SELECT * FROM posts ORDER BY created_at DESC';
  const posts = db.prepare(query).all();

  let filtered = posts;
  if (type && type !== 'all') filtered = filtered.filter((p) => p.type === type);
  if (area && area !== 'all') filtered = filtered.filter((p) => p.area_of_interest === area);

  const result = filtered.map((p) => {
    const author = db.prepare('SELECT * FROM users WHERE id = ?').get(p.user_id);
    return { ...toPost(p), author: toPublicUser(author) };
  });

  res.json({ posts: result });
});

router.get('/matches', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.role === 'admin') {
    return res.json({ posts: [] });
  }

  const myPosts = db.prepare('SELECT * FROM posts WHERE user_id = ?').all(req.user.id);
  const userAreas = [...new Set(myPosts.map((p) => p.area_of_interest))];
  const targetType = user.role === 'donor' ? 'reception' : 'donation';

  const allPosts = db.prepare('SELECT * FROM posts WHERE user_id != ? AND type = ?').all(req.user.id, targetType);

  const matched = allPosts.filter(
    (p) => userAreas.length === 0 || userAreas.includes(p.area_of_interest)
  );

  const result = matched.map((p) => {
    const author = db.prepare('SELECT * FROM users WHERE id = ?').get(p.user_id);
    return { ...toPost(p), author: toPublicUser(author) };
  });

  res.json({ posts: result });
});

router.get('/mine', authRequired, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ posts: posts.map(toPost) });
});

router.get('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const author = db.prepare('SELECT * FROM users WHERE id = ?').get(post.user_id);
  res.json({ post: { ...toPost(post), author: toPublicUser(author) } });
});

router.post('/', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (user.role === 'admin') {
    return res.status(403).json({ error: 'Admins cannot create posts.' });
  }

  const { type, title, description, areaOfInterest, amount } = req.body;
  if (!type || !title || !description || !areaOfInterest || !amount) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const id = generateId();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO posts (id, user_id, type, title, description, area_of_interest, amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, type, title, description, areaOfInterest, Number(amount), now);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.status(201).json({ post: toPost(post) });
});

export default router;
