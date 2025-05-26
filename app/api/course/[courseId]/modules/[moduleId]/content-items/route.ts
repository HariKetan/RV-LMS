import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addContentItemToModule } from "@/actions/course/courseActions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Await the params object
  const { moduleId } = await params;
  const body = await request.json();

  try {
    const contentItem = await addContentItemToModule(moduleId, body);
    return NextResponse.json(
      {
        success: "Content item added successfully",
        contentItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding content item:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
