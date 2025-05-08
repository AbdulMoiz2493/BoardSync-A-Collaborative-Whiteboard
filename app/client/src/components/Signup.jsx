import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckSquare } from 'lucide-react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      localStorage.setItem('userId', data.userId);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-purple-600" />
          </div>
          <span className="font-bold text-xl">BoardSync</span>
          <span className="text-sm text-gray-600 pl-1 border-l border-gray-200 ml-1">
            The everything app for work.
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Already playing with BoardSync?</span>
          <Link 
            to="/login" 
            className="bg-purple-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Seconds to sign up!</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="full-name"
                  placeholder="John Doe"
                  className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="work-email" className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="work-email"
                  placeholder="example@site.com"
                  className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Choose Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Minimum 8 characters"
                  className="pl-10 pr-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md"
            >
              Play with BoardSync
            </button>
            
            <p className="mt-4 text-xs text-gray-500 text-center">
              By clicking the button above, you agree to our{' '}
              <Link to="/terms" className="text-purple-600 hover:text-purple-800">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-purple-600 hover:text-purple-800">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
      
      <footer className="py-4 text-center text-xs text-gray-500">
        <p className="mb-2">See why 3,000,000+ teams are more productive with BoardSync</p>
        <p>By clicking the button above, you agree to our <a href="/terms" className="text-purple-600">Terms of Service</a> and <a href="/privacy" className="text-purple-600">Privacy Policy</a>.</p>
      </footer>
    </div>
  );
}

export default Signup;