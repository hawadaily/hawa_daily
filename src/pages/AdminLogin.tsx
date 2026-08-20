import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setMessage('އެއްޗާ ހިތާ އައްޔާ ބުރި ނުވާ.');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft text-right">
        <h2 className="text-2xl font-semibold text-slate-900">ސްލޯއެޑުން...</h2>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <motion.div className="space-y-8 text-right" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">Admin Login</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">އެޑްމިން އިންޓްރީ</h2>
          </div>
        </div>
        {message && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
            {message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <h3 className="text-2xl font-bold text-slate-900">އެޑްމިން ސިނިކުރުވި</h3>
        <p className="mt-2 text-sm text-slate-500">ކުރިއަށް އެޑްމިން ހުންނަން އެންމެ ސެޓިންގު އިތުރުވިއްޖެ.</p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">އީމޭލް</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">ޕާސްވޯޑް</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            ސިނިކުރުވި
          </button>
        </form>
      </div>
    </motion.div>
  );
}
