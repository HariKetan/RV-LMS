import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaSlack } from "react-icons/fa";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogoutButton } from "./Logout";
import { ModeToggle } from "./ThemeToggleButton";

// Define a type for the user roles
type UserRole = "USER" | "ADMIN" | "TEACHER";

// Define a mapping of roles to dashboard URLs
const dashboardUrls: Record<UserRole, string> = {
  USER: "/user/dashboard",
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
};

// Function to get the dashboard URL based on the user's role
const getDashboardUrl = (role?: string): string | undefined => {
  if (!role) {
    return undefined;
  }
  return dashboardUrls[role as UserRole];
};

const NavLink = ({
  href,
  title,
  ariaLabel,
  children,
}: {
  href: string;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}) => (
  <li>
    <Link
      href={href}
      title={title}
      aria-label={ariaLabel}
      className="font-medium"
    >
      {children}
    </Link>
  </li>
);

// Reusable component for menu items
interface MenuItemsProps {
  includeDashboard?: boolean;
  userRole?: string;
}

const MenuItems: React.FC<MenuItemsProps> = ({
  includeDashboard = false,
  userRole,
}) => {
  return (
    <>
      {includeDashboard && userRole && getDashboardUrl(userRole) && (
        <DropdownMenuItem>
          <Link
            href={getDashboardUrl(userRole) || ""}
            title="Dashboard"
            aria-label="Dashboard"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuItem>
        <Link
          href="/browse-courses"
          title="Browse Courses Page Link"
          aria-label="Browse Courses Page Link"
        >
          Browse Courses
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          href="/blog"
          title="Blog Archive Page Link"
          aria-label="Blog Archive Page Link"
        >
          Blog
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          href="/frequently-asked-questions"
          title="Frequently asked questions page link"
          aria-label="Frequently asked questions link"
        >
          FAQs
        </Link>
      </DropdownMenuItem>
    </>
  );
};

const Header = async () => {
  const session = await auth();
  const userRole = session?.user?.role; // get user role from session

  return (
    <div className="bg-primary py-3  px-4 border-r-0">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section: Logo */}
        <div className="items-center inline gap-2 flex-1 justify-start">
          <Link href="/" className="flex items-center gap-2">
            <FaSlack className="w-6 h-6 text-foreground" />
            <span className="text-xl font-semibold text-slate-900">LMS</span>
          </Link>
        </div>

        {/* Middle Section: Navigation Links */}
        <ul className="hidden md:flex items-center gap-10 text-slate-900 text-card-foreground flex-1 justify-center">
          <NavLink href="/" title="Homepage Link" ariaLabel="Homepage Link">
            Home
          </NavLink>
          <NavLink
            href="/browse-courses"
            title="Browse Courses Page Link"
            ariaLabel="Browse Courses Page Link"
          >
            Browse Courses
          </NavLink>
          <NavLink
            href="/blog"
            title="Blog Archive Page Link"
            ariaLabel="Blog Archive Page Link"
          >
            Blog
          </NavLink>
          <NavLink
            href="/frequently-asked-questions"
            title="Frequently asked questions page link"
            ariaLabel="Frequently asked questions link"
          >
            FAQs
          </NavLink>
        </ul>

        {/* Right Section: Buttons */}
        <div className="flex items-center flex-1 justify-end gap-4">
          <ModeToggle /> {/* Add ModeToggle here, before Login/Avatar */}
          {!session?.user ? (
            <>
              <Button className="hidden md:block bg-black" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <div className="flex md:hidden items-center gap-2 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Dropdown Menu Button"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <MenuItems />
                    <DropdownMenuItem>
                      <Button className="w-full text-sm " asChild>
                        <Link href="/auth/login">Log In</Link>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="relative flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 focus:outline-none"
                    aria-label="User Profile"
                  >
                    <Avatar>
                      <AvatarImage src={session?.user.image ?? undefined} />
                      <AvatarFallback>
                        {session.user.name
                          ?.split(" ")
                          .map((part: string) => part[0])
                          .join("") ?? ""}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Conditionally render dashboard link based on user role */}
                  <MenuItems includeDashboard={true} userRole={userRole} />
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
