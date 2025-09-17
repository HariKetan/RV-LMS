import { NextResponse } from "next/server";
import { getCourseWithModulesAndContent } from "@/actions/course/courseActions";

// GET /api/courses/[courseId]
export async function GET(
  request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Await params
    const { courseId } = await context.params;

    const course = await getCourseWithModulesAndContent(courseId);

    return NextResponse.json(course, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
