import {
    SquareTerminal,
    Inbox,
    Calendar,
    UserPlus,
    BookPlusIcon,
    UploadIcon,
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
        url: "/admin/dashboard",
        icon: SquareTerminal,
      },
      {
        title: "Faculties",
        url: "/admin/faculties",
        icon: UserPlus,
      },
      {
        title: "Courses",
        url: "/admin/courses",
        icon: BookPlusIcon,
        isActive: true,
      },
    ],
  };
  