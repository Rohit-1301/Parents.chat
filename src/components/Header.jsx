import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ darkMode, onToggleDarkMode }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={`border-b ${darkMode ? 'border-neutral-700 bg-neutral-900' : 'border-gray-200 bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`text-xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>parents</span>
            <span className="text-primary font-bold text-xl">.chat</span>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle dark mode"
              className={`p-2 rounded-full border transition-colors duration-200 ${darkMode ? 'border-neutral-600 bg-neutral-900 text-yellow-300 hover:bg-neutral-800' : 'border-gray-300 bg-white text-neutral-700 hover:bg-gray-100'}`}
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className={`px-5 py-2 rounded font-medium transition-colors duration-200 ${darkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signup')}
                  className={`px-5 py-2 rounded border font-medium transition-colors duration-200 ${darkMode ? 'border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800' : 'border-gray-300 bg-white text-neutral-800 hover:bg-gray-100'}`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className={`px-5 py-2 rounded font-medium transition-colors duration-200 ${darkMode ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-primary text-white hover:bg-primary-dark'}`}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;