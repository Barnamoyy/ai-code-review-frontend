"use client";
import React, { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { GitHubTable } from "@/components/github-table.jsx";
import { getCommits } from "@/api/commit";
import useAuth from "@/hooks/useAuth";

const Commits = ({repo}) => {
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
        
        const response = await getCommits(token, "Barnamoyy");
        const commits = response.data || response;
        setData(commits);
      } catch (error) {
        setError(error.message || "Failed to fetch commits");
        console.error("Error fetching commits:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated]);

  useEffect(() => {
    console.log("commits:", data);
  })

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-muted-foreground">No commits found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
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

export default Commits;
