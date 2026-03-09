const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CommunityPost = require('../models/CommunityPost');

// Only candidates can access community
const candidateOnly = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ error: 'Only candidates can access the community' });
  }
  next();
};

// Get all posts (newest first)
router.get('/posts', protect, candidateOnly, async (req, res) => {
  try {
    const { tag } = req.query;
    const filter = tag && tag !== 'all' ? { tag } : {};
    const posts = await CommunityPost.find(filter)
      .populate('authorId', 'name email')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new post
router.post('/posts', protect, candidateOnly, async (req, res) => {
  try {
    const { content, tag } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });

    const post = new CommunityPost({
      authorId: req.user._id,
      content: content.trim(),
      tag: tag || 'general',
    });
    await post.save();
    const populated = await CommunityPost.findById(post._id)
      .populate('authorId', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / unlike a post
router.post('/posts/:postId/like', protect, candidateOnly, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id.toString();
    const idx = post.likes.findIndex(id => id.toString() === userId);

    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to a post
router.post('/posts/:postId/comment', protect, candidateOnly, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text is required' });

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();

    const updated = await CommunityPost.findById(post._id)
      .populate('authorId', 'name email')
      .populate('comments.userId', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete own post
router.delete('/posts/:postId', protect, candidateOnly, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    await CommunityPost.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
