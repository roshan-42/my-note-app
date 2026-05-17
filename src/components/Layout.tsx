import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import ThemePicker from './ThemePicker';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-0)] text-[var(--text-1)]">
      <nav className="border-b border-[var(--border)] bg-[var(--bg-1)]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--grad-1)] to-[var(--grad-2)] flex items-center justify-center shadow-lg shadow-[var(--accent-soft)]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-tight tracking-tight">NotesNepal</h1>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)]">Academic Library</p>
            </div>
            <h1 className="sm:hidden text-base font-bold">NotesNepal</h1>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/" current={location.pathname === '/'}>Home</NavLink>
            <NavLink to="/faculties" current={location.pathname.startsWith('/faculty')}>Faculties</NavLink>
            <NavLink to="/about" current={location.pathname === '/about'}>About</NavLink>
          </div>

          <div className="flex items-center gap-2">
            <ThemePicker />
            <Link
              to={isAdmin ? '/' : '/admin'}
              className="hidden sm:inline-flex text-sm px-4 py-2 rounded-lg bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] transition-colors border border-[var(--accent-ring)] font-medium"
            >
              {isAdmin ? 'Exit Admin' : 'Admin'}
            </Link>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-[var(--border)] bg-[var(--bg-1)]"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                <MobileLink to="/">Home</MobileLink>
                <MobileLink to="/faculties">Faculties</MobileLink>
                <MobileLink to="/about">About</MobileLink>
                <MobileLink to={isAdmin ? '/' : '/admin'}>{isAdmin ? 'Exit Admin' : 'Admin'}</MobileLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function NavLink({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
        current
          ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
          : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)]'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-3 rounded-lg text-base font-medium text-[var(--text-2)] hover:text-[var(--accent)] hover:bg-[var(--surface-1)] transition-colors"
    >
      {children}
    </Link>
  );
}
