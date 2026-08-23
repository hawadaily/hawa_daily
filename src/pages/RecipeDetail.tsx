import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IMAGE_FALLBACK } from '../utils/imageFallback';
import { db } from '../firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, orderBy, addDoc, serverTimestamp, increment } from 'firebase/firestore';

interface Recipe {
  id: string;
  titleDv: string;
  titleEn: string;
  image: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: {
    dv: string[];
    en: string[];
  };
  instructions: {
    dv: string;
    en: string;
  };
}

interface Comment {
  id: string;
  recipeId: string;
  text: string;
  timestamp: any;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [language, setLanguage] = useState<'dv' | 'en'>('dv');
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
        // Try to load from JSON files
        const jsonFiles = [
          '../data/lonumedhu-recipes.json',
          '../data/hedhikaa-recipes.json',
          '../data/nadiyaskitchen-recipes.json'
        ];
        
        for (const jsonFile of jsonFiles) {
          try {
            const recipesData = await import(jsonFile);
            const recipes = recipesData.default as Recipe[];
            const foundRecipe = recipes.find(r => r.id === id);
            if (foundRecipe) {
              setRecipe(foundRecipe);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Continue to next file
            continue;
          }
        }
        
        // If not found in JSON files, try Firebase
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          setRecipe(recipeDoc.data() as Recipe);
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReactions = async () => {
      if (!id) return;
      try {
        const reactionsDoc = await getDoc(doc(db, 'recipe-reactions', id));
        if (reactionsDoc.exists()) {
          const data = reactionsDoc.data();
          setLikes(data.likes || 0);
          setDislikes(data.dislikes || 0);
        }
        
        // Check user's reaction
        const userId = localStorage.getItem('visitorId');
        if (userId) {
          const userReactionDoc = await getDoc(doc(db, 'recipe-user-reactions', `${id}_${userId}`));
          if (userReactionDoc.exists()) {
            setUserReaction(userReactionDoc.data().reaction);
          }
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    const fetchComments = async () => {
      if (!id) return;
      try {
        const commentsQuery = query(
          collection(db, 'recipe-comments'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(commentsQuery);
        const commentsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Comment))
          .filter(comment => comment.recipeId === id);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchRecipe();
    fetchReactions();
    fetchComments();
  }, [id]);

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!id) return;
    const userId = localStorage.getItem('visitorId');
    if (!userId) {
      alert(language === 'dv' ? 'ކުރެއްވުމަށް ލޮގިން ކުރައްވާ' : 'Please login to react');
      return;
    }

    try {
      // Update user's reaction
      await setDoc(doc(db, 'recipe-user-reactions', `${id}_${userId}`), {
        recipeId: id,
        userId,
        reaction,
        timestamp: serverTimestamp()
      });

      // Update counts
      const reactionsRef = doc(db, 'recipe-reactions', id);
      if (userReaction === reaction) {
        // Remove reaction
        await setDoc(reactionsRef, {
          likes: increment(-1),
          dislikes: increment(-1)
        }, { merge: true });
        setUserReaction(null);
        setLikes(prev => prev - 1);
        setDislikes(prev => prev - 1);
      } else if (userReaction) {
        // Change reaction
        const incrementValue = reaction === 'like' ? 1 : -1;
        await setDoc(reactionsRef, {
          likes: increment(incrementValue),
          dislikes: increment(-incrementValue)
        }, { merge: true });
        setUserReaction(reaction);
        if (reaction === 'like') {
          setLikes(prev => prev + 1);
          setDislikes(prev => prev - 1);
        } else {
          setLikes(prev => prev - 1);
          setDislikes(prev => prev + 1);
        }
      } else {
        // New reaction
        if (reaction === 'like') {
          await setDoc(reactionsRef, {
            likes: increment(1)
          }, { merge: true });
          setLikes(prev => prev + 1);
        } else {
          await setDoc(reactionsRef, {
            dislikes: increment(1)
          }, { merge: true });
          setDislikes(prev => prev + 1);
        }
        setUserReaction(reaction);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      await addDoc(collection(db, 'recipe-comments'), {
        recipeId: id,
        text: newComment.trim(),
        timestamp: serverTimestamp()
      });
      setNewComment('');
      // Refresh comments
      const commentsQuery = query(
        collection(db, 'recipe-comments'),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(commentsQuery);
      const commentsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Comment))
        .filter(comment => comment.recipeId === id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!recipe) return;
    
    const title = language === 'dv' ? recipe.titleDv : recipe.titleEn;
    const instructions = language === 'dv' ? recipe.instructions.dv : recipe.instructions.en;
    const ingredients = language === 'dv' ? recipe.ingredients.dv : recipe.ingredients.en;
    const shareUrl = window.location.href;
    const shareText = `${title}\n\n${language === 'dv' ? 'ތަކެތި:' : 'Ingredients:'}\n${ingredients.slice(0, 3).join('\n')}\n\n${language === 'dv' ? 'ހެދުމުގެ ގޮތް:' : 'Instructions:'}\n${instructions.substring(0, 200)}...`;
    
    let shareUrlFinal = '';
    
    switch (platform) {
      case 'facebook':
        shareUrlFinal = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrlFinal = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'viber':
        shareUrlFinal = `viber://forward?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
        alert(language === 'dv' ? 'ރެސިޕީ ކޮޕީ ކުރެވިއްޖެ! އިންސްޓަގްރާމްގައި ޕޭސްޓް ކުރޭ' : 'Recipe copied! Paste it in Instagram');
        return;
      default:
        return;
    }
    
    window.open(shareUrlFinal, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    if (!recipe) return;
    const recipeUrl = window.location.href;
    navigator.clipboard.writeText(recipeUrl);
    alert(language === 'dv' ? 'ރެސިޕީ ލިންކް ކޮޕީ ކުރެވިއްޖެ!' : 'Recipe link copied!');
  };

  if (loading) {
    return (
      <motion.section
        className="pt-24 bg-[#caf0f8] min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        dir={language === 'dv' ? 'rtl' : 'ltr'}
      >
        <div className="text-center py-12">
          <p className="text-xl text-[#005f73]">{language === 'dv' ? 'ލޯޑް ކުރަމުން...' : 'Loading...'}</p>
        </div>
      </motion.section>
    );
  }

  if (!recipe) {
    return (
      <motion.section
        className="pt-24 bg-[#caf0f8] min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        dir={language === 'dv' ? 'rtl' : 'ltr'}
      >
        <div className="text-center py-12">
          <p className="text-xl text-[#005f73]">{language === 'dv' ? 'ރެސިޕީ ނެތް' : 'Recipe not found'}</p>
          <button
            onClick={() => navigate('/recipes')}
            className="mt-4 bg-[#0077b6] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005f73] transition"
          >
            {language === 'dv' ? 'ރެސިޕީތައް ބައްލަވާ' : 'View Recipes'}
          </button>
        </div>
      </motion.section>
    );
  }

  const title = language === 'dv' ? recipe.titleDv : recipe.titleEn;
  const instructions = language === 'dv' ? recipe.instructions.dv : recipe.instructions.en;
  const ingredients = language === 'dv' ? recipe.ingredients.dv : recipe.ingredients.en;

  const translations = {
    dv: {
      ingredients: 'ތަކެތި',
      instructions: 'ހެދުމުގެ ގޮތް',
      prepTime: 'ހެދުމުގެ ވަގުތު',
      cookTime: 'ފިއްޓުވަގުތު',
      servings: 'ބައިތައް',
      back: 'އެހެން ރެސިޕީތައް ބައްލަވާ',
      share: 'ޝެއާރު ކުރޭ',
      comments: 'ކޮމެންޓްތައް',
      addComment: 'ކޮމެންޓް އަހައްދަވާ',
      writeComment: 'ކޮމެންޓް ލިޔުމަށް...',
      noComments: 'ކޮމެންޓް ނެތް'
    },
    en: {
      ingredients: 'Ingredients',
      instructions: 'Instructions',
      prepTime: 'Prep Time',
      cookTime: 'Cook Time',
      servings: 'Servings',
      back: 'Back to Recipes',
      share: 'Share',
      comments: 'Comments',
      addComment: 'Add Comment',
      writeComment: 'Write a comment...',
      noComments: 'No comments yet'
    }
  };

  const t = translations[language];

  return (
    <motion.section
      className="pt-24 bg-[#caf0f8] min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      dir={language === 'dv' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes')}
          className="mb-4 inline-flex items-center gap-2 text-[#0077b6] font-bold hover:text-[#005f73] transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.back}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'dv' ? 'en' : 'dv')}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border-2 border-[#0077b6] bg-[#0077b6] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#005f73]"
        >
          {language === 'dv' ? 'EN' : 'ދިވެހި'}
        </button>

        {/* Recipe Image */}
        <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-6">
          <img
            src={recipe.image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = IMAGE_FALLBACK;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Logo */}
          <div className="absolute top-4 left-4">
            <img
              src="/HAWA LOGO.jpg"
              alt="Hawa Daily"
              className="h-12 w-auto"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              {title}
            </h1>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-3 py-1 text-sm font-bold text-[#0077b6]">
            {recipe.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-3 py-1 text-sm font-bold text-[#00b4d8]">
            {t.prepTime}: {recipe.prepTime}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#0077b6]/10 px-3 py-1 text-sm font-bold text-[#0077b6]">
            {t.cookTime}: {recipe.cookTime}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#00b4d8]/10 px-3 py-1 text-sm font-bold text-[#00b4d8]">
            {t.servings}: {recipe.servings}
          </span>
        </div>

        {/* Like/Dislike Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${
              userReaction === 'like' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-[#0077b6] border-2 border-[#0077b6] hover:bg-[#0077b6]/10'
            }`}
          >
            <span className="text-2xl">😊</span>
            <span>{likes}</span>
          </button>
          <button
            onClick={() => handleReaction('dislike')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition ${
              userReaction === 'dislike' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-[#0077b6] border-2 border-[#0077b6] hover:bg-[#0077b6]/10'
            }`}
          >
            <span className="text-2xl">😢</span>
            <span>{dislikes}</span>
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full bg-[#6b7280] text-white hover:bg-[#6b7280]/80 transition"
            title={language === 'dv' ? 'ލިންކް ކޮޕީ ކުރޭ' : 'Copy Link'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-2 rounded-full bg-[#1877f2] text-white hover:bg-[#1877f2]/80 transition"
            title="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="p-2 rounded-full bg-[#25d366] text-white hover:bg-[#25d366]/80 transition"
            title="WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
          <button
            onClick={() => handleShare('viber')}
            className="p-2 rounded-full bg-[#7360f2] text-white hover:bg-[#7360f2]/80 transition"
            title="Viber"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.398.002C9.473.028 5.331.344 3.024 2.467 1.303 4.173.693 6.729.626 9.965c-.067 3.236-.153 9.288 5.683 10.951h.005l-.004 2.488s-.039.998.622 1.202c.795.25 1.248-.511 2.008-1.329.413-.445.981-1.097 1.412-1.594 3.895.338 6.864-.417 7.202-.517.795-.258 5.279-.834 6.013-6.842.756-6.229-.367-10.182-2.4-11.964-.223-.197-1.649-1.348-5.341-1.418-.396-.008-.831-.012-1.284-.01zm.138 1.898c.393-.001.777.002 1.126.009 3.168.06 4.686.96 4.867 1.121 1.705 1.483 2.586 4.9 1.932 10.267-.529 4.353-3.733 4.877-4.401 5.098-.276.081-2.847.736-6.233.472 0 0-2.473 2.993-3.251 3.772-.123.123-.265.171-.36.154-.119-.022-.151-.154-.149-.356l.018-4.088c-4.919-1.361-4.632-6.336-4.578-9.015.054-2.68.546-4.848 1.98-6.259 1.925-1.771 5.598-2.039 7.25-2.045zm.072 2.927c-.063 0-.114.051-.114.114v4.288c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114V4.941c0-.063-.051-.114-.114-.114h-1.714zm4.286 0c-.063 0-.114.051-.114.114v2.571c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114V4.941c0-.063-.051-.114-.114-.114h-1.714zm-6.857 1.143c-.063 0-.114.051-.114.114v1.428c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114v-1.428c0-.063-.051-.114-.114-.114H9.837zm9.143 0c-.063 0-.114.051-.114.114v1.428c0 .063.051.114.114.114h1.714c.063 0 .114-.051.114-.114v-1.428c0-.063-.051-.114-.114-.114h-1.714z"/>
            </svg>
          </button>
          <button
            onClick={() => handleShare('instagram')}
            className="p-2 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white hover:opacity-80 transition"
            title="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-[#0077b6] mb-4">{t.ingredients}</h2>
          <ul className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-3 text-[#005f73]">
                <span className="text-[#0077b6] font-bold mt-1">•</span>
                <span className="text-lg">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-[#0077b6] mb-4">{t.instructions}</h2>
          <p className="text-[#005f73] leading-relaxed whitespace-pre-line text-lg">
            {instructions}
          </p>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#0077b6] mb-4">{t.comments} ({comments.length})</h2>
          
          {/* Add Comment Form */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.writeComment}
              className="w-full rounded-lg border-2 border-[#0077b6] bg-[#caf0f8] p-3 text-[#005f73] focus:border-[#005f73] focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleAddComment}
              disabled={commentLoading || !newComment.trim()}
              className="mt-2 bg-[#0077b6] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#005f73] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {commentLoading ? (language === 'dv' ? 'ލޯޑް ކުރަމުން...' : 'Loading...') : t.addComment}
            </button>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-[#005f73] text-center py-4">{t.noComments}</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-[#0077b6]/20 pb-4">
                  <p className="text-[#005f73]">{comment.text}</p>
                  <p className="text-xs text-[#0077b6] mt-2">
                    {comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleDateString() : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
