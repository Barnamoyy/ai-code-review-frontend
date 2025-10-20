"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Pull Requests and Reviews Analytics"

const chartConfig = {
  activity: {
    label: "Activity",
  },
  pullRequests: {
    label: "Pull Requests",
    color: "hsl(var(--chart-1))",
  },
  reviews: {
    label: "Reviews",
    color: "hsl(var(--chart-2))",
  }
}

// Function to generate dummy data
const generateDummyData = () => {
  const data = []
  const today = new Date()
  
  // Generate data for the last 90 days
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    
    // Random number of PRs (0-5) and reviews (0-8)
    const pullRequests = Math.floor(Math.random() * 6)
    const reviews = Math.floor(Math.random() * 9)
    
    data.push({
      date: dateString,
      pullRequests,
      reviews
    })
  }
  
  return data
}

export function ChartAreaInteractive({ pullRequests, reviews, useDummyData = false }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState([])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    // Use dummy data if flag is true
    if (useDummyData) {
      const dummyData = generateDummyData()
      setChartData(dummyData)
      return
    }

    // Use passed data instead of fetching
    // Group data by date
    const dateMap = new Map()

    // Process pull requests
    pullRequests.forEach(pr => {
      const date = new Date(pr.created_at).toISOString().split('T')[0]
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, pullRequests: 0, reviews: 0 })
      }
      dateMap.get(date).pullRequests += 1
    })

    // Process reviews
    reviews.forEach(review => {
      const date = new Date(review.created_at).toISOString().split('T')[0]
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, pullRequests: 0, reviews: 0 })
      }
      dateMap.get(date).reviews += 1
    })

    // Convert map to array and sort by date
    const formattedData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    setChartData(formattedData)
  }, [pullRequests, reviews, useDummyData])

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []

    const referenceDate = new Date()
    let daysToSubtract = 90
    
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  const totalPRs = React.useMemo(() => 
    filteredData.reduce((sum, item) => sum + item.pullRequests, 0), 
    [filteredData]
  )

  const totalReviews = React.useMemo(() => 
    filteredData.reduce((sum, item) => sum + item.reviews, 0), 
    [filteredData]
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Pull Requests & Reviews Analytics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {totalPRs} PRs • {totalReviews} Reviews • {useDummyData ? '(Demo Data)' : '(Live Data)'}
          </span>
          <span className="@[540px]/card:hidden">
            {totalPRs} PRs • {totalReviews} Reviews
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex">
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart 
            data={filteredData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }} 
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                  }}
                  indicator="dot" 
                />
              } 
            />
            <Bar 
              dataKey="pullRequests" 
              fill="var(--color-pullRequests)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="reviews" 
              fill="var(--color-reviews)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
