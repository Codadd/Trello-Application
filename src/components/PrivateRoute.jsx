import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {

  const { currentUser, loading } = useAuth();
  const location = useLocation();


  // Modern Trello-style loader
  if (loading) {

    return (

      <div className="
        min-h-screen
        flex items-center justify-center

        bg-gradient-to-br
        from-slate-50
        via-indigo-50
        to-blue-100
      ">

        <div className="
          flex flex-col items-center gap-4
        ">

          {/* Spinner */}
          <div className="
            w-12 h-12

            border-4
            border-indigo-200
            border-t-indigo-600

            rounded-full

            animate-spin
          "></div>


          {/* Text */}
          <p className="
            text-sm
            text-gray-600
            font-medium
          ">
            Loading workspace...
          </p>

        </div>

      </div>

    );

  }


  // Redirect if not logged in
  if (!currentUser) {

    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );

  }


  // Allow access
  return children;

}