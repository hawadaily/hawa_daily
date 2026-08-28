import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy, addDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ArrowLeft, BookOpen, ThumbsUp, ThumbsDown, Send, Share2 } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  content: string;
  episodeNumber: number;
  createdAt: any;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  likes: string[];
  dislikes: string[];
  createdAt: any;
}

interface Story {
  id: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: any;
}

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [highlightedEpisode, setHighlightedEpisode] = useState<string | null>(null);

  useEffect(() => {
    const loadStoryData = async () => {
      if (!id) return;

      try {
        // Load story
        const storyDoc = await getDoc(doc(db, 'stories', id));
        if (storyDoc.exists()) {
          setStory({ id: storyDoc.id, ...(storyDoc.data() as any) });
        }

        // Load episodes
        const episodesQuery = query(collection(db, 'stories', id, 'episodes'), orderBy('episodeNumber', 'asc'));
        const episodesSnapshot = await getDocs(episodesQuery);
        const episodesData = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setEpisodes(episodesData);

        // Load comments for each episode
        episodesData.forEach((episode) => {
          const commentsQuery = query(collection(db, 'stories', id, 'episodes', episode.id, 'comments'), orderBy('createdAt', 'desc'));
          onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
            setComments((prev) => ({ ...prev, [episode.id]: commentsData }));
          });
        });
      } catch (error) {
        console.error('Failed to load story data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen to auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    loadStoryData();

    return () => unsubscribe();
  }, [id]);

  // Check for episode parameter in URL
  useEffect(() => {
    const episodeParam = searchParams.get('episode');
    if (episodeParam) {
      setHighlightedEpisode(episodeParam);
      // Scroll to the episode after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(`episode-${episodeParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [searchParams]);

  const handleShareEpisode = (episodeId: string) => {
    const shareUrl = `${window.location.origin}/stories/${id}?episode=${episodeId}`;
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  };

  const handleAddComment = async (episodeId: string) => {
    if (!currentUser || !id) {
      alert('Please login to comment');
      return;
    }

    const commentText = newComment[episodeId];
    if (!commentText?.trim()) return;

    try {
      await addDoc(collection(db, 'stories', id, 'episodes', episodeId, 'comments'), {
        text: commentText,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        likes: [],
        dislikes: [],
        createdAt: new Date(),
      });
      setNewComment((prev) => ({ ...prev, [episodeId]: '' }));
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleLikeComment = async (episodeId: string, commentId: string) => {
    if (!currentUser || !id) {
      alert('Please login to like');
      return;
    }

    try {
      const commentRef = doc(db, 'stories', id, 'episodes', episodeId, 'comments', commentId);
      const comment = comments[episodeId]?.find((c) => c.id === commentId);
      
      if (!comment) return;

      if (comment.likes?.includes(currentUser.uid)) {
        // Unlike
        await updateDoc(commentRef, {
          likes: arrayRemove(currentUser.uid),
        });
      } else {
        // Like and remove from dislikes if present
        await updateDoc(commentRef, {
          likes: arrayUnion(currentUser.uid),
          dislikes: arrayRemove(currentUser.uid),
        });
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDislikeComment = async (episodeId: string, commentId: string) => {
    if (!currentUser || !id) {
      alert('Please login to dislike');
      return;
    }

    try {
      const commentRef = doc(db, 'stories', id, 'episodes', episodeId, 'comments', commentId);
      const comment = comments[episodeId]?.find((c) => c.id === commentId);
      
      if (!comment) return;

      if (comment.dislikes?.includes(currentUser.uid)) {
        // Remove dislike
        await updateDoc(commentRef, {
          dislikes: arrayRemove(currentUser.uid),
        });
      } else {
        // Dislike and remove from likes if present
        await updateDoc(commentRef, {
          dislikes: arrayUnion(currentUser.uid),
          likes: arrayRemove(currentUser.uid),
        });
      }
    } catch (error) {
      console.error('Failed to dislike comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Story not found</p>
          <Link to="/stories" className="mt-4 inline-block text-brand-600 hover:text-brand-700">
            Back to Stories
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
          to="/stories"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Stories</span>
        </Link>

        {/* Story Header */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="relative aspect-video">
            <img
              src={story.coverImage}
              alt={story.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
                story.status === 'upcoming' ? 'bg-amber-500 text-white' :
                story.status === 'ongoing' ? 'bg-emerald-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {story.status}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">{story.title}</h1>
            {story.author && (
              <p className="mt-2 text-sm text-gray-500">by {story.author}</p>
            )}
            <p className="mt-3 text-gray-600">{story.description}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4" />
              <span>{episodes.length} episodes</span>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Episodes</h2>
          {episodes.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">No episodes available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  id={`episode-${episode.id}`}
                  className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                    highlightedEpisode === episode.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-lg">
                        {episode.episodeNumber}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">{episode.title}</h3>
                        <button
                          onClick={() => handleShareEpisode(episode.id)}
                          className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600"
                          title="Share episode"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-3 prose prose-sm max-w-none text-gray-700">
                        {episode.content.split('\n').map((paragraph, index) => (
                          <p key={index} className={index > 0 ? 'mt-2' : ''}>
                            {paragraph}
                          </p>
                        ))}
                      </div>

                      {/* Comments Section */}
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900">Comments ({comments[episode.id]?.length || 0})</h4>
                        
                        {/* Add Comment */}
                        <div className="mt-4 flex gap-2">
                          <input
                            type="text"
                            value={newComment[episode.id] || ''}
                            onChange={(e) => setNewComment((prev) => ({ ...prev, [episode.id]: e.target.value }))}
                            placeholder={currentUser ? "Write a comment..." : "Login to comment"}
                            disabled={!currentUser}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-brand-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(episode.id)}
                          />
                          <button
                            onClick={() => handleAddComment(episode.id)}
                            disabled={!currentUser || !newComment[episode.id]?.trim()}
                            className="rounded-xl bg-brand-500 px-4 py-2 text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="mt-4 space-y-3">
                          {comments[episode.id]?.length === 0 ? (
                            <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                          ) : (
                            comments[episode.id]?.map((comment) => (
                              <div key={comment.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900">{comment.userName}</span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-gray-700">{comment.text}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-4">
                                  <button
                                    onClick={() => handleLikeComment(episode.id, comment.id)}
                                    disabled={!currentUser}
                                    className={`flex items-center gap-1 text-sm transition ${
                                      comment.likes?.includes(currentUser?.uid) ? 'text-brand-600' : 'text-gray-500 hover:text-brand-600'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{comment.likes?.length || 0}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDislikeComment(episode.id, comment.id)}
                                    disabled={!currentUser}
                                    className={`flex items-center gap-1 text-sm transition ${
                                      comment.dislikes?.includes(currentUser?.uid) ? 'text-rose-600' : 'text-gray-500 hover:text-rose-600'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                    <span>{comment.dislikes?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
