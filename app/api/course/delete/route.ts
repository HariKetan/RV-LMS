import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteCourse } from "@/actions/course/courseActions";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }
  
  try {
    const course = await deleteCourse(courseId);
    return NextResponse.json(
      { success: "Course deleted successfully", course },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
