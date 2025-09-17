"use client";
import React, { useState } from "react";
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
import { useRouter } from "next/navigation";

const moduleSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Module title must be at least 2 characters" }),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface AddModuleProps {
  courseId: string;
}

export function AddModuleToCourse({ courseId }: AddModuleProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState(false); // Added state for AlertDialog open status

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: "" },
  });

  const { push } = useRouter();

  const handleAddModule = async (data: ModuleFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/course/${courseId}/modules/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        console.log("Module added successfully:", result);
        setAdded(true);
        form.reset();
        setTimeout(() => {
          push(window.location.pathname);
        }, 1000);
      } else {
        console.error("Failed to add module:", result.error);
      }
    } catch (error) {
      console.error("Error adding module:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen === true) {
          setAdded(false); // Reset added state when AlertDialog opens
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Module
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Module</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            className="w-full max-w-md flex flex-col space-y-4"
            onSubmit={form.handleSubmit(handleAddModule)}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Title</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter module title"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a title for the new module.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Adding Module..." : "Add Module"}
            </Button>
          </form>
        </Form>
        <AlertDialogDescription>
          {added
            ? "Module added successfully!"
            : "Fill out the form to add a new module."}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-primary">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
