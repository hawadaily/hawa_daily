import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db as goldenTimeDb } from '../firebase-golden-time';
import { auth } from '../firebase';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye, ArrowLeft, Send } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

interface GoldenTimeArticle {
  id: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  year?: number;
  category?: string;
  content: string;
  createdAt: any;
  likes?: string[];
  dislikes?: string[];
  views?: number;
  comments?: number;
}

export default function GoldenTimeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<GoldenTimeArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    // Load article
    const articleRef = doc(goldenTimeDb, 'golden-time', id);
    const unsubscribeArticle = onSnapshot(articleRef, (docSnap) => {
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...(docSnap.data() as any) });
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Load comments
    const commentsQuery = query(collection(goldenTimeDb, 'golden-time', id, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
      setComments(commentsData);
    });

    // Increment view count
    incrementView(id);

    return () => {
      unsubscribeArticle();
      unsubscribeComments();
    };
  }, [id]);

  const incrementView = async (articleId: string) => {
    try {
      const articleRef = doc(goldenTimeDb, 'golden-time', articleId);
      await updateDoc(articleRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !article) {
      alert('Please login to like articles');
      return;
    }
    try {
      const articleRef = doc(goldenTimeDb, 'golden-time', article.id);
      const articleSnap = await getDoc(articleRef);
      const articleData = articleSnap.data();
      
      if (articleData?.likes?.includes(user.uid)) {
        await updateDoc(articleRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(articleRef, {
          likes: arrayUnion(user.uid),
          dislikes: arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleDislike = async () => {
    if (!user || !article) {
      alert('Please login to dislike articles');
      return;
    }
    try {
      const articleRef = doc(goldenTimeDb, 'golden-time', article.id);
      const articleSnap = await getDoc(articleRef);
      const articleData = articleSnap.data();
      
      if (articleData?.dislikes?.includes(user.uid)) {
        await updateDoc(articleRef, {
          dislikes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(articleRef, {
          dislikes: arrayUnion(user.uid),
          likes: arrayRemove(user.uid)
        });
      }
    } catch (error) {
      console.error('Error disliking article:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article || !newComment.trim()) {
      alert('Please login to comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await addDoc(collection(goldenTimeDb, 'golden-time', article.id, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });

      // Update comment count on article
      await updateDoc(doc(goldenTimeDb, 'golden-time', article.id), {
        comments: increment(1)
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Article not found</p>
          <Link to="/golden-time" className="mt-4 inline-block text-brand-600 font-semibold">
            Back to Golden Time
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#caf0f8] pb-24">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        {/* Back Button */}
        <Link
          to="/golden-time"
          className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Golden Time</span>
        </Link>

        {/* Article Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}
          
          <div className="flex items-center gap-2 mb-3">
            {article.year && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                {article.year}
              </span>
            )}
            {article.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {article.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
          {article.author && (
            <p className="text-gray-600 mb-4">by {article.author}</p>
          )}
          <p className="text-gray-700 mb-6">{article.description}</p>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  article.likes?.includes(user?.uid) ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-600 hover:bg-brand-50'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span className="font-semibold">{article.likes?.length || 0}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  article.dislikes?.includes(user?.uid) ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                }`}
              >
                <ThumbsDown className="w-5 h-5" />
                <span className="font-semibold">{article.dislikes?.length || 0}</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">{article.comments || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-600">
              <Eye className="w-5 h-5" />
              <span className="font-semibold">{article.views || 0}</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {article.content}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-brand-500"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{submittingComment ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="mb-6 text-gray-600">
              Please <Link to="/login" className="text-brand-600 font-semibold">login</Link> to comment
            </p>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {comment.createdAt?.toDate() ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
