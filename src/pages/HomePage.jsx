import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ArrowPathIcon,
  ListBulletIcon,
  SparklesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

function HomePage() {
  const features = [
    { title: 'Manager Profiles', desc: 'Stats, rivalries, and win/loss records.', icon: UserGroupIcon, href: '/managers' },
    { title: 'Matchups', desc: 'Relive epic showdowns.', icon: ArrowPathIcon, href: '/matchups' },
    { title: 'Seasons', desc: 'Year-by-year rankings and stories.', icon: CalendarDaysIcon, href: '/seasons' },
    { title: 'Fun Records', desc: 'Streaks, high scores, and chaos.', icon: SparklesIcon, href: '/records' },
  ];

  return (
    <div className="font-inter min-h-screen bg-gradient-to-b from-black via-primary to-secondary text-white p-6">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold text-accent mb-2">NooKs Fantasy Football League Stats</h1>
        <p className="text-gray-400">Explore 14 seasons of rivalries, upsets, and legends</p>
      </header>

      <h2 className="text-2xl font-semibold text-center text-accent mb-6">Explore Your League</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map(({ title, desc, icon: Icon, href }) => (
          <Link
            key={title}
            to={href}
            className="group block bg-secondary rounded-xl p-6 shadow hover:shadow-2xl hover:scale-105 hover:brightness-110 transition-all duration-300"
          >
            <Icon className="h-8 w-8 text-accent mb-3 transform transition-transform duration-300 group-hover:scale-125" />
            <h2 className="text-xl font-semibold text-accent mb-2">{title}</h2>
            <p className="text-gray-300">{desc}</p>
          </Link>
        ))}
      </div>

      <footer className="text-center text-sm mt-16 text-gray-500 border-t border-gray-700 pt-6">
        Built with ❤️
      </footer>
    </div>
  );
}

export default HomePage;