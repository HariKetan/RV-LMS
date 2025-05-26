// app/api/admin/update-faculty/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { z } from "zod";

// Define a schema for the update request body.  Make fields optional so we can update selectively
const teacherUpdateSchema = z.object({
  teacherId: z.string().min(1), // Ensure we have a teacher ID

  // User fields
  email: z.string().email().optional(),
  name: z.string().optional(),

  // TeacherProfile fields - making all optional
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  subject: z.string().optional(),
  position: z.string().optional(),
  yearsOfExperience: z.preprocess(
    (val) => (val != null ? Number(val) : undefined),  //Allow null or undefined
    z.number().optional()
  ),
  profileImage: z.string().url().optional(),
}).refine(
  (data) =>
    data.email ||
    data.name ||
    data.firstName ||
    data.lastName ||
    data.phone ||
    data.department ||
    data.subject ||
    data.position ||
    data.yearsOfExperience !== undefined || //Check for undefined explicitly
    data.profileImage,
  "At least one field must be provided for update"
);

export async function PUT(request: Request) {  // Or PATCH, depending on your preference
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = teacherUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { teacherId, ...updateData } = parsed.data;

    // Separate updates for User and TeacherProfile
    const userUpdate: any = {};
    const profileUpdate: any = {};

    if (updateData.email) {
      userUpdate.email = updateData.email;
    }
    if (updateData.name) {
      userUpdate.name = updateData.name;
    }

    if (updateData.firstName) {
      profileUpdate.firstName = updateData.firstName;
    }
    if (updateData.lastName) {
      profileUpdate.lastName = updateData.lastName;
    }
    if (updateData.phone) {
      profileUpdate.phone = updateData.phone;
    }
    if (updateData.department) {
      profileUpdate.department = updateData.department;
    }
    if (updateData.subject) {
      profileUpdate.subject = updateData.subject;
    }
    if (updateData.position) {
      profileUpdate.position = updateData.position;
    }
    if (updateData.yearsOfExperience !== undefined) {
      profileUpdate.yearsOfExperience = updateData.yearsOfExperience;
    }
    if (updateData.profileImage) {
      profileUpdate.profileImage = updateData.profileImage;
    }

    // Start the transaction
    const [updatedUser, updatedProfile] = await prisma.$transaction([
        prisma.user.update({
            where: { id: teacherId },
            data: userUpdate,
        }),
        prisma.teacherProfile.update({
            where: { userId: teacherId },
            data: profileUpdate,
        })
    ])

    return NextResponse.json(
      { success: "Faculty updated successfully", updatedUser, updatedProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating faculty:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}