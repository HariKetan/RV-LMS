"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { JSX } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { useState, useCallback } from "react"; // Import useState and useCallback
import Image from "next/image";

// Define the schema for the teacher registration form including password and position.
const teacherFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  department: z.string().min(2, { message: "Department is required" }),
  subject: z.string().min(2, { message: "Subject is required" }),
  position: z.enum(["Associate Professor", "Assistant Professor", "Professor"]),
  yearsOfExperience: z.preprocess(
    (val) => Number(val),
    z.number().min(0, { message: "Years of experience is required" })
  ),
  profileImage: z.string().optional(), // Changed to store base64 or URL
});

type TeacherFormValues = z.infer<typeof teacherFormSchema>;

// API function for uploading thumbnail
async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-file", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload thumbnail");
  }

  const data = await response.json();
  return data.path;
}

function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const url = await uploadThumbnail(file);
      const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${url}`;
      onChange(fullUrl);
      setUploading(false);
    }
  };

  // **Drag and Drop Handlers**
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default to allow drop
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default action (open as link for some elements)
    setUploading(true);

    if (event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file) {
        // **Basic File Type Validation**  (Enhance this!)
        if (!file.type.startsWith("image/")) {
          console.error("Not an image file.");
          setUploading(false);
          // Potentially show an error message to the user.
          return;
        }

        const url = await uploadThumbnail(file);
        const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL}${url}`;
        onChange(fullUrl);
        setUploading(false);
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded-md"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="thumbnail-upload"
        onChange={handleFileChange}
      />
      <label htmlFor="thumbnail-upload" className="cursor-pointer">
        {uploading
          ? "Uploading..."
          : value
          ? "Change Profile Image or Drag & Drop Here"
          : "Upload Profile Image or Drag & Drop Here"}
      </label>
      {value && (
        <Image
          src={`${value}`}
          alt="Thumbnail preview"
          className="mt-2 h-32 w-auto object-cover rounded-md"
        />
      )}
    </div>
  );
}

export function FacultyRegistrationForm(): JSX.Element {
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      subject: "",
      position: "Assistant Professor", // Default position
      yearsOfExperience: 0,
      profileImage: "",
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");

  const onSubmit = async (data: TeacherFormValues) => {
    setLoading(true);
    setSuccessMessage("");
    try {
      const res = await fetch("/api/admin/add-faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to create faculty");
      }
      setSuccessMessage("Faculty created successfully!");
      form.reset();
    } catch (error: any) {
      console.error("Error registering faculty:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      {successMessage && (
        <p className="mb-4 text-green-600">{successMessage}</p>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-6 w-full"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Associate Professor">
                      Associate Professor
                    </SelectItem>
                    <SelectItem value="Assistant Professor">
                      Assistant Professor
                    </SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Years of Experience"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profileImage"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Faculty"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FacultyRegistrationForm;
