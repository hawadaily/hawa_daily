import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  content: string;
  episodeNumber: number;
  createdAt: any;
}

interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: any;
}

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Failed to load story data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoryData();
  }, [id]);

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
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-lg">
                        {episode.episodeNumber}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{episode.title}</h3>
                      <div className="mt-3 prose prose-sm max-w-none text-gray-700">
                        {episode.content.split('\n').map((paragraph, index) => (
                          <p key={index} className={index > 0 ? 'mt-2' : ''}>
                            {paragraph}
                          </p>
                        ))}
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
