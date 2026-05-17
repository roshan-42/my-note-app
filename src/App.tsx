import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Faculties from './pages/Faculties';
import Faculty from './pages/Faculty';
import Year from './pages/Year';
import Subject from './pages/Subject';
import SubjectNotes from './pages/SubjectNotes';
import SubjectExams from './pages/SubjectExams';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import AdminHome from './pages/admin/AdminHome';
import AdminFaculty from './pages/admin/AdminFaculty';
import AdminYear from './pages/admin/AdminYear';
import AdminSubject from './pages/admin/AdminSubject';
import AdminChapter from './pages/admin/AdminChapter';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/faculties" element={<Faculties />} />
              <Route path="/about" element={<About />} />
              <Route path="/faculty/:facSlug" element={<Faculty />} />
              <Route path="/faculty/:facSlug/year/:year" element={<Year />} />
              <Route path="/faculty/:facSlug/year/:year/:subjSlug" element={<Subject />} />
              <Route path="/faculty/:facSlug/year/:year/:subjSlug/notes" element={<SubjectNotes />} />
              <Route path="/faculty/:facSlug/year/:year/:subjSlug/notes/:chSlug" element={<SubjectNotes />} />
              <Route path="/faculty/:facSlug/year/:year/:subjSlug/exams" element={<SubjectExams />} />
              <Route path="/faculty/:facSlug/year/:year/:subjSlug/exams/:chSlug" element={<SubjectExams />} />

              <Route path="/admin" element={<Admin />}>
                <Route index element={<AdminHome />} />
                <Route path=":facSlug" element={<AdminFaculty />} />
                <Route path=":facSlug/year/:year" element={<AdminYear />} />
                <Route path=":facSlug/year/:year/:subjSlug" element={<AdminSubject />} />
                <Route path=":facSlug/year/:year/:subjSlug/:chSlug" element={<AdminChapter />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
