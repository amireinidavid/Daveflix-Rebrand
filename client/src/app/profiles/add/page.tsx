"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { useUserStore } from "@/store/useUserStore";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().optional(),
  isKids: z.boolean().default(false),
  pin: z.string().optional(),
  maturityLevel: z.number().min(0).max(18).default(18),
  language: z.string().default("en"),
});

export default function AddProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createProfile, error } = useUserStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      avatar: "",
      isKids: false,
      pin: "",
      maturityLevel: 18,
      language: "en",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await createProfile(values);
      router.push("/browse");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black/95 py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Create Profile</h1>
            <p className="mt-2 text-gray-400">
              Add a new profile to your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Profile Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-gray-900/50 border-gray-800/50 text-white"
                        placeholder="Enter profile name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-12 bg-gray-900/50 border-gray-800/50 text-white"
                        placeholder="Enter avatar URL"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isKids"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel className="text-gray-200">
                      Kids Profile
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("isKids") && (
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">
                        PIN (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          maxLength={4}
                          className="h-12 bg-gray-900/50 border-gray-800/50 text-white"
                          placeholder="Enter 4-digit PIN"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="maturityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Maturity Level
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={18}
                        className="h-12 bg-gray-900/50 border-gray-800/50 text-white"
                        placeholder="Enter maturity level (0-18)"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Language</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full h-12 bg-gray-900/50 border-gray-800/50 text-white rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        {/* Add more languages as needed */}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <BiLoaderAlt className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Create Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
