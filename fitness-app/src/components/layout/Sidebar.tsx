'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, TrendingUp, CalendarDays } from 'lucide-react';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/workout', label: 'ワークアウト', icon: Dumbbell },
  { href: '/meal', label: '食事管理', icon: UtensilsCrossed },
  { href: '/body', label: '体型トラッキング', icon: TrendingUp },
  { href: '/plan', label: 'トレーニングプラン', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Dumbbell className="text-orange-400" size={24} />
          FitTracker
        </h1>
        <p className="text-gray-400 text-xs mt-1">筋トレ・体づくりサポート</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
