"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
  IconStar,
  IconEye,
  IconGitFork,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import WebhookAlert from "./webhook-alert";

// Schema definitions for different GitHub entities
export const repositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  private: z.boolean(),
  html_url: z.string(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable(),
  updated_at: z.string(),
  visibility: z.string().optional(),
});

export const commitSchema = z.object({
  id: z.string(),
  sha: z.string(),
  commit: z.object({
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string(),
      date: z.string(),
    }),
  }),
  author: z
    .object({
      login: z.string(),
      avatar_url: z.string(),
    })
    .nullable(),
  html_url: z.string(),
});

export const pullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable(),
  html_url: z.string(),
  draft: z.boolean(),
  head: z.object({
    ref: z.string(),
  }),
  base: z.object({
    ref: z.string(),
  }),
});

// Component for rendering dates with client-side hydration safety
function ClientDate({ dateString }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return ISO date format for SSR to avoid hydration mismatch
    return <>{new Date(dateString).toISOString().split("T")[0]}</>;
  }

  // Return localized date on client
  return <>{new Date(dateString).toLocaleDateString()}</>;
}

// Drag handle component
function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Draggable row component
function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Repository columns configuration
const getRepositoryColumns = ({ onAddWebhook }) => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Repository",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconGitBranch className="size-4 text-muted-foreground" />
        <a
          href={row.original.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          {row.original.name}
        </a>
        {row.original.private && (
          <Badge variant="secondary" className="text-xs">
            Private
          </Badge>
        )}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-md truncate text-muted-foreground">
        {row.original.description || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.language || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "stargazers_count",
    header: () => <div className="text-right">Stars</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <IconStar className="size-3 fill-yellow-500 text-yellow-500" />
        <span>{row.original.stargazers_count}</span>
      </div>
    ),
  },
  {
    accessorKey: "forks_count",
    header: () => <div className="text-right">Forks</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <IconGitFork className="size-3" />
        <span>{row.original.forks_count}</span>
      </div>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        <ClientDate dateString={row.original.updated_at} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => window.open(row.original.html_url, "_blank")}
          >
            View on GitHub
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onAddWebhook(row.original)}>Add Webhook</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// Commit columns configuration
const getCommitColumns = () => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sha",
    header: "Commit",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconGitCommit className="size-4 text-muted-foreground" />
        <a
          href={row.original.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm hover:underline"
        >
          {row.original.sha.substring(0, 7)}
        </a>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "commit.message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-lg truncate">
        {row.original.commit.message.split("\n")[0]}
      </div>
    ),
  },
  {
    accessorKey: "commit.author.name",
    header: "Author",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.author?.avatar_url && (
          <img
            src={row.original.author.avatar_url}
            alt={row.original.commit.author.name}
            className="size-6 rounded-full"
          />
        )}
        <span>{row.original.commit.author.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "commit.author.date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        <ClientDate dateString={row.original.commit.author.date} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => window.open(row.original.html_url, "_blank")}
          >
            View on GitHub
          </DropdownMenuItem>
          <DropdownMenuItem>Copy SHA</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Cherry-pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// Pull Request columns configuration
const getPullRequestColumns = () => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "PR",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconGitPullRequest className="size-4 text-muted-foreground" />
        <a
          href={row.original.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          #{row.original.number}
        </a>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="max-w-lg truncate">{row.original.title}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{row.original.head.ref}</span>
          <span>→</span>
          <span>{row.original.base.ref}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: "Status",
    cell: ({ row }) => {
      const getStatusColor = () => {
        if (row.original.merged_at) return "bg-purple-500/10 text-purple-500";
        if (row.original.state === "open")
          return "bg-green-500/10 text-green-500";
        return "bg-red-500/10 text-red-500";
      };

      const getStatusText = () => {
        if (row.original.merged_at) return "Merged";
        if (row.original.draft) return "Draft";
        return row.original.state;
      };

      return (
        <Badge variant="outline" className={`px-2 ${getStatusColor()}`}>
          {getStatusText()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "user.login",
    header: "Author",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <img
          src={row.original.user.avatar_url}
          alt={row.original.user.login}
          className="size-6 rounded-full"
        />
        <span>{row.original.user.login}</span>
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        <ClientDate dateString={row.original.created_at} />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => window.open(row.original.html_url, "_blank")}
          >
            View on GitHub
          </DropdownMenuItem>
          <DropdownMenuItem>Checkout</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Close PR</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function GitHubTable({ data: initialData, type = "repositories" }) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedRepo, setSelectedRepo] = React.useState(null)
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleOpenDialog = (repo) => {
    setSelectedRepo(repo);
    setDialogOpen(true);
  };

  // Get columns based on type
  const columns = React.useMemo(() => {
    switch (type) {
      case "repositories":
        return getRepositoryColumns({ onAddWebhook: handleOpenDialog });
      case "commits":
        return getCommitColumns();
      case "pull-requests":
        return getPullRequestColumns();
      default:
        return getRepositoryColumns({ onAddWebhook: handleOpenDialog });
    }
  }, [type]);

  const dataIds = React.useMemo(() => data?.map(({ id }) => id) || [], [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const getTableTitle = () => {
    switch (type) {
      case "repositories":
        return "Repositories";
      case "commits":
        return "Commits";
      case "pull-requests":
        return "Pull Requests";
      default:
        return "GitHub Data";
    }
  };

  React.useEffect(() => {
    console.log(selectedRepo)
  }, [selectedRepo])

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h2 className="text-lg font-semibold">{getTableTitle()}</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>

        <WebhookAlert open={dialogOpen} setOpen={setDialogOpen} repo={selectedRepo} />
      </div>
    </div>
  );
}
