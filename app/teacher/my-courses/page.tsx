"use client";

import * as React from "react";
import { useState, useEffect, JSX } from "react";
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";

// -------------------------------------------------------------------
// Define the Course type
// -------------------------------------------------------------------
export type Course = {
  id: string;
  title: string;
  thumbnail: string;
  published: boolean;
  createdAt: string;
};

// -------------------------------------------------------------------
// DeleteCourseDialog Component
// -------------------------------------------------------------------
type DeleteCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onDelete: (courseId: string) => Promise<void>;
};

function DeleteCourseDialog({
  open,
  onOpenChange,
  course,
  onDelete,
}: DeleteCourseDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Please type the course name <strong>{course.title}</strong> to
            confirm deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="confirm-course-name">Course Name</Label>
            <Input
              id="confirm-course-name"
              placeholder="Type course name to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={confirmText !== course.title}
            onClick={async () => {
              await onDelete(course.id);
              onOpenChange(false);
              setConfirmText("");
            }}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -------------------------------------------------------------------
// TeacherCoursesTable Component
// -------------------------------------------------------------------
function TeacherCoursesTable(): JSX.Element {
  // State for courses, loading, error, and delete dialog.
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Fetch courses from API endpoint on mount.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/course/list");
        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Handle delete by calling the API endpoint and updating the state.
  const handleDelete = async (courseId: string) => {
    try {
      const res = await fetch("/api/course/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete course");
      }
      // Update courses state to remove the deleted course.
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (error: any) {
      console.error("Error deleting course:", error.message);
      // Optionally, show a notification to the user.
    }
  };

  // Define columns inside the component to have access to state setters.
  const columns: ColumnDef<Course>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => (
        <Image
          src={row.getValue("thumbnail")}
          alt={row.getValue("title")}
          className="w-16 h-16 object-cover rounded"
          height={64}
          width={64}
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.getValue("title")}</span>,
    },
    {
      accessorKey: "published",
      header: "Status",
      cell: ({ row }) => {
        const published = row.getValue("published") as boolean;
        return (
          <span className={published ? "text-green-600" : "text-red-600"}>
            {published ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span>{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                  <Link href={`/teacher/course/${course.id}`}>
                    View Course
                  </Link>
                  </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setCourseToDelete(course);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: courses,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* Columns dropdown omitted for brevity */}
      </div>
      <div className="overflow-x-auto rounded-md border shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-2 text-sm text-gray-600"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      {courseToDelete && (
        <DeleteCourseDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setCourseToDelete(null);
          }}
          course={courseToDelete}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default TeacherCoursesTable;