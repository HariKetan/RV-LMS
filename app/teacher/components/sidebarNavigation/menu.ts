import {
  BookPlusIcon,
  PlusCircleIcon,
  LayoutDashboardIcon,
} from "lucide-react";

export const menu = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/teacher/dashboard",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "My Courses",
      url: "/teacher/my-courses",
      icon: BookPlusIcon,
      isActive: true,
    },
    {
      title: "Create Course",
      url: "/teacher/course/create",
      icon: PlusCircleIcon,
      isActive: true,
    },
  ],
};
