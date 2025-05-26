// pages/api/courses.ts (or wherever your endpoint is)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  listCourses,
  listEnrolledCourses,
} from "@/actions/course/courseActions"; //Import the function

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    let courses;
    const url = new URL(request.url);
    const facultyId = url.searchParams.get("facultyId");

    if (session.user.role === "TEACHER") {
      if (!session.user.id) {
        return NextResponse.json(
          { error: "User ID not found" },
          { status: 400 }
        );
      }
      courses = await listCourses(session.user.id as string);
    } else if (session.user.role === "ADMIN") {
      courses = await listCourses(facultyId || undefined);
    } else if (session.user.role === "USER") {
      if (!session.user.id) {
        return NextResponse.json(
          { error: "User ID not found" },
          { status: 400 }
        );
      }
      courses = await listEnrolledCourses(session.user.id as string);
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 }); // Handle cases with no/invalid roles
    }

    return NextResponse.json(courses, { status: 200 });
  } catch (error: any) {
    console.error("Error listing courses:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 } // Use 500 for server errors
    );
  }
}
