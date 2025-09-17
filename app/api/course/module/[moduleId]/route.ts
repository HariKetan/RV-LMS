import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteModule, verifyOwnership } from "@/actions/course/courseActions";

// Define a custom type for the route parameters
type Params = Promise<{ moduleId: string }>;

export async function DELETE(
  request: Request,
  context: { params: Params } // Ensure params is treated as a promise
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId } = await context.params; // Await the params

  try {
    // Verify ownership BEFORE deleting
    const isOwner = await verifyOwnership(session, undefined, moduleId); // Pass moduleId

    if (!isOwner) {
      return NextResponse.json(
        { error: "Unauthorized - Not the owner" },
        { status: 403 }
      );
    }

    const deletedModule = await deleteModule(moduleId);

    if (!deletedModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: "Module deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
