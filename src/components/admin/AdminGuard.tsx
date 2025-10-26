"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Verify token and get user info
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data.data;
        
        // Check if user is admin
        if (userData.role !== "admin") {
          alert("Access denied. Admin privileges required.");
          router.push("/");
          return;
        }
        
        setUser(userData);
      } else {
        // Token is invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
