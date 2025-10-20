import { MessageSquareCode, FileCode, GitPullRequest, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

export function ReviewCard({ type = "review", data }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeleted = data.deleted_at !== null;

  const config = {
    review: {
      icon: MessageSquareCode,
      title: `${data.repo} - PR #${data.pr_number}`,
      description: `${data.comments} comment${data.comments !== 1 ? 's' : ''} • Created ${formatDate(data.created_at)}${isDeleted ? ` • Deleted ${formatDate(data.deleted_at)}` : ''}`,
      buttonText: 'View Review',
      isDeleted: isDeleted,
      href: `https://github.com/${data.repo}/pull/${data.pr_number}`
    },
    active: {
      icon: FileCode,
      title: `${data.repo} - PR #${data.pr_number}`,
      description: `${data.comments} active comment${data.comments !== 1 ? 's' : ''} • ${formatDate(data.created_at)}`,
      buttonText: 'View Active Review',
      isDeleted: false,
      href: `https://github.com/${data.repo}/pull/${data.pr_number}`
    },
    deleted: {
      icon: Trash2,
      title: `${data.repo} - PR #${data.pr_number}`,
      description: `Deleted on ${formatDate(data.deleted_at)} • Originally had ${data.comments} comment${data.comments !== 1 ? 's' : ''}`,
      buttonText: 'View Archive',
      isDeleted: true,
      href: `https://github.com/${data.repo}/pull/${data.pr_number}`
    },
    summary: {
      icon: GitPullRequest,
      title: data.repo || 'Repository',
      description: `Total reviews: ${data.totalReviews || 0} • Active: ${data.activeReviews || 0}`,
      buttonText: 'View All',
      isDeleted: false,
      href: `https://github.com/${data.repo}`
    }
  };

  const currentConfig = config[type] || config.review;
  const IconComponent = currentConfig.icon;

  return (
    <div className="flex w-full flex-col gap-6 px-6">
      <Item variant="outline" className={currentConfig.isDeleted ? "opacity-60" : ""}>
        <ItemMedia variant="icon">
          <IconComponent />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {currentConfig.title}
            {currentConfig.isDeleted && <span className="text-red-500 text-sm ml-2">(Deleted)</span>}
          </ItemTitle>
          <ItemDescription>
            {currentConfig.description}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <a href={currentConfig.href}>
            <Button size="sm" variant="outline">
              {currentConfig.buttonText}
            </Button>
          </a>
        </ItemActions>
      </Item>
    </div>
  )
}
