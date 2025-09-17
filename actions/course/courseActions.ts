"use server";

import { prisma } from "@/prisma";
import { z } from "zod";
import { Session } from "next-auth";
import { Enrollment, Prisma } from "@prisma/client";

// ====================================================
// Schemas
// ====================================================

// Course Schemas
const createCourseSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Course title must be at least 2 characters." }),
  description: z.string().optional(),
  subject: z.string().optional(),
  language: z.string().optional(),
  thumbnail: z
    .string()
    .url({ message: "Thumbnail must be a valid URL." })
    .optional(),
  published: z.boolean().optional(), // Add published field here
  modules: z
    .array(
      z.object({
        title: z.string().min(2, { message: "Module title is required." }),
      })
    )
    .optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// For updating a course, all fields are optional.
const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// Module Schemas
const createModuleSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Module title must be at least 2 characters" }),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

// Content Item Schemas
const createContentItemSchema = z.object({
  title: z.string().min(2, { message: "Content item title is required" }),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "DOCX", "OTHER"]), // Define content types
  fileUrl: z
    .string()
    .url({ message: "File URL is required and must be a valid URL" }), // Validate URL is required
});

export type CreateContentItemInput = z.infer<typeof createContentItemSchema>;

//List and Filter Schema
const listCoursesSchema = z.object({
  userId: z.string().optional(),
  query: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "enrollmentCount", "averageRating"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  teacherId: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export type ListCoursesParams = z.infer<typeof listCoursesSchema>;

// ====================================================
// Utility Functions
// ====================================================

// Utility function to handle schema parsing and error throwing
const parseAndHandleError = <Schema extends z.ZodSchema>(
  schema: Schema,
  data: unknown // Keep unknown here, as we don't know the type of data being passed in
): z.infer<Schema> => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map((e) => e.message).join(", ");
    console.error("Validation Error:", errorMessages); // Log validation errors
    throw new Error(`Validation Error: ${errorMessages}`);
  }
  return parsed.data;
};

// Utility function for common error handling in Prisma operations
const handlePrismaError = (operationName: string, error: any): never => {
  console.error(`Prisma Error ${operationName}:`, error);
  throw new Error(error.message || `Failed to ${operationName}`);
};

// Generic delete function to reduce code duplication
const deleteEntity = async <T>(
  entityName: string,
  id: string,
  deleteFn: (id: string) => Promise<T>
): Promise<T | null> => {
  try {
    return await deleteFn(id);
  } catch (error) {
    handlePrismaError(`deleting ${entityName}`, error);
    return null;
  }
};

// ====================================================
// Course Actions
// ====================================================

/**
 * Creates a new course.
 *
 * @param {string} teacherId - The ID of the teacher creating the course.
 * @param {unknown} courseData - The data for the course to be created.
 * @returns {Promise<Course | null>} - The created course, or null if creation fails.
 */
export const createCourse = async (teacherId: string, courseData: unknown) => {
  try {
    const parsedCourseData = parseAndHandleError(
      createCourseSchema,
      courseData
    );

    const course = await prisma.course.create({
      data: {
        ...parsedCourseData,
        description: parsedCourseData.description ?? "",
        teacherId,
        modules: {
          // Create modules along with the course
          create: parsedCourseData.modules?.map((module, index) => ({
            title: module.title,
            order: index + 1, // Set order based on array index
          })),
        },
      },
      include: {
        modules: true, // Include the created modules in the result
      },
    });
    return course;
  } catch (error) {
    handlePrismaError("creating course with modules", error);
    return null;
  }
};

/**
 * Updates an existing course.
 *
 * @param {string} courseId - The ID of the course to update.
 * @param {UpdateCourseInput} courseData - The data to update the course with.
 * @returns {Promise<Course | null>} - The updated course, or null if the update fails.
 */
export const updateCourse = async (
  courseId: string,
  courseData: UpdateCourseInput
) => {
  try {
    console.log(
      "updateCourse: Received courseId:",
      courseId,
      "courseData:",
      courseData
    );

    const parsedCourseData = parseAndHandleError(
      updateCourseSchema,
      courseData
    );

    const { modules, ...restParsedCourseData } = parsedCourseData;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...restParsedCourseData,
      },
    });

    console.log("updateCourse: Course updated in database:", updatedCourse);

    return updatedCourse;
  } catch (error) {
    handlePrismaError("updating course", error);
    return null;
  }
};

/**
 * Deletes a course.
 *
 * @param {string} courseId - The ID of the course to delete.
 * @returns {Promise<Course | null>} - The deleted course, or null if deletion fails.
 */
export const deleteCourse = async (courseId: string) => {
  return deleteEntity("course", courseId, async (id) =>
    prisma.course.delete({ where: { id } })
  );
};

/**
 * Retrieves a list of courses, optionally filtered by user ID.
 *
 * @param {string} [userId] - Optional user ID to filter courses by.
 * @returns {Promise<Course[] | null>} - An array of courses, or null if retrieval fails.
 */
export const listCourses = async (userId?: string) => {
  try {
    const whereClause = userId ? { teacherId: userId } : undefined;
    return await prisma.course.findMany({
      where: whereClause,
    });
  } catch (error) {
    handlePrismaError("listing courses", error);
    return null;
  }
};

/**
 * Retrieves a list of courses a user is enrolled in.
 *
 * @param {string} userId -  User ID to filter courses by.
 * @returns {Promise<Course[] | null>} - An array of courses, or null if retrieval fails.
 */
export const listEnrolledCourses = async (userId: string) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: true, //  Include the course details for each enrollment
      },
    });

    // Extract the courses from the enrollments
    const courses = enrollments.map((enrollment) => enrollment.course);

    return courses;
  } catch (error) {
    handlePrismaError("listing enrolled courses", error);
    return null;
  }
};

/**
 * Enrolls a user in a course.
 *
 * @param {string} userId - The ID of the user to enroll.
 * @param {string} courseId - The ID of the course to enroll in.
 * @returns {Promise<Enrollment | null>} - The created enrollment record, or null if it fails.
 */
export const enrollInCourse = async (
  userId: string,
  courseId: string
): Promise<Enrollment | null> => {
  try {
    // Check if the user is already enrolled in the course to avoid duplicate enrollments
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      console.log("User is already enrolled in this course.");
      return existingEnrollment; // Or throw an error, depending on your desired behavior
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: userId,
        courseId: courseId,
      },
    });

    return enrollment;
  } catch (error) {
    handlePrismaError("enrolling user in course", error);
    return null;
  }
};

/**
 * Checks if a user is already enrolled in a course.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} courseId - The ID of the course.
 * @returns {Promise<boolean>} - True if the user is enrolled, false otherwise.
 */
export const isUserEnrolled = async (
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    return !!enrollment; // Returns true if enrollment exists, false otherwise
  } catch (error) {
    handlePrismaError("checking if user is enrolled", error);
    return false; // Return false in case of error to prevent accidental access
  }
};

/**
 * Retrieves a single course with its modules and content items.
 *
 * @param {string} courseId - The ID of the course to retrieve.
 * @returns {Promise<Course | null>} - The course with its modules and content items, or null if not found.
 */
export const getCourseWithModulesAndContent = async (courseId: string) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            contentItems: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  } catch (error) {
    handlePrismaError("fetching course with modules and content", error);
    return null;
  }
};

// ====================================================
// Module Actions
// ====================================================

/**
 * Adds a module to a course.
 *
 * @param {string} courseId - The ID of the course to add the module to.
 * @param {unknown} moduleData - The data for the module to be added.
 * @returns {Promise<Module | null>} - The added module, or null if the add fails.
 */
export const addModuleToCourse = async (
  courseId: string,
  moduleData: unknown
) => {
  try {
    const parsedModuleData = parseAndHandleError(
      createModuleSchema,
      moduleData
    );
    const moduleCount = await prisma.module.count({
      // Get the count of existing modules for ordering
      where: { courseId: courseId },
    });

    const module = await prisma.module.create({
      data: {
        ...parsedModuleData,
        courseId: courseId,
        order: moduleCount + 1, // Set the order to the next available
      },
    });
    return module;
  } catch (error) {
    handlePrismaError("adding module to course", error);
    return null;
  }
};

/**
 * Deletes a module.
 *
 * @param {string} moduleId - The ID of the module to delete.
 * @returns {Promise<Module | null>} - The deleted module, or null if the deletion fails.
 */
export const deleteModule = async (moduleId: string) => {
  return deleteEntity("module", moduleId, async (id) =>
    prisma.module.delete({ where: { id } })
  );
};

// ====================================================
// Content Item Actions
// ====================================================

/**
 * Adds a content item to a module.
 *
 * @param {string} moduleId - The ID of the module to add the content item to.
 * @param {unknown} contentItemData - The data for the content item to be added.
 * @returns {Promise<ContentItem | null>} - The added content item, or null if adding fails.
 */
export const addContentItemToModule = async (
  moduleId: string,
  contentItemData: unknown
) => {
  try {
    const parsedContentItemData = parseAndHandleError(
      createContentItemSchema,
      contentItemData
    );
    const contentItemCount = await prisma.contentItem.count({
      // Get the count of existing contentItems for ordering
      where: { moduleId: moduleId },
    });

    const contentItem = await prisma.contentItem.create({
      data: {
        ...parsedContentItemData,
        moduleId: moduleId,
        order: contentItemCount + 1, // Set the order to the next available
      },
    });
    return contentItem;
  } catch (error) {
    handlePrismaError("adding content item to module", error);
    return null;
  }
};

/**
 * Deletes a content item.
 *
 * @param {string} contentItemId - The ID of the content item to delete.
 * @returns {Promise<ContentItem | null>} - The deleted content item, or null if deletion fails.
 */
export const deleteContentItem = async (contentItemId: string) => {
  return deleteEntity("content item", contentItemId, async (id) =>
    prisma.contentItem.delete({ where: { id } })
  );
};

// ====================================================
// Filtering and Sorting Actions
// ====================================================
/**
 * Retrieves a list of courses with applied filters, sorting, and pagination.
 *
 * @param {ListCoursesParams} params - Parameters for filtering, sorting, and pagination.
 * @returns {Promise<{ courses: Course[]; totalCount: number; currentPage: number; totalPages: number; }>} - An object containing the courses, total count, current page, and total pages.
 */
export const listCoursesWithFilters = async (params: ListCoursesParams) => {
  try {
    const parsedParams = listCoursesSchema.parse(params);

    const { userId, query, sortBy, sortOrder, teacherId, page, limit } =
      parsedParams;

    const whereClause: Prisma.CourseWhereInput = {
      published: true, // ENFORCE published: true
    };

    if (userId) {
      whereClause.teacherId = userId;
    }

    if (query) {
      whereClause.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          courseCode: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    let courses: any[];
    let totalCount: number;

    if (sortBy === "enrollmentCount") {
      [courses, totalCount] = await Promise.all([
        prisma.course.findMany({
          where: whereClause,
          orderBy: {
            enrollments: {
              _count: sortOrder === "asc" ? "asc" : "desc",
            },
          },
          skip,
          take: limit,
        }),
        prisma.course.count({
          where: whereClause,
        }),
      ]);
    } else {
      const orderBy: any = {};
      if (sortBy && sortBy !== "averageRating") {
        orderBy[sortBy] = sortOrder || "asc";
      } else {
        orderBy.createdAt = "desc"; // Default
      }

      [courses, totalCount] = await Promise.all([
        prisma.course.findMany({
          where: whereClause,
          orderBy: orderBy,
          skip,
          take: limit,
        }),
        prisma.course.count({
          where: whereClause,
          orderBy: orderBy,
        }),
      ]);
    }

    return {
      courses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error listing courses:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error Code:", error.code);
      console.error("Prisma Error Message:", error.message);
    }
    if (error instanceof Error) {
      throw new Error(`Failed to list courses: ${error.message}`);
    } else {
      throw new Error("Failed to list courses: Unknown error");
    }
  }
};

// ====================================================
// Authorization Actions
// ====================================================

/**
 * Verifies ownership of content item or module by teacher or admin.
 *
 * @param {Session | null} session - The user session.
 * @param {string} [contentItemId] - The ID of the content item (optional).
 * @param {string} [moduleId] - The ID of the module (optional).
 * @returns {Promise<boolean>} - True if the user is authorized, false otherwise.
 */
export const verifyOwnership = async (
  session: Session | null,
  contentItemId?: string,
  moduleId?: string
): Promise<boolean> => {
  if (!session || !session.user) {
    return false; // No session, no access
  }

  if (session.user.role === "ADMIN") {
    return true; // Admins bypass ownership check
  }

  const userId = session.user.id;

  try {
    if (contentItemId) {
      const contentItem = await prisma.contentItem.findUnique({
        where: { id: contentItemId },
        include: { module: { include: { course: true } } },
      });

      if (!contentItem) {
        return false; // Content item not found
      }

      return contentItem.module.course.teacherId === userId;
    } else if (moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { course: true },
      });

      if (!module) {
        return false; // Module not found
      }

      return module.course.teacherId === userId;
    } else {
      return false; // No contentItemId or moduleId provided
    }
  } catch (error) {
    console.error("Error verifying ownership:", error);
    return false; // Error during verification, deny access
  }
};
