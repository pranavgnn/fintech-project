import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "./api";

interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return false;
      }

      const response = await api.get("/users/me");
      const userData = response.data;

      // Transform the user data to match the User interface
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        roles: userData.roles || [],
      };

      setUser(user);
      return true;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      localStorage.removeItem("token");
      setUser(null);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchUserData();
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      if (!token) {
        throw new Error("No access token received from server");
      }

      // Store the access token
      localStorage.setItem("token", token);

      // Fetch user data after login
      const success = await fetchUserData();
      if (!success) {
        throw new Error("Failed to fetch user data after login");
      }

      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("token");
      setUser(null);
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      await api.post("/auth/signup", data);
      // Navigate to login after successful signup
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes("ADMIN") ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
