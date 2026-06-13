'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, UtensilsCrossed, TrendingUp, Calendar, LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/workout', label: 'ワークアウト', icon: Dumbbell },
  { href: '/meal', label: '食事管理', icon: UtensilsCrossed },
  { href: '/body', label: '体型トラッキング', icon: TrendingUp },
  { href: '/plan', label: 'トレーニングプラン', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-blue-400" size={28} />
          <span className="text-white font-bold text-xl">FitTracker</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
