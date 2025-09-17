import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateCourse } from "@/actions/course/courseActions";

// api/course/update.ts

export async function PUT(request: Request) {
  const session = await auth();

  if (
    !session ||
    !session.user ||
    (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { courseId, ...courseData } = await request.json(); // Extract courseId and the rest as courseData

    console.log("API Route: Received courseId:", courseId); // ADD THIS LINE
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Pass the extracted courseData to the updateCourse function
    const course = await updateCourse(courseId, courseData);
    console.log("API Route: Course updated successfully:", course); // ADD THIS LINE
    return NextResponse.json(
      { success: "Course updated successfully", course },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
