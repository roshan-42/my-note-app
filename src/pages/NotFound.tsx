import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <p className="font-display text-7xl font-bold gradient-text">404</p>
      <h1 className="font-display text-3xl font-bold mt-4">Page not found</h1>
      <p className="text-[var(--text-3)] mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors">
        <Home className="w-4 h-4" /> Go home
      </Link>
    </div>
  );
}
