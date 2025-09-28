import { useState, useEffect, useCallback } from 'react';
import { lecturesApi } from '../api/lectures';
import { useAuth } from '../context/AuthContext';

export function useLecture(courseId) {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLectures = useCallback(async () => {
    if (!courseId || !user) return;
    try {
      setLoading(true);
      const data = await lecturesApi.getLecturesByCourse(courseId);
      
      const now = new Date();
      const lecturesWithStatus = data.map(lecture => {
        const start = new Date(lecture.startTime);
        const end = new Date(lecture.endTime);
        let status = 'upcoming';
        
        if (now >= start && now <= end) {
          status = 'live';
        } else if (now > end) {
          status = 'completed';
        }
        
        return { ...lecture, status };
      });
      
      setLectures(lecturesWithStatus);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch lectures:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  return { lectures, loading, error, refetch: fetchLectures };
}
