"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiLoaderAlt } from "react-icons/bi";
import Image from "next/image";

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
import { useAuthStore } from "@/store/useAuthStore";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError, isAuthenticated, user } = useAuthStore();

  // Check authentication status only once when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect directly to browse page instead of profiles
      router.replace("/browse");
    }
  }, [isAuthenticated, user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      clearError();
      await login(values);
      // After successful login, redirect to browse page
      router.replace("/browse");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/images/auth.jpg"
        alt="Background"
        fill
        className="object-cover object-center"
        priority
        quality={100}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/90" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg space-y-8 bg-black/40 backdrop-blur-xl p-8 sm:p-10 
          rounded-3xl border border-gray-800/50 shadow-xl mx-4"
      >
        <div className="space-y-2 text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-white mb-2"
          >
            Welcome back
          </motion.h1>
          <p className="text-gray-400 text-lg">Sign in to continue watching</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-destructive/15 border border-destructive/30 rounded-xl p-4"
          >
            <p className="text-sm text-destructive-foreground">{error}</p>
          </motion.div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-base">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="h-14 bg-gray-900/50 border-gray-800/50 text-white placeholder:text-gray-500
                        focus:border-primary/50 focus:ring-2 focus:ring-primary/20 
                        transition-all duration-300 text-base rounded-xl"
                      placeholder="john.doe@example.com"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200 text-base">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="h-14 bg-gray-900/50 border-gray-800/50 text-white placeholder:text-gray-500
                        focus:border-primary/50 focus:ring-2 focus:ring-primary/20 
                        transition-all duration-300 text-base rounded-xl"
                      placeholder="••••••••"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg
                font-semibold transition-all duration-300 rounded-xl
                hover:scale-[1.02] active:scale-[0.98] shadow-lg
                hover:shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <BiLoaderAlt className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-4 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-gray-400 hover:text-primary text-sm
              transition-colors duration-300 block"
          >
            Forgot your password?
          </Link>
          <p className="text-gray-400 text-base">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary/90 font-medium 
                hover:underline transition-all duration-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
