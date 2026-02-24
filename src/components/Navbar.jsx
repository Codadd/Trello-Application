import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    
  <nav className="
    sticky top-0 z-50
    bg-white/80 backdrop-blur-md
    border-b border-gray-200
  ">
    
    <div className="
      flex items-center justify-between

      h-14

      px-4 lg:px-6

      w-full
    ">

      {/* LEFT */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">

        {/* Logo */}
        <Link
          to="/"
          className="
          flex items-center gap-1.5 sm:gap-2
          px-2 py-1.5
          rounded-lg
          hover:bg-gray-100
          transition
          flex-shrink-0
          "
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 3h6v6H3V3zm0 8h6v10H3V11zm8-8h10v10H11V3zm0 12h10v6H11v-6z"/>
          </svg>

          <span className="
            font-bold text-sm sm:text-base
            bg-gradient-to-r from-indigo-600 to-purple-600
            bg-clip-text text-transparent
            hidden sm:inline
          ">
            Trello Clone
          </span>
        </Link>


        {/* Workspace */}
        {currentUser && (

          <div className="relative">

            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="
              flex items-center gap-1
              px-3 py-1.5
              rounded-lg
              hover:bg-gray-100
              text-sm font-medium
              text-gray-700
              "
            >
              Workspace
              <svg className="w-4 h-4">
                <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>


            {showWorkspaceMenu && (
              <div className="
                absolute top-full left-0 mt-1
                w-56
                bg-white
                border border-gray-200
                rounded-xl
                shadow-lg
                py-2
              ">

                <div className="px-3 py-2 border-b text-sm">
                  <div className="text-gray-400 text-xs">Workspace</div>
                  <div className="font-semibold">My Workspace</div>
                </div>

                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                  Create Workspace
                </button>

                <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                  Settings
                </button>

              </div>
            )}

          </div>

        )}

      </div>


      {/* CENTER SEARCH */}
      {currentUser && (

        <div className="
          flex-1
          flex justify-center
          px-4
        ">

          <form
            onSubmit={handleSearch}
            className="
              relative
              w-full
              max-w-md
            "
          >

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="
                w-full
                bg-gray-100 hover:bg-gray-200
                focus:bg-white

                rounded-lg

                pl-10 pr-4 py-2

                text-sm

                border border-transparent
                focus:border-indigo-300

                focus:ring-2 focus:ring-indigo-200

                outline-none
              "
            />

            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>

          </form>

        </div>

      )}


      {/* RIGHT */}
      <div className="
        flex items-center gap-2 sm:gap-3
        justify-end
        flex-shrink-0
      ">

        {currentUser ? (

          <>
            <div className="flex items-center gap-1 sm:gap-2">

              {currentUser.photoURL ? (

                <img
                  src={currentUser.photoURL}
                  className="
                    w-7 h-7 sm:w-8 sm:h-8
                    rounded-full
                    border border-gray-200
                  "
                />

              ) : (

                <div className="
                  w-7 h-7 sm:w-8 sm:h-8
                  rounded-full
                  bg-indigo-500
                  text-white
                  flex items-center justify-center
                  text-xs sm:text-sm font-semibold
                ">
                  {currentUser.displayName?.[0] || "U"}
                </div>

              )}

              <span className="
                text-xs sm:text-sm
                font-medium
                text-gray-700
                hidden md:block
              ">
                {currentUser.displayName || currentUser.email}
              </span>

            </div>


            <button
              onClick={handleLogout}
              className="
                text-xs sm:text-sm
                px-2 sm:px-3 py-1.5
                rounded-lg
                hover:bg-gray-100
                text-gray-600
              "
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">✕</span>
            </button>

          </>

        ) : (

          <Link
            to="/login"
            className="
              bg-indigo-600 hover:bg-indigo-700
              text-white
              px-3 sm:px-4 py-1.5 sm:py-2
              rounded-lg
              text-xs sm:text-sm font-semibold
            "
          >
            Sign In
          </Link>

        )}

      </div>

    </div>

  </nav>
);
}

