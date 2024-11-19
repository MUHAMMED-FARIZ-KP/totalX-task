import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import logo from "../assets/logo.png";
import right from "../assets/1.png";
import { useNavigate, useLocation } from "react-router-dom";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: any;
  }
}

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Add a state to track if automatic refresh is needed
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const cleanup = () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        delete window.recaptchaVerifier;
      }
    };

    cleanup();
    return cleanup;
  }, []);

  // Check if we came from signup and need to refresh
  useEffect(() => {
    if (location.state?.fromSignup) {
      setShouldRefresh(true);
    }
  }, [location.state]);

  // Automatic refresh effect
  useEffect(() => {
    if (shouldRefresh) {
      window.location.reload();
    }
  }, [shouldRefresh]);

  const generateRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError("reCAPTCHA expired. Please try again.");
          setLoading(false);
        }
      });

      window.recaptchaVerifier.render();
    } catch (error) {
      console.error("Error generating reCAPTCHA:", error);
      setError("Error setting up verification. Please refresh the page.");
      setLoading(false);
    }
  }

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      generateRecaptcha();
      const formattedNumber = `+91${phoneNumber}`; // Assuming Indian numbers
      const appVerifier = window.recaptchaVerifier;
      
      if (!appVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      
      navigate('/otp', { 
        state: { 
          phoneNumber: formattedNumber
        }
      });
    } catch (err) {
      console.error("Phone auth error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error?.code) {
      switch (error.code) {
        case 'auth/invalid-phone-number':
          return 'Invalid phone number format.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later.';
        case 'auth/captcha-check-failed':
          return 'reCAPTCHA verification failed. Please try again.';
        default:
          return 'Failed to send OTP. Please try again.';
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-lg">
        <div className="w-full lg:w-1/2 p-8">
          <div className="mb-12">
            <img src={logo} alt="logo" className="h-12" />
          </div>

          <div className="max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600 mb-8">
              Login to access your travelwise account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <fieldset className="border rounded-lg border-gray-300">
                  <legend className="text-sm px-2 ml-2">Enter mobile number</legend>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </fieldset>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400"
              >
                {loading ? "Sending OTP..." : "Get OTP"}
              </button>
            </form>
          </div>
          <div id="recaptcha-container"></div>
        </div>

        <div className="hidden lg:block w-1/2">
          <img src={right} alt="Security Illustration" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default Login;