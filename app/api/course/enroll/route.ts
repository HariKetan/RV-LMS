// pages/api/enroll.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { enrollInCourse } from "@/actions/course/courseActions";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { courseId } = await request.json(); // Assuming the courseId is sent in the request body

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { error: "Valid Course ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const enrollment = await enrollInCourse(userId, courseId);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Failed to enroll in course" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully enrolled in course", enrollment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
