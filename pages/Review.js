"use client";
import React, { useState, useEffect } from "react";
import { getReviews } from "@/api/review";
import { ReviewCard } from "@/components/ReviewCard";
import Loader from "@/components/Loader";

const Review = ({title, className}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const handleFetchPullRequests = async () => {
    try {
      setLoading(true);
      const response = await getReviews();
      const data = response;
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
    <Loader />
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className={`flex flex-col gap-4 ${className}`}>
            {title && <h1 className="text-black font-semibold text-base md:text-lg px-6">{title}</h1>}
            {data.map((review, index) => (
              <div key={index}>
                <ReviewCard
                  type={review.deleted_at ? "deleted" : "active"}
                  data={review}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Review;
