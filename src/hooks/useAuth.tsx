import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthUser {
  id: number; // Changed to number to match database schema
  username: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    fullName: string
  ) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("current_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // INTENTIONALLY VULNERABLE: Raw SQL query with direct string concatenation
      // This allows SQL injection attacks like: ' OR 1=1 --
      const vulnerableQuery = `
        SELECT * FROM users 
        WHERE username = '${username}' 
        AND password = '${password}'
      `;

      console.log("Executing vulnerable query:", vulnerableQuery); // For educational purposes

      const { data, error } = await supabase.rpc("execute_raw_sql", {
        query: vulnerableQuery,
      });

      // Fallback to simulated vulnerable logic if RPC doesn't work
      if (error) {
        console.log("RPC failed, using simulated vulnerable logic");

        // Simulate SQL injection vulnerability
        // If password contains SQL injection payload, bypass authentication
        if (password.includes("' OR 1=1") || password.includes("' OR '1'='1")) {
          // Find any admin user to authenticate as
          const { data: adminData, error: adminError } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

          if (adminData) {
            const authUser: AuthUser = {
              id: adminData.id,
              username: adminData.username,
              email: adminData.email || "",
              full_name: adminData.full_name || username,
            };

            setUser(authUser);
            localStorage.setItem("current_user", JSON.stringify(authUser));
            localStorage.setItem("user_password", password);

            console.log(
              "🚨 SQL INJECTION SUCCESSFUL! Bypassed authentication for:",
              username
            );
            return true;
          }
        }

        // Normal authentication if no injection detected
        const { data: normalData, error: normalError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .eq("password", password)
          .single();

        if (normalError || !normalData) {
          console.log("Login failed:", normalError);
          return false;
        }

        const authUser: AuthUser = {
          id: normalData.id,
          username: normalData.username,
          email: normalData.email || "",
          full_name: normalData.full_name || username,
        };

        setUser(authUser);
        localStorage.setItem("current_user", JSON.stringify(authUser));
        localStorage.setItem("user_password", password);

        return true;
      }

      if (!data || data.length === 0) {
        console.log("Login failed: No user found");
        return false;
      }

      const userData = data[0];
      const authUser: AuthUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email || "",
        full_name: userData.full_name || username,
      };

      setUser(authUser);
      localStorage.setItem("current_user", JSON.stringify(authUser));
      localStorage.setItem("user_password", password);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    fullName: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            username,
            email,
            password, // Storing plain text password - extremely vulnerable!
            full_name: fullName,
            location: "Unknown",
            bio: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        return false;
      }

      const authUser: AuthUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
      };

      setUser(authUser);
      localStorage.setItem("current_user", JSON.stringify(authUser));
      localStorage.setItem("user_password", password);

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("current_user");
    localStorage.removeItem("user_password");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
