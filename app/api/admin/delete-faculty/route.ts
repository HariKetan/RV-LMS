// app/api/admin/delete-faculty/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { teacherId } = await request.json();

    // Delete the teacher's profile first to satisfy FK constraints.  Handle the case where a teacher might not have a profile.
    const teacher = await prisma.user.findUnique({
      where: {
        id: teacherId
      },
      include: {
        teacherProfile: true
      }
    })

    if (!teacher) {
      return NextResponse.json({error: "Teacher not found"}, {status: 404});
    }

    if (teacher.teacherProfile) {
      await prisma.teacherProfile.delete({
        where: {
          userId: teacherId,
        },
      });
    }

    // Now delete the user.
    await prisma.user.delete({
      where: {
        id: teacherId,
      },
    });

    return NextResponse.json(
      { success: "Faculty deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting faculty:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}