"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddContentToModule } from "@/app/teacher/course/[courseId]/components/AddContentToModule";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ModuleDropdownProps {
  moduleId: string;
  courseId: string;
}

export function ModuleDropdown({ moduleId, courseId }: ModuleDropdownProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/course/module/${moduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        toast.error(
          errorData.error || "Failed to delete module. Please try again."
        );
      } else {
        toast.success("Module deleted successfully!");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error deleting module:", error);
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Ellipsis className="h-10 w-10" type="ghost" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <AddContentToModule courseId={courseId} moduleId={moduleId} />
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isDeleting}
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Module
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-6">
            <DialogClose asChild>
              <Button variant="secondary" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
