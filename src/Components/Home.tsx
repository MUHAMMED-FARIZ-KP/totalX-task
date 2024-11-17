import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import logo from "../assets/logo.png";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const db = getFirestore();
      const phoneNumber = user.phoneNumber?.replace(/\D/g, '') || "";
      const userDoc = await getDoc(doc(db, "users", phoneNumber));

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        setLoading(false); // Ensure this is executed here
      } else {
        navigate("/signup", { 
          state: { phoneNumber, uid: user.uid },
          replace: true 
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  });

  return () => unsubscribe();
}, [navigate]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full p-4 flex justify-between items-center shadow-sm">
        <img src={logo} alt="Logo" className="h-10" />
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Log Out
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome, {userData?.firstName} {userData?.lastName}!
          </h1>
          <p className="text-gray-600">
            You're successfully logged in to your account.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;