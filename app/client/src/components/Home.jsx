import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User, ArrowRight, Sparkles, Users, Check, CheckSquare } from 'lucide-react';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('userData from localStorage:', userData); // Debug log
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser); // Debug log
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Optionally clear invalid data
        localStorage.removeItem('user');
      }
    } else {
      console.log('No user data found in localStorage'); // Debug log
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    setDropdownOpen(false);
    // Stay on homepage after logout
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center border-b">
      <div className="flex items-center gap-2 bg-white rounded-full py-3 px-5 shadow-md max-w-md">
      <div className="flex items-center justify-center">
        <CheckSquare className="w-6 h-6 text-purple-600" />
      </div>
      <span className="font-bold text-xl">BoardSync</span>
      <span className="text-sm text-gray-600 pl-1 border-l border-gray-200 ml-1">
        The everything app, for work.
      </span>
    </div>
        
        <div className="flex items-center gap-4">
          {!loading && (user ? (
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  {user.name ? user.name.charAt(0) : <User size={16} />}
                </div>
                <span className="hidden sm:inline">{user.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <Link
                    to="/whiteboards"
                    className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" />
                    <span>My Whiteboards</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex border border-gray-200 shadow-md rounded-md py-2 bg-white">
  <div className="m-1">
    <Link 
      to="/login" 
      className="px-3 py-3 text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-300 font-medium text-center rounded-md"
    >
      Log In
    </Link>
  </div>
  <div className="m-1">
    <Link 
      to="/signup" 
      className="px-3 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 transition-colors duration-300 font-medium text-center rounded-md"
    >
      Sign Up
    </Link>
  </div>
</div>



          ))}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium mb-6">
                <Sparkles size={16} />
                <span>All-new AI-powered collaboration</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Visual Collaboration<br/>
                for Fast-Moving<br/>
                Teams
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Part of the Everything App for Work: The world's only virtual
                whiteboard that turns ideas into coordinated actions—and
                connects them to the rest of your work, from tasks to docs to
                chat.
              </p>
              <div className="flex flex-wrap gap-4">
                {!loading && (!user ? (
                  <Link 
                    to="/signup" 
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 font-medium flex items-center rounded-full transition-colors duration-300"

                  >
                    Get Started. It's FREE
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                ) : (
                  <Link 
                    to="/whiteboards" 
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 font-medium flex items-center rounded-full transition-colors duration-300"
                  >
                    Go to My Whiteboards
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                ))}
                <div className="text-sm text-gray-600 flex flex-col justify-center">
                  <div className="flex items-center gap-1">
                    <Check size={14} className="text-green-500" />
                    Free Forever.
                  </div>
                  <div className="flex items-center gap-1">
                    <Check size={14} className="text-green-500" />
                    No Credit Card.
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-gradient-to-br from-purple-400/30 to-blue-400/30 absolute top-0 right-0 w-full h-full rounded-xl blur-xl"></div>
              <div className="relative bg-white rounded-xl shadow-xl p-4 border transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="bg-gray-100 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current">
                        <path d="M21 2H3a1 1 0 00-1 1v18a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zm-1 18H4V4h16v16z"></path>
                      </svg>
                      <span>Whiteboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                        JD
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        ST
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                        +3
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <Sparkles size={14} />
                      <span>BoardSync AI</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 relative">
                    {/* Sample whiteboard content with improved visualization */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-200 p-3 rounded shadow-sm">
                        <div className="font-medium text-sm">AI-Powered Diagramming</div>
                      </div>
                      <div className="bg-yellow-200 p-3 rounded shadow-sm col-start-3">
                        <div className="font-medium text-sm">Real-time Collaboration</div>
                      </div>
                      <div className="bg-blue-200 p-3 rounded shadow-sm col-start-2 row-start-2">
                        <div className="font-medium text-sm">Smart Workflows</div>
                      </div>
                      <div className="bg-purple-200 p-3 rounded shadow-sm col-start-3 row-start-2">
                        <div className="font-medium text-sm">Advanced Analytics</div>
                      </div>
                      
                      {/* Connection lines */}
                      <div className="absolute left-[45%] top-[30%] w-[15%] h-[2px] bg-gray-300 rotate-45"></div>
                      <div className="absolute left-[55%] top-[48%] w-[15%] h-[2px] bg-gray-300"></div>
                      <div className="absolute left-[28%] top-[50%] w-[15%] h-[2px] bg-gray-300 rotate-45"></div>
                    </div>
                    
                    {/* Toolbar */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow border flex items-center gap-1">
                      {['pointer', 'hand', 'task', 'arrow', 'circle', 'upload', 'text', 'folder', 'image'].map((tool, index) => (
                        <div key={index} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-sm">
                          <div className={`w-5 h-5 rounded-sm ${index === 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Teams Choose BoardSync</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlock the power of visual collaboration with our all-in-one platform designed for modern teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Workflows</h3>
              <p className="text-gray-600">
                Let AI do the heavy lifting by automatically organizing your ideas into structured workflows.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Collaboration</h3>
              <p className="text-gray-600">
                Work together in real-time with your team, no matter where they are located.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Integration</h3>
              <p className="text-gray-600">
                Connect with your favorite tools and services to streamline your workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-8 font-medium">Trusted by the world's leading businesses</p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center">
        <CheckSquare className="w-6 h-6 text-purple-600" />
      </div>
      <span className="font-bold text-xl">BoardSync</span>
              </div>
              <p className="text-gray-400">The everything app for work.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 BoardSync. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;