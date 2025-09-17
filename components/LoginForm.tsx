"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGithub, FaGoogle, FaCompress } from "react-icons/fa";
import { login, loginWithCreds } from "@/actions/auth/authActions";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

const InvalidCredentials = ({ error }: { error: string }) => {
  if (!error) return null;
  return (
    <Alert className="bg-red-100 text-red-800 border-red-400" role="alert">
      <FaCompress className="h-4 w-4" color="#991b1b" />{" "}
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription> {error} </AlertDescription>
    </Alert>
  );
};

export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState("");

  const onSubmit = async (data: LoginSchema) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    const result = await loginWithCreds(formData);
    if (result?.error) {
      setError(result.error); // Set the error state
    } else {
      setError("");
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your GitHub or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => login("google")}
              variant="outline"
              className="w-full"
            >
              <FaGoogle className="mr-2" />
              Login with Google
            </Button>
            <Button
              onClick={() => login("github")}
              variant="outline"
              className="w-full"
            >
              <FaGithub className="mr-2" />
              Login with GitHub
            </Button>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative text-center text-sm mt-10 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="*********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
              <InvalidCredentials error={error} />
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
