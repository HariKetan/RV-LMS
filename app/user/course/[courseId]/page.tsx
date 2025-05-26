import CourseContent from "@/components/course-content/CourseContent";

interface CourseVideoPageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ contentItemId?: string }>;
}

const ContentItemPage = async (props: CourseVideoPageProps) => {
  const { courseId } = await props.params;
  const { contentItemId } = await props.searchParams;

  return <CourseContent courseId={courseId} contentItemId={contentItemId} />;
};

export default ContentItemPage;
