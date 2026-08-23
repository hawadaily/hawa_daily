import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/admin/news/add', label: 'ޚަބަރު އުފައްދާ' },
  { path: '/admin/news/manage', label: 'ޚަބަރު މެނޭޖް ކުރޭ' },
  { path: '/admin/banners/manage', label: 'ބެނަރު މެނޭޖް ކުރޭ' },
  { path: '/admin/search', label: 'ތަޙުލީލް' },
  { path: '/admin/settings', label: 'ސެޓިންގްސް' },
  { path: '/admin/news/rephrase', label: 'ޚަބަރު ރީފްރޭޒް' },
  { path: '/admin/post-launch', label: 'ވެބްސައިޓް ލާންޗް ކުރުމަށް ފަހު ކުރެވޭ ކަންތައްތައް' },
  { path: '/admin/job-flyers', label: 'ވަޒީފާ ފްލައިއަރުތައް' },
  { path: '/admin/cute-posters', label: 'ކޮޓް ޕޯސްޓަރުތައް' },
  { path: '/admin/facebook-rules', label: 'ފޭސްބުކް ރީލްސް' },
  { path: '/recipes/facebook-post', label: 'ރެސިޕީތައް' },
  { path: '/quran/facebook-post', label: 'ޤުރްއާން' },
];

const AdminNavbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-lg mr-8">
              ހަވާ ޑެއިލީ
            </Link>
            <div className="flex space-x-1 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    location.pathname === item.path
                      ? 'bg-sky-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
