import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCourse } from "@/actions/course/courseActions";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  try {
    if (!session.user.id) {
      return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
    }
    const course = await createCourse(session.user.id, body);
    return NextResponse.json(
      { success: "Course created successfully", course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}