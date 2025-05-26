import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import React from "react";
import { notFound } from "next/navigation";
import {
  getCourseWithModulesAndContent,
  isUserEnrolled,
} from "@/actions/course/courseActions";
import { AddModuleToCourse } from "@/app/teacher/course/[courseId]/components/AddModuleToCourse";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { ContentItemDropdown } from "./ContentItemDropdown";
import { ModuleDropdown } from "./ModuleDropdown";
import EnrollButton from "./EnrollButton";

interface CourseContentProps {
  courseId: string;
  contentItemId?: string;
  /**
   * When true, it indicates the current page is the course detail page,
   * so the "View Course" button should be hidden.
   * If not passed (i.e. undefined), the default behavior is to render the EnrollButton.
   */
  isCourseDetailPage?: boolean;
}

// Component to display the selected content item details
const ContentItemDetails: React.FC<{ contentItem: any; course: any }> = ({
  contentItem,
  course,
}) => {
  const getFileTypeFromUrl = (
    url: string
  ): "VIDEO" | "PDF" | "IMAGE" | "OTHER" => {
    const urlLower = url.toLowerCase();
    if (
      urlLower.endsWith(".mp4") ||
      urlLower.endsWith(".mov") ||
      urlLower.endsWith(".webm")
    ) {
      return "VIDEO";
    } else if (urlLower.endsWith(".pdf")) {
      return "PDF";
    } else if (
      urlLower.endsWith(".jpg") ||
      urlLower.endsWith(".jpeg") ||
      urlLower.endsWith(".png") ||
      urlLower.endsWith(".gif")
    ) {
      return "IMAGE";
    } else {
      return "OTHER";
    }
  };

  const fileType = getFileTypeFromUrl(contentItem?.fileUrl || "");
  const channelName = "Unknown Teacher"; // Placeholder

  return (
    <div className="rounded-lg overflow-hidden">
      {fileType === "VIDEO" && (
        <video className="w-full aspect-video" controls>
          <source src={contentItem.fileUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {fileType === "IMAGE" && (
        <Image
          src={contentItem.fileUrl}
          alt={contentItem.title}
           width={400}
          height={400}
          className="rounded-md w-full min-h-1/2vh"
        />
      )}
      {fileType === "PDF" && (
        <embed
          src={contentItem.fileUrl}
          type="application/pdf"
          className="w-full"
          style={{ height: "60vh" }}
        />
      )}
      {fileType === "OTHER" && (
        <div className="pt-4 pb-4">
          <Button asChild className="w-full">
            <a
              href={contentItem.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download File
            </a>
          </Button>
        </div>
      )}
      <div className="mt-4">
        <h1 className="text-xl md:text-2xl font-bold mb-2">
          {contentItem.title}
        </h1>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 mr-4">
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm md:text-base">
                {channelName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Button variant="secondary" size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              10K
            </Button>
            <Button variant="secondary" size="sm">
              <ThumbsDown className="h-4 w-4 mr-2" />
              Dislike
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mb-4">
          {contentItem.createdAt.toDateString()}
        </p>
        <p className="text-xs md:text-sm">
          {contentItem.description || course.description}
        </p>
      </div>
    </div>
  );
};

// Component to display the course details when no content item is selected
const CourseDetails: React.FC<{ course: any }> = ({ course }) => {
  const {
    thumbnail: courseThumbnail,
    title: courseTitle,
    description: courseDescription,
    createdAt: courseCreatedAt,
  } = course;

  return (
    <div>
      {courseThumbnail && (
        <Image
          src={courseThumbnail}
          alt={courseTitle}
          width={400}
          height={400}
          className="rounded-md w-full min-h-1/2vh"
        />
      )}
      <div className="mt-4">
        <h1 className="text-xl md:text-2xl font-bold mb-2">{courseTitle}</h1>
        <p className="text-xs md:text-sm text-muted-foreground mb-4">
          {courseCreatedAt.toDateString()}
        </p>
        <p className="text-base">
          {courseDescription || "No description available"}
        </p>
      </div>
    </div>
  );
};

const CourseContent: React.FC<CourseContentProps> = async ({
  courseId,
  contentItemId,
  isCourseDetailPage, // optional flag provided from the server
}) => {
  const session = await auth();
  const userRole = session?.user?.role;
  const isLoggedIn = !!session?.user;

  try {
    const course = await getCourseWithModulesAndContent(courseId);

    if (!course) {
      notFound();
      return null;
    }

    let selectedContentItem = null;

    if (contentItemId) {
      // Find the content item directly using contentItemId
      for (const courseModule of course.modules) {
        const contentItem = courseModule.contentItems.find(
          (item: any) => item.id === contentItemId
        );
        if (contentItem) {
          selectedContentItem = contentItem;
          break;
        }
      }
    }

    let isEnrolled = false;
    if (isLoggedIn && userRole === "USER" && session?.user?.id) {
      isEnrolled = await isUserEnrolled(session.user.id, courseId);
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Section */}
          <div className="lg:col-span-2">
            {/* Render either ContentItemDetails or CourseDetails */}
            {selectedContentItem ? (
              <ContentItemDetails
                contentItem={selectedContentItem}
                course={course}
              />
            ) : (
              <CourseDetails course={course} />
            )}

            {/* For logged-in USER role: if not enrolled, render EnrollButton.
                If enrolled, render "View Course" only when isCourseDetailPage is explicitly provided and false. */}
            {isLoggedIn &&
              userRole === "USER" &&
              !selectedContentItem &&
              (!isEnrolled ? (
                <EnrollButton
                  courseId={courseId}
                  className="mt-4 max-w-40 w-full"
                />
              ) : typeof isCourseDetailPage !== "undefined" &&
                !isCourseDetailPage ? (
                <Link
                  href={`/user/course/${courseId}`}
                  className="inline-block mt-4 max-w-40 w-full"
                >
                  <Button className="w-full">View Course</Button>
                </Link>
              ) : null)}
          </div>

          {/* Sidebar Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Course Modules
              </h2>
              {userRole === "TEACHER" && (
                <AddModuleToCourse courseId={courseId} />
              )}
            </div>
            <Accordion
              type="single"
              collapsible
              className="w-full border rounded-lg shadow divide-y divide-gray-300 dark:divide-gray-700"
            >
              {course.modules?.map((module: any, index: number) => (
                <AccordionItem
                  key={index}
                  value={`module-${index}`}
                  className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <AccordionTrigger className="flex items-center justify-between p-4 text-lg font-semibold max-w-full">
                    <div className="flex-1 overflow-hidden text-left truncate text-gray-800 dark:text-gray-100">
                      {module.title}
                    </div>
                    <div className="ml-4 mr-4 flex-shrink-0">
                      {userRole === "TEACHER" && (
                        <ModuleDropdown
                          courseId={courseId}
                          moduleId={module.id}
                        />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white dark:bg-gray-800">
                    {module.contentItems?.map(
                      (item: { id: string; title: string }, idx: number) => (
                        <div
                          key={idx}
                          className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors border-b last:border-b-0 flex items-center justify-between border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center flex-1">
                            <span className="mr-2 text-gray-500 dark:text-gray-400 font-mono">
                              {idx + 1}.
                            </span>
                            {isLoggedIn && userRole !== null ? (
                              <Link
                                href={`?contentItemId=${item.id}`}
                                className="flex-1 font-medium truncate text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <span className="flex-1 font-medium truncate text-gray-500 dark:text-gray-400">
                                {item.title}
                              </span>
                            )}
                          </div>
                          {isLoggedIn && userRole === "TEACHER" && (
                            <ContentItemDropdown contentItemId={item.id} />
                          )}
                        </div>
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return <div>Error loading course data.</div>;
  }
};

export default CourseContent;
