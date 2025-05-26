import {
  BookOpen,
  LayoutDashboard,
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
        url: "/user/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Courses",
        url: "/user/my-courses",
        icon: BookOpen,
      },
    ],
  };
  