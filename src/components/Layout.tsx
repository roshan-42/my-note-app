import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 h-14">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">LLBNOTESNEPAL</h1>
          </Link>
          <Link to="/admin"
            className="text-sm px-4 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 transition-colors border border-amber-600/30">
            Admin
          </Link>
        </div>
      </nav>

      <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
