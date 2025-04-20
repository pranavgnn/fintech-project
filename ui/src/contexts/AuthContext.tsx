import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginRequest, SignupRequest } from "../types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadUserFromToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("Loading user data from token...");
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load user data: ${response.status}`);
      }

      const userData = await response.json();
      console.log("User data loaded:", userData);

      // Make sure roles are properly loaded and parsed
      if (userData && !userData.roles) {
        console.warn("User data received but roles are missing:", userData);
        userData.roles = []; // Set default empty roles if missing
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error loading user:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch current user data
          const response = await fetch("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log("Failed to validate token:", response.status);
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Authentication check failed", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      console.log("Attempting to login with:", { email: data.email });
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Login failed";

        // Try to parse error response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message ||
              errorData.error ||
              `Login failed with status: ${response.status}`;
          } catch (e) {
            errorMessage = `Login failed with status: ${response.status}`;
          }
        } else {
          errorMessage = `Login failed with status: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Login success, received token");

      const { accessToken } = responseData;
      localStorage.setItem("token", accessToken);

      // Fetch user data after login
      try {
        const userResponse = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          toast.success("Login successful!");
          navigate("/dashboard");
        } else {
          console.error("Failed to fetch user data:", userResponse.status);
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("User data fetch error:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      console.log("Attempting to signup with:", {
        email: data.email,
        name: data.name,
      });
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Signup response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Signup failed";

        // Try to parse error response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message ||
              errorData.error ||
              `Signup failed with status: ${response.status}`;
          } catch (e) {
            errorMessage = `Signup failed with status: ${response.status}`;
          }
        } else {
          errorMessage = `Signup failed with status: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      toast.success("Account created successfully!");

      // Automatically login after successful signup
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
