"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allowedTypes = ["VIDEO", "PDF", "DOCX", "OTHER"] as const;
const forbiddenExtensions = [
  "exe",
  "sh",
  "bat",
  "cmd",
  "js",
  "php",
  "py",
  "rb",
  "pl",
];

interface ContentItemSchema {
  title: string;
  description?: string;
  type: (typeof allowedTypes)[number];
  contentFile: File | string; // Changed to File | string
}

const contentItemSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  type: z.enum(allowedTypes, { message: "Invalid file type." }),
  contentFile: z.any(), // Changed to any because file can be file object or string
});

type ContentItemFormData = z.infer<typeof contentItemSchema>;

interface AddContentToModuleProps {
  courseId: string;
  moduleId: string;
}

export function AddContentToModule({
  courseId,
  moduleId,
}: AddContentToModuleProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null); // State to hold filename
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold file
  const [fileUrl, setFileUrl] = useState<string | null>(null); // State to hold the uploaded file URL
  const [open, setOpen] = useState(false); // Add the 'open' state here.
  const [acceptedFileTypes, setAcceptedFileTypes] = useState<string>("");

  const form = useForm<ContentItemFormData>({
    resolver: zodResolver(contentItemSchema),
    defaultValues: {
      title: "",
      description: "",
      type: undefined,
      contentFile: null,
    },
  });

  const { watch, setValue } = form; // Access watch and setValue

  const { refresh } = useRouter();

  const handleAddContentItem = async (data: ContentItemFormData) => {
    setLoading(true);
    try {
      // Then, add the content item using the returned fileUrl
      const contentItemPayload = {
        title: data.title,
        description: data.description,
        type: data.type,
        fileUrl: fileUrl,
      };

      const response = await fetch(
        `/api/course/${courseId}/modules/${moduleId}/content-items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentItemPayload),
        }
      );
      const result = await response.json();

      if (response.ok) {
        console.log("Content item added successfully:", result);
        setAdded(true);
        form.reset();
        setPreview(null);
        setSelectedFileName(null); // Clear filename
        setSelectedFile(null); // Clear selected file
        setValue("contentFile", null); // Reset the file value
        setFileUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        refresh();
      } else {
        console.error("Failed to add content item:", result.error);
      }
    } catch (error) {
      console.error("Error adding content item:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine if a file is an image type
  const isImageType = (file: File) => {
    return file.type.startsWith("image/");
  };

  // Function to determine if a file is a video type
  const isVideoType = (file: File) => {
    return file.type.startsWith("video/");
  };

  // Watch for changes in the "type" field
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "type") {
        // Reset contentFile field when type changes
        setValue("contentFile", null);
        setSelectedFile(null);
        setPreview(null);
        setSelectedFileName(null);
        setFileUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the file input
        }

        // Update accepted file types based on selected type
        switch (value.type) {
          case "VIDEO":
            setAcceptedFileTypes("video/*");
            break;
          case "PDF":
            setAcceptedFileTypes(".pdf");
            break;
          case "DOCX":
            setAcceptedFileTypes(".docx");
            break;
          case "OTHER":
            setAcceptedFileTypes("*"); // Allow all file types
            break;
          default:
            setAcceptedFileTypes(""); // No accepted file types
            break;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, fileInputRef]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedFileName(file.name);

      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const uploadResponse = await fetch("/api/upload-file", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("File upload failed");
        }

        const uploadResult = await uploadResponse.json();
        console.log("uploadResult:", uploadResult);
        const fileUrl = uploadResult.path; // Get the relative path from the backend

        if (!fileUrl) {
          throw new Error("File URL not received from upload");
        }

        // Construct the full URL using NEXT_PUBLIC_SITE_URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ""; // Add a fallback
        const fullUrl = `${baseUrl}${fileUrl}`; // Concatenate the base URL and relative path

        setFileUrl(fullUrl); // Store the full URL in state
        setValue("contentFile", fullUrl); // Store the full URL in the form

        if (isImageType(file) || isVideoType(file)) {
          // Create preview URL based on the original file (local URL)
          setPreview(URL.createObjectURL(file));
        } else {
          setPreview(null);
        }
        setAdded(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle error appropriately
      }
    } else {
      setSelectedFile(null);
      setPreview(null);
      setSelectedFileName(null);
      setFileUrl(null);
      setValue("contentFile", null);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen === true) {
          setAdded(false);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <span className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground">
          Add Content
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Add Content Item</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            className="w-full max-w-md flex flex-col space-y-4"
            onSubmit={form.handleSubmit(handleAddContentItem)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a title for the content item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter an optional description.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a file type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allowedTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contentFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Upload</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      accept={acceptedFileTypes}
                    />
                  </FormControl>
                  <FormDescription>Select a file to upload.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {preview && (
              <div className="flex justify-center items-center p-4">
                {selectedFile && isImageType(selectedFile) && (
                  <Image
                    src={preview}
                    alt="File Preview"
                    className="max-w-full h-20 w-20"
                    height={80}
                    width={80}
                  />
                )}
                {selectedFile && isVideoType(selectedFile) && (
                  <video
                    src={preview}
                    className="max-w-full h-20 w-20"
                    controls
                  />
                )}
              </div>
            )}
            {selectedFileName && !preview && (
              <div className="flex justify-center items-center p-4">
                Filename: {selectedFileName}
              </div>
            )}
            <Button type="submit" disabled={loading || !fileUrl}>
              {loading ? "Adding Content Item..." : "Add Content Item"}
            </Button>
          </form>
        </Form>
        <AlertDialogDescription>
          {loading
            ? "Uploading and adding content item..."
            : added
            ? "Content item added successfully!"
            : "Fill out the form to add a new content item."}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-primary">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
