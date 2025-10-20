"use client";
import React, { useState, useEffect } from "react";
import { getPullRequests } from "@/api/pullrequest";
import { GitItemCard } from "@/components/GitItemCard";
import { SiteHeader } from "@/components/site-header";
import Loader from "@/components/Loader";

const PullRequest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const handleFetchPullRequests = async () => {
    try {
      setLoading(true);
      const response = await getPullRequests();
      const data = response.data;
      setData(data);
    } catch (error) {
      setError(error);
      console.error("Error getting pull requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPullRequests();
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (loading) {
    <Loader />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {data.map((pr, index) => (
              <div key={index}>
                <GitItemCard data={pr} type="pullrequest" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PullRequest;
