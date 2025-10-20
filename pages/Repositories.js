"use client";
import React, { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { GitHubTable } from "@/components/github-table.jsx";
import { getRepositories } from "@/api/repository";
import useAuth from "@/hooks/useAuth";

const Repositories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true); 
        setError(null);
        
        const response = await getRepositories(token, "Barnamoyy");
        const repositories = response.data || response;
        setData(repositories);
      } catch (error) {
        setError(error.message || "Failed to fetch repositories");
        console.error("Error fetching repositories:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-muted-foreground">No repositories found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <GitHubTable type="repositories" data={data} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Repositories;
