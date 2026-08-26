import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

interface Story {
  id: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: any;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const storiesQuery = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(storiesQuery);
        const storiesData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setStories(storiesData);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#caf0f8] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ސްޓޯރީތައް (Stories)</h1>
          <p className="mt-2 text-gray-600">Read your favorite stories with multiple episodes</p>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No stories available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      story.status === 'upcoming' ? 'bg-amber-500 text-white' :
                      story.status === 'ongoing' ? 'bg-emerald-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {story.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition">
                    {story.title}
                  </h3>
                  {story.author && (
                    <p className="mt-1 text-sm text-gray-500">by {story.author}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{story.description}</p>
                  <div className="mt-4 flex items-center text-sm text-brand-600 font-semibold">
                    <span>Read Episodes</span>
                    <svg className="ml-1 h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
