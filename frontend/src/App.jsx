import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import LecturePage from './pages/LecturePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'student', 'ta']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'student', 'ta']} />}>
            <Route path="/courses/:id" element={<CoursePage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'student', 'ta']} />}>
            <Route path="/lectures/:id" element={<LecturePage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
  );
}
