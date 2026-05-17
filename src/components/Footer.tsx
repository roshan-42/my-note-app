import { Link } from 'react-router-dom';
import { GraduationCap, Globe, Mail, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-1)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--grad-1)] to-[var(--grad-2)] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">NotesNepal</span>
          </div>
          <p className="text-sm text-[var(--text-3)] leading-relaxed">
            Bilingual academic notes & exam questions for Nepal's university curriculum.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[var(--text-3)] font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-[var(--text-2)] hover:text-[var(--accent)]">Home</Link></li>
            <li><Link to="/faculties" className="text-[var(--text-2)] hover:text-[var(--accent)]">Faculties</Link></li>
            <li><Link to="/about" className="text-[var(--text-2)] hover:text-[var(--accent)]">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[var(--text-3)] font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-[var(--text-2)]">Past Papers</span></li>
            <li><span className="text-[var(--text-2)]">Study Notes</span></li>
            <li><span className="text-[var(--text-2)]">Possible Questions</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-[var(--text-3)] font-semibold mb-3">Connect</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Website" className="p-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--accent)]"><Globe className="w-4 h-4" /></a>
            <a href="#" aria-label="Telegram" className="p-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--accent)]"><Send className="w-4 h-4" /></a>
            <a href="mailto:hello@notesnepal" aria-label="Email" className="p-2 rounded-lg bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--accent)]"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--text-3)]">
          <span>© {new Date().getFullYear()} NotesNepal. Built for Nepal's students.</span>
          <span>Made with care · Bilingual EN / नेपाली</span>
        </div>
      </div>
    </footer>
  );
}
