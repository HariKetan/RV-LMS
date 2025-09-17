import { Inter } from "next/font/google";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ThemeToggleButton";
import { AdminSidebar } from "./components/AdminSidebar";

const inter = Inter({ subsets: ["latin"] });

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider >
        <AdminSidebar  />
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gray-100 border-b border-gray-300 shadow-sm">
            <div className="flex items-center ">
              <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/" className="text-words bg-words">
                      Admin
                    </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : ''}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                  </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
              <ModeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col ">
            {/* children goes here */}
            <div className="w-full">
              <div className="flex-grow">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
