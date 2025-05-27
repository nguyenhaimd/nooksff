import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  ListOrdered,
  Menu,
  CircleUser,
  ClipboardList,
  TrendingUp,
  FileBarChart2
} from 'lucide-react';

export default function Layout() {
  return (
    <div className="font-inter min-h-screen bg-primary text-white">
      <header className="bg-secondary px-6 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold text-accent">NooKs League</h1>
        </div>

        <nav className="space-x-4 flex items-center flex-wrap">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <Home className="h-4 w-4" /> Home
          </NavLink>

          <NavLink
            to="/managers"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <Users className="h-4 w-4" /> Managers
          </NavLink>

          <NavLink
            to="/matchups"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <ListOrdered className="h-4 w-4" /> Matchups
          </NavLink>

          {/* Drafts nav commented out */}
          {/*
          <NavLink
            to="/drafts"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <ClipboardList className="h-4 w-4" /> Drafts
          </NavLink>


          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <FileBarChart2 className="h-4 w-4" /> Transactions
          </NavLink>
          */}
          {/* 🔁 Replaced Standings with Seasons */}
          <NavLink
            to="/seasons"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <TrendingUp className="h-4 w-4" /> Seasons
          </NavLink>

          <NavLink
            to="/records"
            className={({ isActive }) =>
              isActive ? 'text-accent font-semibold flex items-center gap-1' : 'hover:text-accent flex items-center gap-1'
            }
          >
            <ListOrdered className="h-4 w-4" /> Records
          </NavLink>

          <div className="flex items-center gap-2 border-l border-gray-500 pl-4 ml-4">
            <CircleUser className="h-6 w-6 text-accent" />
            <span className="text-sm text-white">Guest</span>
          </div>
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>

      <footer className="text-center text-sm text-gray-500 border-t border-gray-700 py-6 mt-8">
        Built with ❤️
      </footer>
    </div>
  );
}