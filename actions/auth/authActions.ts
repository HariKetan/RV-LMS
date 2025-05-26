"use server";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/prisma";
import { saltAndHashPassword } from "@/utils/helper";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

// Zod schema for signup validation
const signupSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

// Function to get user by email from the database
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const login = async (provider: string) => {
  await signIn(provider, { redirectTo: "/" });
  revalidatePath("/");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
};

export const loginWithCreds = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input using Zod
  const parsedData = loginSchema.safeParse({ email, password });
  if (!parsedData.success) {
    return { error: parsedData.error.errors.map((e) => e.message).join(", ") };
  }

  const rawFormData = {
    email,
    password,
    role: "USER",
    redirectTo: "/",
  };

  try {
    await signIn("credentials", rawFormData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
  revalidatePath("/");
};

export const signupWithCreds = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input using Zod
  const parsedData = signupSchema.safeParse({ name, email, password });
  if (!parsedData.success) {
    return { error: parsedData.error.errors.map((e) => e.message).join(", ") };
  }

  const rawFormData = {
    name: parsedData.data.name,
    email: parsedData.data.email,
    password: parsedData.data.password,
  };

  // Check if user already exists
  const existingUser = await getUserByEmail(rawFormData.email);
  if (existingUser) {
    return { error: "User already exists!" };
  }

  // Hash the password
  const hashedPassword = saltAndHashPassword(rawFormData.password);

  // Create new user
  try {
    const newUser = await prisma.user.create({
      data: {
        name: rawFormData.name,
        email: rawFormData.email,
        hashedPassword: hashedPassword,
        role: "USER", // Setting the role to USER by default
      },
    });

    return { success: "User created successfully!", user: newUser };
  } catch (error) {
    console.log(error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return { error: "Invalid signup details!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  } finally {
    revalidatePath("/");
  }
};
