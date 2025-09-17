"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EllipsisVertical, TriangleAlert } from "lucide-react";

interface ContentItemDropdownProps {
  contentItemId: string;
}

export function ContentItemDropdown({
  contentItemId,
}: ContentItemDropdownProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to manage dialog open/close

  const handleDeleteConfirm = async () => {
    setIsDeleting(true); // Start deleting, disable buttons
    try {
      const response = await fetch(`/api/course/content-item/${contentItemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        toast.error(
          errorData.error || "Failed to delete content item. Please try again."
        );
      } else {
        toast.success("Content item deleted successfully!");
        router.refresh(); // Refresh the route to update the UI
      }
    } catch (error: any) {
      console.error("Error deleting content item:", error);
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsDeleting(false); // Delete finished, enable buttons
      setIsDialogOpen(false); // Close the dialog after the attempt (success or failure)
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem disabled={isDeleting}>
              Delete Content Item
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2">
              <TriangleAlert  className="text-yellow-500 p-2" size={100}/>
              Are you sure you want to delete this content item? This action
              cannot be undone.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
