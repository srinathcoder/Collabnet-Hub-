import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TAGS = [
  { value: 'all', label: 'All Posts', icon: '🌐' },
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'frontend', label: 'Frontend', icon: '💻' },
  { value: 'backend', label: 'Backend', icon: '⚙️' },
  { value: 'fullstack', label: 'Full Stack', icon: '🚀' },
  { value: 'data-science', label: 'Data', icon: '📊' },
  { value: 'ml-ai', label: 'AI / ML', icon: '🧠' },
  { value: 'devops', label: 'DevOps', icon: '☁️' },
  { value: 'career', label: 'Career', icon: '🎯' },
  { value: 'interview', label: 'Interview', icon: '🎤' },
];

function Community() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [newPostTag, setNewPostTag] = useState('general');
  const [postLoading, setPostLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const fetchPosts = async (tag = activeTag) => {
    try {
      setLoading(true);
      const res = await api.get(`/community/posts${tag !== 'all' ? `?tag=${tag}` : ''}`);
      setPosts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [activeTag]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPostLoading(true);
    try {
      const res = await api.post('/community/posts', { content: newPost.trim(), tag: newPostTag });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (err) { alert(err.response?.data?.error || 'Failed to post'); }
    finally { setPostLoading(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.liked ? [...p.likes, user._id] : p.likes.filter(id => id !== user._id) } : p));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      const res = await api.post(`/community/posts/${postId}/comment`, { text });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) { alert(err.response?.data?.error || 'Failed to comment'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) { alert('Failed to delete'); }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getInitials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              <span className="text-gradient">Community</span>
            </h1>
            <p className="text-gray-500 mt-1">Connect, share, and learn with fellow candidates</p>
          </div>
          <button onClick={() => navigate('/candidate/dashboard')}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Dashboard
          </button>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TAGS.map(t => (
            <button key={t.value} onClick={() => setActiveTag(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTag === t.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Create Post */}
        <div className="card-dark mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 space-y-3">
              <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share something with the community..." rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none transition" />
              <div className="flex items-center justify-between">
                <select value={newPostTag} onChange={e => setNewPostTag(e.target.value)}
                  className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-indigo-500/50">
                  {TAGS.filter(t => t.value !== 'all').map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
                <button onClick={handlePost} disabled={postLoading || !newPost.trim()}
                  className={`btn-primary text-sm ${(postLoading || !newPost.trim()) ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {postLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-gray-400 text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="glass-light rounded-2xl p-5 hover:bg-white/5 transition-all">
                {/* Post Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/50 to-purple-500/50 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/10">
                    {getInitials(post.authorId?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-sm">{post.authorId?.name || 'Candidate'}</p>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-[10px] font-bold uppercase border border-indigo-500/20">
                        {TAGS.find(t => t.value === post.tag)?.icon} {post.tag}
                      </span>
                      <span className="text-xs text-gray-600">{timeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 ml-13 pl-13">
                  <button onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                      post.likes?.includes(user?._id) ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                    }`}>
                    <svg className="w-4 h-4" fill={post.likes?.includes(user?._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    {post.likes?.length || 0}
                  </button>
                  <button onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-400 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    {post.comments?.length || 0} Comments
                  </button>
                  {post.authorId?._id === user?._id && (
                    <button onClick={() => handleDelete(post._id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-all ml-auto">
                      Delete
                    </button>
                  )}
                </div>

                {/* Comments Section */}
                {expandedComments[post._id] && (
                  <div className="mt-4 ml-4 pl-4 border-l border-white/5 space-y-3">
                    {post.comments?.map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">{getInitials(c.userId?.name)}</div>
                        <div>
                          <p className="text-xs"><span className="font-bold text-gray-300">{c.userId?.name || 'User'}</span> <span className="text-gray-600">{timeAgo(c.createdAt)}</span></p>
                          <p className="text-sm text-gray-400 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input value={commentInputs[post._id] || ''} onChange={e => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        placeholder="Write a comment..."
                        onKeyDown={e => { if (e.key === 'Enter') handleComment(post._id); }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 transition" />
                      <button onClick={() => handleComment(post._id)}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all active:scale-95">
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
