import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteContentItem,
  verifyOwnership,
} from "@/actions/course/courseActions";

// Define a custom type for the route parameters
type Params = Promise<{ contentItemId: string }>;

export async function DELETE(
  request: Request,
  context: { params: Params } // Use the promise-based type for params
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { contentItemId } = await context.params;

  try {
    // Verify ownership BEFORE deleting
    const isOwner = await verifyOwnership(session, contentItemId, undefined); // Pass contentItemId

    if (!isOwner) {
      return NextResponse.json(
        { error: "Unauthorized - Not the owner" },
        { status: 403 }
      );
    }

    const deletedContentItem = await deleteContentItem(contentItemId);

    if (!deletedContentItem) {
      return NextResponse.json(
        { error: "Content item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: "Content item deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting content item:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
