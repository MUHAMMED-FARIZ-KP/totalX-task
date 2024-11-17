import React, { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { auth } from "../firebase";
import logo from "../assets/logo.png";

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

  if (!isValidState(location.state)) {
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
      // Remove any special characters from phone number
      const formattedPhone = phoneNumber.replace(/\D/g, '');

      // Create or update user document in Firestore
      const userRef = doc(db, "users", formattedPhone);
      await setDoc(userRef, {
        uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: formattedPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Navigate to the home page after successful signup
      navigate("/home", { replace: true });

    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to complete signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-lg">
        <div className="w-full lg:w-1/2 p-8">
          <div className="mb-12">
            <img src={logo} alt="logo" className="h-12" />
          </div>
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Complete Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full px-4 py-3 border rounded"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="w-full px-4 py-3 border rounded"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border rounded"
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-blue-600 text-white rounded ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? "Creating Account..." : "Complete Signup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
