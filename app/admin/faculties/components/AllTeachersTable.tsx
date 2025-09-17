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

import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";  // Import Link
import Image from "next/image";

// -------------------------------------------------------------------
// Define the Teacher type
// -------------------------------------------------------------------

export type Teacher = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  subject: string;
  position: string;
  yearsOfExperience: number;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  courseCount: number; // Add courseCount to the Teacher type
};

// -------------------------------------------------------------------
// DeleteTeacherDialog Component
// -------------------------------------------------------------------
type DeleteTeacherDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
  onDelete: (teacherId: string) => Promise<void>;
};

function DeleteTeacherDialog({
  open,
  onOpenChange,
  teacher,
  onDelete,
}: DeleteTeacherDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>
            Please type the teacher name <strong>{teacher.name}</strong> to
            confirm deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="confirm-teacher-name">Teacher Name</Label>
            <Input
              id="confirm-teacher-name"
              placeholder="Type teacher name to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={confirmText.trim() !== teacher.name.trim()}
            onClick={async () => {
              await onDelete(teacher.id);
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
// AllTeachersTable Component
// -------------------------------------------------------------------
function AllTeachersTable(): JSX.Element {
  // State for teachers, loading, error, and delete dialog.
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const router = useRouter(); // Initialize useRouter

  // Fetch teachers from API endpoint on mount.
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/admin/list-faculties");
        if (!res.ok) {
          throw new Error("Failed to fetch teachers");
        }
        const data = await res.json();
        setTeachers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Handle delete by calling the API endpoint and updating the state.
  const handleDelete = async (teacherId: string) => {
    try {
      const res = await fetch("/api/admin/delete-faculty", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to delete teacher");
      }
      // Update teachers state to remove the deleted teacher.
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
    } catch (error: any) {
      console.error("Error deleting teacher:", error.message);
      // Optionally, show a notification to the user.
    }
  };

  // Define columns inside the component to have access to state setters.
  const columns: ColumnDef<Teacher>[] = [
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
      accessorKey: "profileImage",
      header: "Profile Image",
      cell: ({ row }) => (
        <Image
          src={row.getValue("profileImage") || "/placeholder-image.png"} // Use a placeholder if no image
          alt={`${row.getValue("name")} `}
          className="w-16 h-16 object-cover rounded"
          height={16}
          width={16}
        />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span>{row.getValue("email")}</span>,
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => <span>{row.getValue("department")}</span>,
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => <span>{row.getValue("subject")}</span>,
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <span>{row.getValue("position")}</span>,
    },
    {
      accessorKey: "yearsOfExperience",
      header: "Years of Experience",
      cell: ({ row }) => <span>{row.getValue("yearsOfExperience")}</span>,
    },
    {
      accessorKey: "courseCount", // Display course count
      header: "Courses",
      cell: ({ row }) => <span>{row.getValue("courseCount")}</span>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const teacher = row.original;
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
              <DropdownMenuItem
                onClick={() => {
                  // Navigate to teacher's courses page
                  router.push(`/admin/courses?facultyId=${teacher.id}`);
                }}
              >
                View Courses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setTeacherToDelete(teacher);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete Teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: teachers,
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

  if (loading) return <p>Loading teachers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full max-w-8xl mx-auto">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
                  No teachers found.
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
      {teacherToDelete && (
        <DeleteTeacherDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setTeacherToDelete(null);
          }}
          teacher={teacherToDelete}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default AllTeachersTable;