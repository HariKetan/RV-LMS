"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";

// Zod schema for creating a course (without contentItems)
const createCourseSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Course title must be at least 2 characters." }),
  description: z.string().optional(),
  courseCode: z.string().optional(),
  thumbnail: z
    .string()
    .url({ message: "Thumbnail must be a valid URL." })
    .optional(),
  modules: z
    .array(
      z.object({
        title: z.string().min(2, { message: "Module title is required." }),
      })
    )
    .optional(),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

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

// Thumbnail upload component
function ThumbnailUpload({
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

  return (
    <div className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded-md">
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
          ? "Change Thumbnail"
          : "Upload Thumbnail"}
      </label>
      {value && (
        <Image
          src={`${value}`}
          alt="Thumbnail preview"
          className="mt-2 h-32 w-auto object-cover rounded-md"
          height={128}
          width={128}
        />
      )}
    </div>
  );
}

export default function CreateCoursePage() {
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const router = useRouter(); // Initialize useRouter

  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      courseCode: "",
      thumbnail: "",
      modules: [],
    },
  });

  const {
    fields: moduleFields,
    append: moduleAppend,
    remove: moduleRemove,
  } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  const onSubmit = async (data: CreateCourseFormValues) => {
    setLoading(true);
    setSuccessMessage("");
    try {
      const response = await fetch("/api/course/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // DO NOT EXTRACT THE MODULES
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create course");
      }

      setSuccessMessage("Course created successfully!");
      form.reset();

      // Use useRouter to navigate after successful course creation
      router.push(`/teacher/course/${result.course.id}`);
    } catch (error: any) {
      console.error("Error creating course:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 pt-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Create Course</h1>
      {successMessage && (
        <p className="mb-4 text-green-600">{successMessage}</p>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Course Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Course Description using Textarea */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter course description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
          {/* Course Code */}
          <FormField
            control={form.control}
            name="courseCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input placeholder="Course Code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Upload */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <ThumbnailUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Modules</h3>
              <Button type="button" onClick={() => moduleAppend({ title: "" })}>
                Add Module
              </Button>
            </div>
            {moduleFields.map((moduleField, index) => (
              <div
                key={moduleField.id}
                className="space-y-2 border p-4 rounded-md"
              >
                <FormField
                  control={form.control}
                  name={`modules.${index}.title` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter module title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="destructive"
                  onClick={() => moduleRemove(index)}
                >
                  Remove Module
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Course..." : "Create Course"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
