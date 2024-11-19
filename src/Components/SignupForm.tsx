import React, { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import { AuthContext } from "../App";
import left from "../assets/2.png";

interface LocationState {
  phoneNumber: string;
  uid: string;
}

const SignupForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();
  const { currentUser } = React.useContext(AuthContext);

  const validateForm = () => {
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return null;
  };

  const isValidState = (state: any): state is LocationState => {
    return state && state.phoneNumber && state.uid;
  };

  if (!isValidState(location.state) || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const { phoneNumber, uid } = location.state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      const userData = {
        uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: formattedPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const userRef = doc(db, "users", formattedPhone);
      await setDoc(userRef, userData);

      navigate("/login", {
        state: { fromSignup: true },
        replace: true
      });
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to complete signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Image Section */}
        <div className="hidden lg:block lg:w-1/2 flex items-center justify-center p-8">
          <img
            src={left}
            alt="Security Illustration"
            className="w-full h-full object-cover rounded-l-lg"
          />
        </div>

        {/* Right Form Section */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col">
          {/* Logo at top right */}
          <div className="flex justify-end mb-8">
            <img src={logo} alt="logo" className="h-10" />
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Complete Your Profile
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto w-full">
              <div className="space-y-4">
                <fieldset className="border rounded-lg border-gray-300">
                  <legend className="text-sm px-2 ml-2">First Name</legend>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </fieldset>
                <fieldset className="border rounded-lg border-gray-300">
                  <legend className="text-sm px-2 ml-2">Last Name</legend>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </fieldset>
                <fieldset className="border rounded-lg border-gray-300">
                  <legend className="text-sm px-2 ml-2">Email</legend>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="johndoe@gmail.com"
                    className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </fieldset>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                I agree to the Terms and Privacy Policies
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              
              <a href="/login" className="text-blue-600 hover:text-blue-700 text-center ">
                Already have an account? Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;