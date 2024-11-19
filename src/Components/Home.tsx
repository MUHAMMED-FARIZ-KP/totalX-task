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
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (user: any) => {
      try {
        const db = getFirestore();
        const userPhoneNumber = user.phoneNumber?.replace(/\D/g, '') || 
                             user.providerData[0]?.phoneNumber?.replace(/\D/g, '') || "";
        
        if (!userPhoneNumber) {
          navigate("/login", { replace: true });
          return;
        }
  
        const userDoc = await getDoc(doc(db, "users", userPhoneNumber));
  
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setPhoneNumber(userPhoneNumber);
          setLoading(false);
        } else {
          navigate("/signup", { 
            state: { phoneNumber: userPhoneNumber, uid: user.uid },
            replace: true 
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login", { replace: true });
      }
    };
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        navigate("/login", { replace: true });
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
      <header className="w-full p-4 flex justify-end items-center shadow-sm">
        <img src={logo} alt="Logo" className="h-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          {phoneNumber && (
            <p className="text-xl text-gray-800 mb-4">{phoneNumber}</p>
          )}
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;