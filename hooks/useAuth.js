"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: session } = useSession();
  const token = session?.accessToken;

  useEffect(() => {
    if (session) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [session]);

  return {isAuthenticated, session, signIn, signOut, token}
};

export default useAuth;
