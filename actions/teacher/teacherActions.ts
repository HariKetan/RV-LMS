"use server";
import { prisma } from "@/prisma";
import { z } from "zod";

// Dummy implementation for reordering modules
export const reorderModules = async (
  courseId: string,
  moduleOrder: string[]
) => {
  // moduleOrder: array of module IDs in the new order.
  // Update each module's order accordingly (logic omitted for brevity)
  return { success: true };
};

// ====================================================
// Module Operations
// ====================================================

// Schema for a module (when adding a new module)
const moduleSchema = z.object({
  title: z.string().min(2, { message: "Module title is required." }),
});

export type ModuleInput = z.infer<typeof moduleSchema>;

export const addModuleToCourse = async (
  courseId: string,
  moduleData: unknown
) => {
  const parsed = moduleSchema.safeParse(moduleData);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  return await prisma.module.create({
    data: { ...parsed.data, courseId, order: 0 },
  });
};

export const updateModule = async (moduleId: string, moduleData: unknown) => {
  // Using partial update schema for module.
  const parsed = moduleSchema.partial().safeParse(moduleData);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  return await prisma.module.update({
    where: { id: moduleId },
    data: parsed.data,
  });
};

export const deleteModule = async (moduleId: string) => {
  return await prisma.module.delete({
    where: { id: moduleId },
  });
};

// ====================================================
// Content Item Operations
// ====================================================

// Schema for a content item (e.g., video or file)
const contentItemSchema = z.object({
  title: z.string().min(2, { message: "Content item title is required." }),
  description: z.string().optional(),
  order: z.number().optional(), // Order may be managed separately
  type: z.enum(["VIDEO", "PDF", "DOCX", "OTHER"]),
  fileUrl: z.string().url({ message: "File URL must be a valid URL." }),
});

export type ContentItemInput = z.infer<typeof contentItemSchema>;

export const addContentItem = async (
  moduleId: string,
  contentData: unknown
) => {
  const parsed = contentItemSchema.safeParse(contentData);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  return await prisma.contentItem.create({
    data: { ...parsed.data, moduleId, order: parsed.data.order ?? 0 },
  });
};

export const updateContentItem = async (
  contentItemId: string,
  contentData: unknown
) => {
  const parsed = contentItemSchema.partial().safeParse(contentData);
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map((e) => e.message).join(", "));
  }
  return await prisma.contentItem.update({
    where: { id: contentItemId },
    data: parsed.data,
  });
};

export const deleteContentItem = async (contentItemId: string) => {
  return await prisma.contentItem.delete({
    where: { id: contentItemId },
  });
};
