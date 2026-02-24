import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, currentUser } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';


  // safer redirect
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser]);


  async function handleGoogleSignIn() {

    try {

      setError('');
      setLoading(true);

      await signInWithGoogle();

    } catch (err) {

      setError('Failed to sign in. Please try again.');

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="
      min-h-screen

      flex items-center justify-center

      bg-gradient-to-br
      from-slate-50
      via-indigo-50
      to-blue-100

      px-4
    ">


      <div className="w-full max-w-md">


        {/* Card */}
        <div className="
          bg-white

          rounded-2xl

          shadow-lg

          border border-gray-200

          p-8
        ">


          {/* Logo */}
          <div className="text-center mb-6">

            <div className="
              w-14 h-14
              mx-auto
              mb-3

              rounded-xl

              bg-indigo-600

              flex items-center justify-center
            ">

              <svg
                className="w-7 h-7 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 3h6v6H3V3zm0 8h6v10H3V11zm8-8h10v10H11V3zm0 12h10v6H11v-6z"/>
              </svg>

            </div>


            <h1 className="
              text-2xl
              font-bold
              text-gray-800
            ">
              Trello Clone
            </h1>


            <p className="
              text-gray-500
              text-sm
              mt-1
            ">
              Sign in to continue
            </p>

          </div>



          {/* Error */}
          {error && (

            <div className="
              bg-red-50
              border border-red-200
              text-red-600

              px-3 py-2

              rounded-lg

              text-sm

              mb-4
            ">
              {error}
            </div>

          )}



          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="
              w-full

              flex items-center justify-center gap-3

              bg-white
              border border-gray-300

              hover:bg-gray-50

              rounded-lg

              py-2.5

              text-sm font-semibold

              transition

              disabled:opacity-50
            "
          >

            <svg className="w-5 h-5" viewBox="0 0 24 24">

              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>

              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>

              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93z"/>

              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1z"/>

            </svg>


            {loading ? "Signing in..." : "Continue with Google"}

          </button>



          <p className="
            text-xs
            text-gray-400
            text-center
            mt-5
          ">
            Secure authentication powered by Google
          </p>


        </div>


        {/* Footer */}
        <p className="
          text-center
          text-xs
          text-gray-400
          mt-4
        ">
          Trello Clone © 2026
        </p>


      </div>


    </div>

  );

}