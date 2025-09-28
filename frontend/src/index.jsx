import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import App from './App';
import './styles/index.css';

// Wrapper component to handle lectureId extraction
const AppWrapper = () => {
  const location = useLocation();
  const [lectureId, setLectureId] = useState(null);

  useEffect(() => {
    // Extract lectureId from URL path
    const pathParts = location.pathname.split('/');
    const lectureIndex = pathParts.indexOf('lectures');

    if (lectureIndex !== -1 && pathParts[lectureIndex + 1]) {
      setLectureId(pathParts[lectureIndex + 1]);
    } else {
      setLectureId(null);
    }
  }, [location.pathname]);

  return (
    <SocketProvider lectureId={lectureId}>
      <App />
    </SocketProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </BrowserRouter>
);
