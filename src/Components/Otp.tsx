import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import logo from "../assets/logo.png";
import right from "../assets/1.png";

interface LocationState {
  phoneNumber: string;
}

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    if (!window.confirmationResult) {
      navigate("/login", { replace: true });
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const isValidState = (state: any): state is LocationState => {
    return state && state.phoneNumber;
  };

  if (!isValidState(location.state)) {
    return <Navigate to="/login" replace />;
  }

  const { phoneNumber } = location.state;

  const checkUserExists = async (phoneNumber: string) => {
    try {
      // Remove any spaces or special characters from phone number
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const userDoc = await getDoc(doc(db, "users", formattedPhone));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const result = await window.confirmationResult.confirm(otp);
      if (result.user) {
        const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
        const userExists = await checkUserExists(formattedPhoneNumber);
  
        if (userExists) {
          navigate("/home", { replace: true });
        } else {
          // Pass verificationId to the signup page
          navigate("/signup", {
            state: {
              phoneNumber: formattedPhoneNumber,
              uid: result.user.uid,
              verificationId: window.confirmationResult.verificationId,
            },
            replace: true
          });
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  


  const handleResend = () => {
    if (timer === 0) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-lg">
        <div className="w-full lg:w-1/2 p-8">
          <div className="mb-12">
            <div className="inline-flex items-center">
              <img src={logo} alt="logo" />
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verify Code</h1>
            <p className="text-gray-600 mb-8">
              An authentication code has been sent to {phoneNumber}
            </p>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="relative">
                <fieldset className="border rounded-lg border-gray-300">
                  <legend className="text-sm px-2 ml-2">Enter code</legend>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                  />
                </fieldset>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <p className="text-center text-sm text-gray-600">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0}
                  className="text-red-500 hover:text-red-600 disabled:text-gray-400"
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend"}
                </button>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>
        <div className="hidden lg:block w-1/2">
          <img src={right} alt="Security Illustration" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default Otp;