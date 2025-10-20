"use client"

import { useMemo } from "react"
import { IconTrendingDown, IconTrendingUp, IconMinus } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards({ pullRequests, reviews, commits }) {
  const metrics = useMemo(() => {
    // Calculate active reviews (not deleted)
    const activeReviews = reviews.filter(r => r.deleted_at === null).length

    // Calculate trends (last 30 days vs previous 30 days)
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // PRs trend
    const recentPRs = pullRequests.filter(pr => new Date(pr.created_at) >= last30Days).length
    const previousPRs = pullRequests.filter(pr => {
      const date = new Date(pr.created_at)
      return date >= last60Days && date < last30Days
    }).length
    const prTrend = previousPRs > 0 ? ((recentPRs - previousPRs) / previousPRs) * 100 : 0

    // Reviews trend
    const recentReviews = reviews.filter(r => new Date(r.created_at) >= last30Days).length
    const previousReviews = reviews.filter(r => {
      const date = new Date(r.created_at)
      return date >= last60Days && date < last30Days
    }).length
    const reviewTrend = previousReviews > 0 ? ((recentReviews - previousReviews) / previousReviews) * 100 : 0

    // Commits trend
    const recentCommits = commits.filter(c => new Date(c.created_at) >= last30Days).length
    const previousCommits = commits.filter(c => {
      const date = new Date(c.created_at)
      return date >= last60Days && date < last30Days
    }).length
    const commitTrend = previousCommits > 0 ? ((recentCommits - previousCommits) / previousCommits) * 100 : 0

    // Active reviews trend
    const recentActiveReviews = reviews.filter(r => 
      r.deleted_at === null && new Date(r.created_at) >= last30Days
    ).length
    const previousActiveReviews = reviews.filter(r => {
      const date = new Date(r.created_at)
      return r.deleted_at === null && date >= last60Days && date < last30Days
    }).length
    const activeReviewTrend = previousActiveReviews > 0 
      ? ((recentActiveReviews - previousActiveReviews) / previousActiveReviews) * 100 
      : 0

    return {
      totalPRs: pullRequests.length,
      totalReviews: reviews.length,
      totalCommits: commits.length,
      activeReviews,
      prTrend: Math.round(prTrend * 10) / 10,
      reviewTrend: Math.round(reviewTrend * 10) / 10,
      commitTrend: Math.round(commitTrend * 10) / 10,
      activeReviewTrend: Math.round(activeReviewTrend * 10) / 10
    }
  }, [pullRequests, reviews, commits])

  const getTrendIcon = (trend) => {
    if (trend > 0) return <IconTrendingUp />
    if (trend < 0) return <IconTrendingDown />
    return <IconMinus />
  }

  const getTrendText = (trend, metric) => {
    if (trend > 0) return `Trending up by ${Math.abs(trend)}%`
    if (trend < 0) return `Down ${Math.abs(trend)}% from last period`
    return `Stable ${metric} activity`
  }

  const getFooterText = (trend, metric) => {
    if (trend > 5) return `Strong ${metric} growth`
    if (trend < -5) return `${metric} needs attention`
    return `Consistent ${metric} activity`
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Pull Requests */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pull Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalPRs.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {getTrendIcon(metrics.prTrend)}
              {metrics.prTrend > 0 ? '+' : ''}{metrics.prTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {getTrendText(metrics.prTrend, 'PR')} {getTrendIcon(metrics.prTrend)}
          </div>
          <div className="text-muted-foreground">
            {getFooterText(metrics.prTrend, 'pull request')}
          </div>
        </CardFooter>
      </Card>

      {/* Total Reviews */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Reviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalReviews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {getTrendIcon(metrics.reviewTrend)}
              {metrics.reviewTrend > 0 ? '+' : ''}{metrics.reviewTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {getTrendText(metrics.reviewTrend, 'review')} {getTrendIcon(metrics.reviewTrend)}
          </div>
          <div className="text-muted-foreground">
            {getFooterText(metrics.reviewTrend, 'code review')}
          </div>
        </CardFooter>
      </Card>

      {/* Total Commits */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Commits</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.totalCommits.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {getTrendIcon(metrics.commitTrend)}
              {metrics.commitTrend > 0 ? '+' : ''}{metrics.commitTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {getTrendText(metrics.commitTrend, 'commit')} {getTrendIcon(metrics.commitTrend)}
          </div>
          <div className="text-muted-foreground">
            {getFooterText(metrics.commitTrend, 'development')}
          </div>
        </CardFooter>
      </Card>

      {/* Active Reviews */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Reviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.activeReviews.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {getTrendIcon(metrics.activeReviewTrend)}
              {metrics.activeReviewTrend > 0 ? '+' : ''}{metrics.activeReviewTrend}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {getTrendText(metrics.activeReviewTrend, 'active review')} {getTrendIcon(metrics.activeReviewTrend)}
          </div>
          <div className="text-muted-foreground">
            {getFooterText(metrics.activeReviewTrend, 'review engagement')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
