import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { courses, loading, error } = useCourses();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load courses. Please try again later.</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.name || user?.email} <span className="text-blue-600">({user?.role})</span>
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => handleViewCourse(course._id)}
            />
          ))}
        </div>
      ) : (
        <p>You are not enrolled in any courses yet.</p>
      )}
    </div>
  );
}
