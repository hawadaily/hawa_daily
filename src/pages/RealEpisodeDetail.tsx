import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy, where, addDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, increment } from 'firebase/firestore';
import { db as realStoryDb } from '../firebase-real-story';
import { auth } from '../firebase';
import { ArrowLeft, ThumbsUp, ThumbsDown, Send, Share2, Eye } from 'lucide-react';
import PromoBanner from '../components/PromoBanner';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  likes: string[];
  dislikes: string[];
  createdAt: any;
}

interface Episode {
  id: string;
  title: string;
  content: string;
  episodeNumber: number;
  image?: string;
  viewCount?: number;
  likes?: string[];
  dislikes?: string[];
  youtubeLink?: string;
  tiktokLink?: string;
  createdAt: any;
}

interface Story {
  id: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  slug: string;
  youtubeLink?: string;
  tiktokLink?: string;
  createdAt: any;
}

export default function RealEpisodeDetail() {
  const { slug, '*': episodePath } = useParams<{ slug: string; '*': string }>();
  const episodeNumber = episodePath?.replace('ep-', '') || '';
  const [story, setStory] = useState<Story | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    const loadEpisodeData = async () => {
      if (!slug || !episodeNumber) {
        console.error('No slug or episodeNumber provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading episode:', slug, episodeNumber);
        
        // Find the story by slug
        const storiesQuery = query(collection(realStoryDb, 'real-stories'), where('slug', '==', slug));
        const storiesSnapshot = await getDocs(storiesQuery);
        
        if (storiesSnapshot.empty) {
          console.error('No story found with slug:', slug);
          setLoading(false);
          return;
        }

        const storyDoc = storiesSnapshot.docs[0];
        const storyId = storyDoc.id;
        
        // Load story
        if (storyDoc.exists()) {
          setStory({ id: storyDoc.id, ...(storyDoc.data() as any) });
        }

        // Load episode by episodeNumber
        const episodesQuery = query(collection(realStoryDb, 'real-stories', storyId, 'episodes'), where('episodeNumber', '==', parseInt(episodeNumber)));
        const episodesSnapshot = await getDocs(episodesQuery);
        
        if (!episodesSnapshot.empty) {
          const episodeDoc = episodesSnapshot.docs[0];
          const episodeData = { id: episodeDoc.id, ...(episodeDoc.data() as any) };
          setEpisode(episodeData);
          setEpisodeId(episodeDoc.id);
          
          // Increment view count
          await updateDoc(doc(realStoryDb, 'real-stories', storyId, 'episodes', episodeDoc.id), {
            viewCount: increment(1)
          });

          // Load comments
          const commentsQuery = query(collection(realStoryDb, 'real-stories', storyId, 'episodes', episodeDoc.id, 'comments'), orderBy('createdAt', 'desc'));
          onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
            setComments(commentsData);
          });
        } else {
          console.error('No episode found with number:', episodeNumber);
        }
      } catch (error) {
        console.error('Failed to load episode data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEpisodeData();

    // Listen to auth state
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [slug, episodeNumber]);

  useEffect(() => {
    if (story && episode) {
      document.title = `${episode.title} - ${story.title} | ހަވާ ޑެއިލީ`;
    }
  }, [story, episode]);

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: episode?.title,
        text: story?.title,
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

  const handleAddComment = async () => {
    if (!slug || !episodeId || !story) return;

    const commentText = newComment.trim();
    if (!commentText) return;

    try {
      await addDoc(collection(realStoryDb, 'real-stories', story.id, 'episodes', episodeId, 'comments'), {
        text: commentText,
        userId: currentUser?.uid || 'anonymous',
        userName: currentUser?.displayName || 'Anonymous',
        likes: [],
        dislikes: [],
        createdAt: new Date(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLike = async () => {
    if (!slug || !episodeId || !story) return;

    try {
      const episodeRef = doc(realStoryDb, 'real-stories', story.id, 'episodes', episodeId);
      const userId = currentUser?.uid || 'anonymous';
      const storageKey = `episode_${episodeId}_reaction`;
      const localReaction = localStorage.getItem(storageKey);

      if (episode?.likes?.includes(userId) || localReaction === 'like') {
        // Unlike
        if (currentUser) {
          await updateDoc(episodeRef, {
            likes: arrayRemove(userId),
          });
        } else {
          localStorage.removeItem(storageKey);
          setUserReaction(null);
        }
      } else {
        // Like and remove from dislikes if present
        if (currentUser) {
          await updateDoc(episodeRef, {
            likes: arrayUnion(userId),
            dislikes: arrayRemove(userId),
          });
        } else {
          localStorage.setItem(storageKey, 'like');
          setUserReaction('like');
        }
      }
    } catch (error) {
      console.error('Failed to like episode:', error);
    }
  };

  const handleDislike = async () => {
    if (!slug || !episodeId || !story) return;

    try {
      const episodeRef = doc(realStoryDb, 'real-stories', story.id, 'episodes', episodeId);
      const userId = currentUser?.uid || 'anonymous';
      const storageKey = `episode_${episodeId}_reaction`;
      const localReaction = localStorage.getItem(storageKey);

      if (episode?.dislikes?.includes(userId) || localReaction === 'dislike') {
        // Remove dislike
        if (currentUser) {
          await updateDoc(episodeRef, {
            dislikes: arrayRemove(userId),
          });
        } else {
          localStorage.removeItem(storageKey);
          setUserReaction(null);
        }
      } else {
        // Dislike and remove from likes if present
        if (currentUser) {
          await updateDoc(episodeRef, {
            dislikes: arrayUnion(userId),
            likes: arrayRemove(userId),
          });
        } else {
          localStorage.setItem(storageKey, 'dislike');
          setUserReaction('dislike');
        }
      }
    } catch (error) {
      console.error('Failed to dislike episode:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!episode || !story) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Episode not found</p>
          <Link to="/real-stories" className="mt-4 inline-block text-brand-600 hover:text-brand-700">
            Back to ހަޤީޤީ ހާދިސާ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#caf0f8] pb-24">
      <PromoBanner location="real-story-episode" position="top" />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        {/* Back Button */}
        <Link
          to={`/real-stories/${slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Story</span>
        </Link>

        {/* Episode Header */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="relative aspect-video">
            <img
              src={episode.image || story.coverImage}
              alt={episode.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-lg">
                {episode.episodeNumber}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{episode.title}</h1>
              <button
                onClick={handleShare}
                className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-600"
                title="Share episode"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">From: {story.title}</p>
            {story.author && (
              <p className="mt-1 text-sm text-gray-500">by {story.author}</p>
            )}
            {/* Social Media Links */}
            {(episode.youtubeLink || episode.tiktokLink || story.youtubeLink || story.tiktokLink) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(episode.youtubeLink || story.youtubeLink) && (
                  <a
                    href={episode.youtubeLink || story.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                )}
                {(episode.tiktokLink || story.tiktokLink) && (
                  <a
                    href={episode.tiktokLink || story.tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray- border border-gray-700"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    TikTok
                  </a>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 text-sm transition rounded-lg px-3 py-2 ${
                    episode.likes?.includes(currentUser?.uid) || userReaction === 'like' ? 'bg-brand-100 text-brand-600' : 'text-gray-500 hover:bg-gray-100 hover:text-brand-600'
                  }`}
                >
                  <span className="text-lg">😊</span>
                  <span>{episode.likes?.length || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1 text-sm transition rounded-lg px-3 py-2 ${
                    episode.dislikes?.includes(currentUser?.uid) || userReaction === 'dislike' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100 hover:text-rose-600'
                  }`}
                >
                  <span className="text-lg">😞</span>
                  <span>{episode.dislikes?.length || 0}</span>
                </button>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{episode.viewCount || 0} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Episode Content */}
        <div className="mt-6 sm:mt-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="prose prose-sm max-w-none text-gray-700">
            {episode.content.split('\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-4' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Middle Promo Banner */}
        <PromoBanner location="real-story-episode" position="middle" />

        {/* Social Media Links */}
        {(episode.youtubeLink || episode.tiktokLink || story.youtubeLink || story.tiktokLink) && (
          <div className="mt-6 sm:mt-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">މީގެ އިގިރޭސި ބައި ތިރީ ގައިވާ އަޅުގަނޑުމެންގެ ޓިކް ޓޮކް އަދި ޔޫޓިއުބް ޗެނަލް އިން ބަލާ ލެވޭނެއެވެ.</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(episode.youtubeLink || story.youtubeLink) && (
                <a
                  href={episode.youtubeLink || story.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              )}
              {(episode.tiktokLink || story.tiktokLink) && (
                <a
                  href={episode.tiktokLink || story.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray- border border-gray-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  TikTok
                </a>
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-6 sm:mt-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Comments ({comments.length})</h3>
          
          {/* Add Comment */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 sm:px-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="rounded-xl bg-brand-500 px-3 py-2 text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="mt-6 space-y-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-semibold text-sm">
                        {comment.userName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span className="font-semibold text-gray-900">{comment.userName}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt?.toDate?.() ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <PromoBanner location="real-story-episode" position="bottom" />
    </div>
  );
}
