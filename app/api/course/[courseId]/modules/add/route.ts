import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addModuleToCourse } from "@/actions/course/courseActions";

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { courseId } = await context.params;
  const body = await request.json();

  try {
    const moduleAdded = await addModuleToCourse(courseId, body);
    return NextResponse.json(
      { success: "Module added successfully", moduleAdded },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding module:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
