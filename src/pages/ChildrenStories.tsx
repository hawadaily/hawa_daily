import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

interface Story {
  id: string;
  slug: string;
  title: string;
  description: string;
  author?: string;
  coverImage: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  releaseDate?: string;
  locked?: boolean;
  createdAt: any;
}

export default function ChildrenStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const storiesQuery = query(collection(db, 'children-stories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(storiesQuery);
        const storiesData = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
        setStories(storiesData);
      } catch (error) {
        console.error('Failed to load children stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, []);

  // Update meta tags for social sharing
  useEffect(() => {
    document.title = 'ހަޤީޤީ ވާހަކަ | ހަވާ ޑެއިލީ';

    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateMetaTagName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('og:title', 'ހަޤީޤީ ވާހަކަ | ހަވާ ޑެއިލީ');
    updateMetaTag('og:description', 'ކުޑަކުދިންނަށް ޚިޔާވާ ވާހަކަތައް - Children stories in Dhivehi');
    updateMetaTag('og:image', 'https://www.hawadaily.com/og-image.jpg');
    updateMetaTag('og:url', window.location.href);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'ހަވާ ޑެއިލީ');
    
    updateMetaTagName('twitter:card', 'summary_large_image');
    updateMetaTagName('twitter:title', 'ހަޤީޤީ ވާހަކަ | ހަވާ ޑެއިލީ');
    updateMetaTagName('twitter:description', 'ކުޑަކުދިންނަށް ޚިޔާވާ ވާހަކަތައް - Children stories in Dhivehi');
    updateMetaTagName('twitter:image', 'https://www.hawadaily.com/og-image.jpg');

    return () => {
      const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
      metaTags.forEach((tag) => tag.remove());
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading children stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#caf0f8] pb-24">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ހަޤީޤީ ވާހަކަ (Children Stories)</h1>
          <p className="mt-2 text-gray-600">Fun and educational stories for children</p>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No children stories available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {story.locked && (
                      <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                        🔒 Locked
                      </span>
                    )}
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
                  {story.releaseDate && (
                    <p className="mt-2 text-sm text-gray-500">
                      📅 Release: {new Date(story.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                  {story.locked ? (
                    <div className="mt-4 flex items-center text-sm text-rose-600 font-semibold">
                      <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Coming Soon</span>
                    </div>
                  ) : (
                    <Link
                      to={`/children-stories/${story.slug}`}
                      className="mt-4 flex items-center text-sm text-brand-600 font-semibold"
                    >
                      <span>Read Episodes</span>
                      <svg className="ml-1 h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
