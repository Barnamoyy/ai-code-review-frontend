"use client";
import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { addUser } from "@/api/user";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: session } = useSession();
  const token = session?.accessToken;
  const username = session?.username;

  const storeUser = async (username, token) => {
    try {
      const response = await addUser(username, token);
      return response.data;
    } catch (error) {
      console.error("Error storing user:", error);
    }
  };

  useEffect(() => {
    if (session) {
      setIsAuthenticated(true);
      if (token && username) {
        storeUser(username, token);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [session]);

  return { isAuthenticated, session, signIn, signOut, token };
};

export default useAuth;
