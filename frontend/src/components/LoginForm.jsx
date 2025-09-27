import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // <-- correct path

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter credentials');
    
    let role = 'student';
    if (email.includes('teacher')) role = 'teacher';
    else if (email.includes('ta')) role = 'ta';

    login({ email, role });
    navigate('/dashboard');
  };

  return (
    <form className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md mx-auto mt-20" onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
      />
      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all">
        Login
      </button>
    </form>
  );
}
