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
// StudentCoursesTable Component
// -------------------------------------------------------------------
function StudentCoursesTable(): JSX.Element {
  // State for courses, loading, and error.
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  // Define columns inside the component.
  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => (
        <Image
          src={row.getValue("thumbnail")}
          alt={row.getValue("title")}
          className="w-16 h-16 object-cover rounded"
          height={16}
          width={16}
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span>{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <Button asChild>
            <Link href={`/user/course/${course.id}`}>View Course</Link>
          </Button>
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
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center py-4">
        <input
          type="text"
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                <TableRow key={row.id} className="hover:bg-gray-50">
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
    </div>
  );
}

export default StudentCoursesTable;
