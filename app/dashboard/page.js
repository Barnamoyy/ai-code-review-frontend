"use client"

import React from 'react'
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import Review from '@/pages/Review'
import { useGitHubMetrics } from '@/hooks/useGithubMetrics'

const Page = () => {
  const { pullRequests, reviews, commits, loading, error } = useGitHubMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading metrics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards 
              pullRequests={pullRequests} 
              reviews={reviews} 
              commits={commits} 
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive 
                pullRequests={pullRequests} 
                reviews={reviews}
                useDummyData={true}
              />
            </div>
            <Review title="Recent reviews" reviews={reviews} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
