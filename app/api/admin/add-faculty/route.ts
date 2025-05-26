// app/api/admin/add-faculty/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { saltAndHashPassword } from "@/utils/helper";
import { z } from "zod";

const teacherRegistrationSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  department: z.string().min(2, { message: "Department is required." }),
  subject: z.string().min(2, { message: "Subject is required." }),
  position: z.string().min(2, { message: "Position is required." }),
  yearsOfExperience: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "Years of experience is required." })
  ),
  profileImage: z
    .string()
    .url({ message: "Invalid profile image URL." })
    .optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = teacherRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      department,
      subject,
      position,
      yearsOfExperience,
      profileImage,
    } = parsed.data;

    // Check if a user with this email already exists.
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.role === "TEACHER") {
        return NextResponse.json(
          { error: "User already exists as a teacher." },
          { status: 400 }
        );
      } else {
        // Update the existing user to become a teacher.
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            role: "TEACHER",
            hashedPassword: saltAndHashPassword(password),
            teacherProfile: {
              create: {
                firstName,
                lastName,
                phone,
                department,
                subject,
                position,
                yearsOfExperience,
                profileImage,
              },
            },
          },
        });
        return NextResponse.json(
          {
            success: "User updated to teacher successfully",
            user: updatedUser,
          },
          { status: 200 }
        );
      }
    }

    // Create a new teacher if no user exists.
    const hashedPassword = saltAndHashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        hashedPassword,
        role: "TEACHER",
        teacherProfile: {
          create: {
            firstName,
            lastName,
            phone,
            department,
            subject,
            position,
            yearsOfExperience,
            profileImage,
          },
        },
      },
    });

    return NextResponse.json(
      { success: "Faculty created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating faculty:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
