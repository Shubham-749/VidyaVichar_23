import { useState, useEffect } from 'react';
import { coursesApi } from '../api/courses';
import { useAuth } from '../context/AuthContext';

export function useCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await coursesApi.getAllCourses();
        setCourses(data);
      } catch (err) {
        setError(err);
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return { courses, loading, error };
}
