import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type BottomNavProps = {
  links: { label: string; path: string; icon?: LucideIcon }[];
  activePath: string;
};

export default function BottomNav({ links, activePath }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-[#90e0ef] bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-5xl justify-between px-4 py-3 text-[#0077b6]">
        {links.map((link) => {
          const active = activePath === link.path;
          const Icon = link.icon;
          return (
            <Link key={link.path} to={link.path} className="group flex flex-col items-center gap-1 text-[11px] font-semibold transition">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl transition ${active ? 'bg-[#0077b6] text-white shadow-soft' : 'bg-[#caf0f8]/50 text-[#00b4d8] hover:bg-[#caf0f8]'}`}>
                {Icon ? <Icon className="w-5 h-5" /> : link.label.slice(0, 2)}
              </span>
              <span className={active ? 'text-[#0077b6]' : 'text-[#00b4d8]'}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
