import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
  <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg p-4 z-50">

      <div className="container mx-auto flex justify-between items-center">
        
        <div className="text-2xl font-bold text-white tracking-wide cursor-pointer">
          Infotact
        </div>

        
        <div className="flex items-center space-x-3">
          <Link to="/" className="px-4 py-2 rounded-md text-white font-medium hover:bg-white hover:text-blue-600 transition duration-300">
            Home
          </Link>

          {user ? (
            <Link to="/workspace" className="px-4 py-2 rounded-md text-white font-medium hover:bg-white hover:text-blue-600 transition duration-300">
              Workspace
            </Link>

          ) : (

            <span
              className="px-4 py-2 rounded-md text-gray-200 cursor-not-allowed"
              title="Login to access Workspace">
              Workspace
            </span>

          )}

          {!user && (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md text-white font-medium hover:bg-white hover:text-blue-600 transition duration-300">
                Login
              </Link>

              <Link to="/signup" className="px-4 py-2 rounded-md text-white font-medium hover:bg-white hover:text-blue-600 transition duration-300">
                Signup
              </Link>

            </>
          )}

          {user && (

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition duration-300">
              Logout
            </button>

          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
