"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  courseCode?: string;
  thumbnail?: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  enrollments: any[];
}

const PAGE_SIZE = 10;

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

interface CourseListProps {
  searchQuery: string;
  sortBy?: "title" | "createdAt" | "enrollmentCount" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  page: number;
  pageSize: number;
  onTotalCount: (total: number) => void;
  truncateDescription: (description: string) => string;
}

function CourseList({
  searchQuery,
  sortBy,
  sortOrder,
  page,
  pageSize,
  onTotalCount,
  truncateDescription,
}: CourseListProps) {
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("query", searchQuery);
  if (sortBy) queryParams.append("sortBy", sortBy);
  if (sortOrder) queryParams.append("sortOrder", sortOrder);
  queryParams.append("page", page.toString());
  queryParams.append("limit", pageSize.toString());
  const key = `/api/course/search-and-filter?${queryParams.toString()}`;

  const { data, isLoading } = useSWR(key, fetcher, {
    dedupingInterval: 0,
    revalidateOnMount: true,
  });

  useEffect(() => {
    if (data && typeof data.totalCount === "number") {
      onTotalCount(data.totalCount);
    }
  }, [data, onTotalCount]);

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, idx) => (
          <CourseCardSkeleton key={idx} />
        ))}
      </>
    );
  }

  if (!data?.courses || data.courses.length === 0) {
    return <p>No courses found matching your criteria.</p>;
  }

  return (
    <>
      {data?.courses.map((course: Course) => (
        <CourseCard
          key={course.id}
          course={course}
          truncateDescription={truncateDescription}
        />
      ))}
    </>
  );
}

export default function CourseSearchResults() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "title" | "createdAt" | "enrollmentCount" | undefined
  >(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const handleTotalCount = useCallback((count: number) => {
    setTotalResults(count);
  }, []);

  const truncateDescription = (description: string): string => {
    const words = description.split(" ");
    return words.slice(0, 20).join(" ") + (words.length > 20 ? "..." : "");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalResults / PAGE_SIZE)) return;
    setPage(newPage);
  };

  const hasSearchQuery = searchQuery.trim() !== "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="min-h-[32px] mb-6">
        {hasSearchQuery && (
          <h1 className="text-2xl font-bold">
            {totalResults.toLocaleString()} results for &quot;{searchQuery}&quot;
          </h1>
        )}
      </div>

      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for anything"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Right side with course listings */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">
              {totalResults.toLocaleString()} results
            </span>
            <div className="w-full md:w-64">
              <Select
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split(":") as
                    | [
                        "title" | "createdAt" | "enrollmentCount",
                        "asc" | "desc"
                      ]
                    | [undefined, undefined];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                defaultValue={sortBy ? `${sortBy}:${sortOrder}` : undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title:asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title:desc">Title (Z-A)</SelectItem>
                  <SelectItem value="createdAt:desc">Newest</SelectItem>
                  <SelectItem value="enrollmentCount:desc">
                    Most Popular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CourseList
            searchQuery={debouncedSearchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            page={page}
            pageSize={PAGE_SIZE}
            onTotalCount={handleTotalCount}
            truncateDescription={truncateDescription}
          />

          <div className="flex justify-center mt-8 items-center gap-4">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="outline"
              className="mr-2 border border-gray-900 text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-gray-700">
              Page {page} of {Math.ceil(totalResults / PAGE_SIZE)}
            </span>

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(totalResults / PAGE_SIZE)}
              variant="outline"
              className="ml-2 border border-gray-900 text-gray-900"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

interface CourseCardProps {
  course: Course;
  truncateDescription: (description: string) => string;
}

function CourseCard({ course, truncateDescription }: CourseCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 pb-6 border-b">
      <div className="md:w-48 flex-shrink-0">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          width={200}
          height={200}
          className="w-full rounded-md object-cover"
        />
      </div>
      <div className="flex-1">
        <Link href={`/course/${course.id}`}>
          <h3 className="text-lg font-medium mb-1">{course.title}</h3>
          <p className="text-sm text-gray-700 mb-1">
            {truncateDescription(course.description)}
          </p>
          <div className="text-xs text-gray-600 mb-2">
            Created At: {new Date(course.createdAt).toLocaleDateString()}
          </div>
        </Link>
      </div>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 pb-6 border-b animate-pulse">
      <div className="md:w-48 flex-shrink-0">
        <Skeleton className="w-full h-32 md:h-48 rounded-md" />{" "}
        {/* Thumbnail Skeleton */}
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <Skeleton className="h-8 w-3/4" />{" "}
          {/* Title Skeleton (text-lg font-medium) */}
        </div>
        <div className="mb-1">
          <Skeleton className="h-6 w-full" />{" "}
          {/* Description Skeleton 1 (text-sm text-gray-700) */}
        </div>
        <div className="mb-2">
          <Skeleton className="h-6 w-2/3" />{" "}
          {/* Description Skeleton 2 (text-sm text-gray-700) */}
        </div>
        <div>
          <Skeleton className="h-4 w-1/4" />{" "}
          {/* Created At Skeleton (text-xs text-gray-600) */}
        </div>
      </div>
    </div>
  );
}
