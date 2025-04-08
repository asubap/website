import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BAPLogo from "../../assets/BAP_Logo.png";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirect to homepage after countdown
    if (countdown <= 0) {
      navigate("/");
      return;
    }

    // Decrement countdown every second
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <img
          src={BAPLogo}
          alt="Beta Alpha Psi Logo"
          className="w-20 h-20 mx-auto mb-6"
        />

        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>

        <p className="text-gray-600 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved. You will
          be redirected to the homepage in{" "}
          <span className="font-semibold text-red-700">{countdown}</span>{" "}
          seconds.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
          >
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
