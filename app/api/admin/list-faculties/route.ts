// app/api/admin/list-faculties/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      include: {
        teacherProfile: true,
        courses: true // Include courses for each teacher
      },
    });

    // Transform the data to a more suitable format if needed.  For example, if you want to flatten the profile data.
    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      firstName: teacher.teacherProfile?.firstName,
      lastName: teacher.teacherProfile?.lastName,
      phone: teacher.teacherProfile?.phone,
      department: teacher.teacherProfile?.department,
      subject: teacher.teacherProfile?.subject,
      position: teacher.teacherProfile?.position,
      yearsOfExperience: teacher.teacherProfile?.yearsOfExperience,
      profileImage: teacher.teacherProfile?.profileImage,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
      courseCount: teacher.courses.length // Number of courses taught by the teacher
    }));

    return NextResponse.json(formattedTeachers, { status: 200 });
  } catch (error: any) {
    console.error("Error listing faculties:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}