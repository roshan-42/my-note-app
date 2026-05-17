import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Year from './pages/Year';
import Subject from './pages/Subject';
import SubjectNotes from './pages/SubjectNotes';
import SubjectExams from './pages/SubjectExams';
import Admin from './pages/Admin';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/year/:year" element={<Year />} />
            <Route path="/year/:year/subject/:slug" element={<Subject />} />
            <Route path="/year/:year/subject/:slug/notes" element={<SubjectNotes />} />
            <Route path="/year/:year/subject/:slug/exams" element={<SubjectExams />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
