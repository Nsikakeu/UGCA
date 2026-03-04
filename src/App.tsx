import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Admissions = lazy(() => import('./pages/Admissions'));
const Contact = lazy(() => import('./pages/Contact'));
const Gallery = lazy(() => import('./pages/Gallery'));

// Lazy load portal pages
const PortalLogin = lazy(() => import('./pages/portal/Login'));
const StaffLogin = lazy(() => import('./pages/portal/StaffLogin'));
const StudentLogin = lazy(() => import('./pages/portal/StudentLogin'));
const CheckResult = lazy(() => import('./pages/portal/CheckResult'));
const SuperAdminDashboard = lazy(() => import('./pages/portal/SuperAdminDashboard'));
const AdminDashboard = lazy(() => import('./pages/portal/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/portal/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/portal/StudentDashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            {/* Fallback for 404 */}
            <Route path="*" element={<Home />} />
          </Route>
          
          {/* Portal Routes */}
          <Route path="/portal">
            <Route index element={<PortalLogin />} />
            <Route path="staff-login" element={<StaffLogin />} />
            <Route path="student-login" element={<StudentLogin />} />
            <Route path="check-result" element={<CheckResult />} />
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="student" element={<StudentDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
