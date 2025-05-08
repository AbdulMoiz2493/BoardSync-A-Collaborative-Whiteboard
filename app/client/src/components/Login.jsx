import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ExternalLink, CheckSquare, EyeOff, Eye } from 'lucide-react';
import dotenv from 'dotenv';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store the complete user object in localStorage
      const userObj = {
        id: data.userId,
        name: email.split('@')[0], // Use part of email as name or adjust as needed
        email: email
      };
      
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      navigate('/whiteboards');
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
          <span className="text-sm text-gray-600">Don't have an account?</span>
          <Link 
            to="/signup" 
            className="bg-purple-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Sign up
          </Link>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome back!</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          
          
          <form onSubmit={handleSubmit}>
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
                  placeholder="Enter your work email"
                  className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter password"
                  className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              Log In
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link to="/sso-login" className="text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1">
              or login with SSO
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-xs text-gray-500">
        <p>This site is protected by reCAPTCHA and the Google <a href="/privacy" className="text-purple-600">Privacy Policy</a> and <a href="/terms" className="text-purple-600">Terms of Service</a> apply.</p>
      </footer>
    </div>
  );
}

export default Login;