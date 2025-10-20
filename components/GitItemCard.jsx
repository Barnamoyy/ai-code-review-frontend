import { GitPullRequest, GitCommit, FolderGit2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

export function GitItemCard({ type, data }) {
  const config = {
    pullrequest: {
      icon: GitPullRequest,
      title: `Pull Request ${data.pull_number || data.pr_number || ''}`,
      description: `created by ${data.owner} on ${data.repo} at ${data.created_at}`,
      buttonText: 'View on GitHub',
      href: `https://github.com/${data.repo}/pull/${data.pull_number}`
    },
    commit: {
      icon: GitCommit,
      title: `Commit ${data.commit_id || ''}`,
      description: `on ${data.repo} at ${data.created_at}`,
      buttonText: 'View Commit',
      href: `https://github.com/${data.repo}/pull/${data.pull_number}/commits/${data.commit_id}`
    },
    repository: {
      icon: FolderGit2,
      title: data.repository_name || '',
      description: data.description || 'Repository',
      buttonText: 'View Repository',
      href: `https://github.com/${data.repo}`
    }
  };

  const currentConfig = config[type] || config.pullrequest;
  const IconComponent = currentConfig.icon;

  return (
    <div className="flex w-full flex-col gap-6 px-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IconComponent />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{currentConfig.title}</ItemTitle>
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
