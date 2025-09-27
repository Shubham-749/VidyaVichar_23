import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useLecture(courseId) {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    // Mock lectures
    const mockLectures = [
      { id: 1, name: 'Lecture 1', status: 'completed' },
      { id: 2, name: 'Lecture 2', status: 'live' },
      { id: 3, name: 'Lecture 3', status: 'upcoming' },
    ];

    if (user?.role === 'teacher') {
      setLectures(mockLectures); // Teacher sees all lectures
    } else if (user?.role === 'student') {
      setLectures(mockLectures.filter(l => l.status === 'live')); // Student sees only live
    } else if (user?.role === 'ta') {
      setLectures(mockLectures.filter(l => l.status === 'completed')); // TA sees completed
    }
  }, [courseId, user]);

  return { lectures };
}
