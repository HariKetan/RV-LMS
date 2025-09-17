import { NextResponse } from "next/server";
import {
  listCoursesWithFilters,
  ListCoursesParams,
} from "@/actions/course/courseActions";

const parseQueryParams = (url: URL): ListCoursesParams => {
  const params: any = {};

  const addParam = (
    paramName: keyof ListCoursesParams,
    getter: () => string | null,
    transform?: (value: string) => any
  ) => {
    const value = getter();
    if (value !== null && value !== undefined) {
      params[paramName] = transform ? transform(value) : value;
    }
  };

  addParam("query", () => url.searchParams.get("query"));
  addParam("sortBy", () => url.searchParams.get("sortBy"));
  addParam("sortOrder", () => url.searchParams.get("sortOrder"));
  addParam("teacherId", () => url.searchParams.get("teacherId"));
  addParam(
    "page",
    () => url.searchParams.get("page"),
    (value) => {
      const page = parseInt(value, 10);
      return isNaN(page) || page < 1 ? 1 : page;
    }
  );
  addParam(
    "limit",
    () => url.searchParams.get("limit"),
    (value) => {
      const limit = parseInt(value, 10);
      return isNaN(limit) || limit < 1 ? 10 : limit;
    }
  );

  return params as ListCoursesParams;
};

const handleApiError = (
  error: any,
  message = "Internal Server Error",
  statusCode = 500
) => {
  console.error("API Error:", error);
  return NextResponse.json(
    { error: error.message || message },
    { status: statusCode }
  );
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = parseQueryParams(url);
    const coursesResult = await listCoursesWithFilters(params);

    return NextResponse.json(coursesResult, { status: 200 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
