import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Otp from './Components/Otp';
import SignupForm from './Components/SignupForm';
import Home from './Components/Home';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Define UserData interface
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

// Create a context for auth state
export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  userExists: boolean | null;
  currentUser: any | null;
}>({
  isAuthenticated: false,
  isLoading: true,
  userExists: null,
  currentUser: null,
});

// AuthProvider component to manage authentication state
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userExists, setUserExists] = React.useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const db = getFirestore();

  React.useEffect(() => {
    const checkUserExistence = async (phoneNumber: string) => {
      try {
        const formattedPhone = phoneNumber.replace(/\D/g, '');
        const userDocRef = doc(db, "users", formattedPhone);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists();
      } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
      }
    };

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user?.phoneNumber) {
        const exists = await checkUserExistence(user.phoneNumber);
        setUserExists(exists);
        setIsAuthenticated(true);
      } else {
        setUserExists(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userExists, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Route component for authenticated users
const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, userExists } = React.useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to signup if user doesn't exist yet
  if (userExists === false && window.location.pathname !== "/signup") {
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
};

// Route component for public routes (e.g., login, OTP)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, userExists } = React.useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && userExists) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Main App component with route definitions
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/otp" element={<PublicRoute><Otp /></PublicRoute>} />

          {/* Signup route needs to be accessible after OTP verification */}
          <Route path="/signup" element={<AuthenticatedRoute><SignupForm /></AuthenticatedRoute>} />

          {/* Home route, protected for authenticated users */}
          <Route path="/home" element={<AuthenticatedRoute><Home /></AuthenticatedRoute>} />

          {/* Redirect to login for the root path */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Fallback route for any undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
