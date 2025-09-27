import DashboardPage from './pages/DashboardPage';
import CoursePage from './pages/CoursePage';
import LecturePage from './pages/LecturePage';
import LoginPage from './pages/LoginPage';

export const routes = [
  { path: '/', element: <LoginPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/course/:courseId', element: <CoursePage /> },
  { path: '/course/:courseId/lecture/:lectureId', element: <LecturePage /> },
];
