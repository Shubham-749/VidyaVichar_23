import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Mock data
    const mockCourses = [
      { id: 1, name: 'Mathematics', description: 'Algebra & Calculus' },
      { id: 2, name: 'Physics', description: 'Mechanics & Optics' },
      { id: 3, name: 'Computer Science', description: 'Data Structures' },
    ];

    if (user?.role === 'teacher') {
      setCourses(mockCourses); // All courses as teacher
    } else if (user?.role === 'student') {
      setCourses(mockCourses.slice(0, 2)); // Only enrolled courses
    } else if (user?.role === 'ta') {
      setCourses(mockCourses.slice(1, 3)); // Assigned courses
    }
  }, [user]);

  return { courses };
}
