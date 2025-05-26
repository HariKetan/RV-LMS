"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EnrollButtonProps {
  courseId: string;
  className?: string; // Make className optional
}

const EnrollButton: React.FC<EnrollButtonProps> = ({ courseId, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch("/api/course/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: courseId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Enrollment failed");
        console.error("Enrollment failed:", errorData);
        return;
      }

      // Enrollment was successful!
      console.log("Enrolled successfully!");
      router.refresh(); // Refresh the current route
    } catch (err: any) {
      setError("Failed to connect to the server");
      console.error("Enrollment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        className={`w-full ${className || ""}`} // Apply the custom className
        onClick={handleEnroll}
        disabled={isLoading}
      >
        {isLoading ? "Enrolling..." : "Enroll Now"}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default EnrollButton;
