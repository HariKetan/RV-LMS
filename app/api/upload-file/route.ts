import { NextResponse } from "next/server";
import { auth } from "@/auth";
import uploadFile from "@/actions/content/uploadActions";

export async function POST(request: Request) {
  const session = await auth();
  
  // Check if the user is authenticated and has the "TEACHER" role
  if (!session || !session.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    // Extract the file from the request body
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
    }

    // Proceed with the file upload
    const result = await uploadFile(file);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: "File uploaded successfully", path: result.path }, { status: 200 });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
