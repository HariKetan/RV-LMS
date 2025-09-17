import { signOut } from "@/auth";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

// Desktop Logout Component
export const LogoutButton = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button
        className="w-full bg-red-700 text-left justify-start ml-0 pl-2 text-white hover:text-black hover:bg-red-500"
        variant="secondary"
        type="submit"
      >
        <LogOut className="h-6 w-6" />
        Log Out
      </Button>
    </form>
  );
};
