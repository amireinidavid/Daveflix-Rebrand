"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Film,
  Info,
  Video,
  Tag,
  Users,
  Calendar,
  Globe,
  Award,
  Settings,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  ListVideo,
  X,
  File,
  ImageIcon,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  LayersIcon,
  TvIcon,
} from "lucide-react";
import useMovieStore, {
  MaturityRating,
  CreateContentInput,
} from "@/store/useMovieStore";
import useCategoryStore from "@/store/useCategoryStore";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Shadcn components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/utils/api";
import { AnimatePresence } from "framer-motion";

// Form schema
const contentFormSchema = z.object({
  // Basic Info - strictly from schema
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["MOVIE", "TV_SHOW", "DOCUMENTARY", "SHORT_FILM", "SPECIAL"]),
  releaseYear: z.coerce
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 5),
  maturityRating: z.nativeEnum(MaturityRating),

  // Additional Info
  duration: z.coerce.number().optional(),
  director: z.string().optional(),
  studio: z.string().optional(),
  language: z.string().default("en"),
  country: z.string().optional(),
  awards: z.string().optional(),

  // Media
  posterImage: z.string().optional(),
  backdropImage: z.string().optional(),
  trailerUrl: z.string().optional(),
  trailerType: z.enum(["URL", "UPLOADED"]).default("URL"),

  // Features
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  newRelease: z.boolean().default(false),

  // Quality options
  hasSD: z.boolean().default(true),
  hasHD: z.boolean().default(true),
  has4K: z.boolean().default(false),
  hasHDR: z.boolean().default(false),

  // Languages
  audioLanguages: z.array(z.string()).default(["en"]),
  subtitleLanguages: z.array(z.string()).default(["en"]),

  // Availability
  availableFrom: z.date().default(new Date()),
  availableUntil: z.date().optional(),

  // Genres
  genreIds: z.array(z.string()).optional(),

  // Cast
  castMembers: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        character: z.string().optional(),
      })
    )
    .optional(),

  // TV Show specific fields (conditionally required)
  seasons: z
    .array(
      z.object({
        id: z.string().optional(),
        seasonNumber: z.number(),
        title: z.string().optional(),
        overview: z.string().optional(),
        releaseYear: z.number().optional(),
        episodes: z
          .array(
            z.object({
              id: z.string().optional(),
              episodeNumber: z.number(),
              title: z.string(),
              description: z.string().optional(),
              duration: z.number().optional(),
              thumbnailImage: z.string().optional(),
            })
          )
          .default([]),
      })
    )
    .optional(),

  // Categories
  categories: z.array(z.string()).optional(),

  // Add Media fields
  trailerFile: z.string().optional(),

  // Video fields
  videoUrl: z.string().optional(),
  videoFile: z.string().optional(),
  videoSourceType: z.enum(["URL", "UPLOADED"]).default("URL"),

  // Video quality variants
  videoSD: z.string().optional(),
  videoHD: z.string().optional(),
  video4K: z.string().optional(),
  videoHDR: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

type TrailerData = {
  trailerUrl: string | null;
  trailerFile: string | null;
  trailerType: "URL" | "UPLOADED";
};

type VideoData = {
  videoUrl: string | null;
  videoSourceType: "URL" | "UPLOADED";
  videoSD: string | null;
  videoHD: string | null;
  video4K: string | null;
  videoHDR: string | null;
};

// Navigation items for general content
const baseNavItems = [
  { id: "basic", label: "Basic Info", icon: <Info size={18} /> },
  { id: "media", label: "Media", icon: <File size={18} /> },
  { id: "details", label: "Details", icon: <Film size={18} /> },
  { id: "genres", label: "Genres", icon: <Tag size={18} /> },
  { id: "categories", label: "Categories", icon: <Globe size={18} /> },
  { id: "cast", label: "Cast & Crew", icon: <Users size={18} /> },
  { id: "availability", label: "Availability", icon: <Calendar size={18} /> },
  { id: "languages", label: "Languages", icon: <Globe size={18} /> },
  { id: "features", label: "Features", icon: <Award size={18} /> },
  { id: "quality", label: "Quality", icon: <Settings size={18} /> },
];

// Additional navigation item for TV shows
const tvShowNavItem = {
  id: "seasons",
  label: "Seasons & Episodes",
  icon: <ListVideo size={18} />,
};

const AdminContentAddPage = () => {
  const [activeSection, setActiveSection] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Preview states
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const {
    createContent,
    uploadPosterImage,
    uploadBackdropImage,
    uploadTrailer,
    uploadVideo,
    error,
  } = useMovieStore();

  const { categories, fetchCategories } = useCategoryStore();

  const router = useRouter();

  // Default form values
  const defaultValues: Partial<ContentFormValues> = {
    type: "MOVIE",
    maturityRating: MaturityRating.PG_13,
    language: "en",
    trailerType: "URL",
    featured: false,
    trending: false,
    newRelease: false,
    hasSD: true,
    hasHD: true,
    has4K: false,
    hasHDR: false,
    audioLanguages: ["en"],
    subtitleLanguages: ["en"],
    availableFrom: new Date(),
    categories: [],
    posterImage: "",
    backdropImage: "",
    trailerUrl: "",
    trailerFile: "",
    videoUrl: "",
    videoFile: "",
    videoSourceType: "URL",
    videoSD: "",
    videoHD: "",
    video4K: "",
    videoHDR: "",
  };

  const form = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues,
  });

  // Get the current content type to determine if we should show TV show specific fields
  const contentType = form.watch("type");

  // Dynamically determine navigation items based on content type
  const navItems =
    contentType === "TV_SHOW" ? [...baseNavItems, tvShowNavItem] : baseNavItems;

  const onSubmit = async (data: z.infer<typeof contentFormSchema>) => {
    setIsSubmitting(true);

    try {
      // First upload poster if available
      let posterImageUrl = "";
      if (posterFile) {
        const posterFormData = new FormData();
        posterFormData.append("file", posterFile);
        const posterResponse = await useMovieStore
          .getState()
          .uploadPosterImage(posterFormData);
        posterImageUrl = posterResponse.data.posterImage;
      }

      // Then upload backdrop if available
      let backdropImageUrl = "";
      if (backdropFile) {
        const backdropFormData = new FormData();
        backdropFormData.append("file", backdropFile);
        const backdropResponse = await useMovieStore
          .getState()
          .uploadBackdropImage(backdropFormData);
        backdropImageUrl = backdropResponse.data.backdropImage;
      }

      // Handle trailer upload
      let trailerData: TrailerData = {
        trailerUrl: data.trailerUrl || null,
        trailerFile: null,
        trailerType: data.trailerType || "URL",
      };

      if (data.trailerType === "URL" && data.trailerUrl) {
        trailerData.trailerUrl = data.trailerUrl;
      } else if (data.trailerType === "UPLOADED" && trailerFile) {
        try {
          const trailerResponse = await useMovieStore
            .getState()
            .uploadTrailer("temp", trailerFile, "UPLOADED");
          
          if (trailerResponse && trailerResponse.success) {
            trailerData = {
              trailerUrl: trailerResponse.data.trailerUrl,
              trailerFile: trailerResponse.data.trailerFile,
              trailerType: "UPLOADED",
            };
          }
        } catch (error) {
          console.error("Error uploading trailer:", error);
          toast.error("Failed to upload trailer");
        }
      }

      // Handle video upload
      let videoData: VideoData = {
        videoUrl: data.videoUrl || null,
        videoSourceType: data.videoSourceType || "URL",
        videoSD: null,
        videoHD: null,
        video4K: null,
        videoHDR: null,
      };

      if (data.videoSourceType === "URL" && data.videoUrl) {
        videoData.videoUrl = data.videoUrl;
      } else if (data.videoSourceType === "UPLOADED" && videoFile) {
        try {
          const videoResponse = await useMovieStore
            .getState()
            .uploadVideo("temp", videoFile, "UPLOADED");
          
          if (videoResponse && videoResponse.success) {
            videoData = {
              videoUrl: null,
              videoSourceType: "UPLOADED",
              videoSD: videoResponse.data.videoSD,
              videoHD: videoResponse.data.videoHD,
              video4K: videoResponse.data.video4K,
              videoHDR: videoResponse.data.videoHDR,
            };
          }
        } catch (error) {
          console.error("Error uploading video:", error);
          toast.error("Failed to upload video");
          return; // Stop the submission if video upload fails
        }
      }

      // Now create the content with all the uploaded media URLs
      const contentData = {
        ...data,
        posterImage: posterImageUrl || data.posterImage,
        backdropImage: backdropImageUrl || data.backdropImage,
        ...trailerData,
        ...videoData,
      };
      
      console.log("Content data being sent:", contentData);

      await useMovieStore.getState().createContent(contentData);

      toast.success("Content created successfully");

      router.push("/admin/content");
    } catch (error) {
      console.error("Error creating content:", error);
      toast.error("Error creating content");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File input handlers with preview functionality
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
    }
  };

  const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackdropFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setBackdropPreview(previewUrl);
    }
  };

  const handleTrailerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTrailerFile(file);
      setTrailerPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // Functions to clear previews
  const clearPosterPreview = () => {
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }
    setPosterPreview(null);
    setPosterFile(null);
  };

  const clearBackdropPreview = () => {
    if (backdropPreview) {
      URL.revokeObjectURL(backdropPreview);
    }
    setBackdropPreview(null);
    setBackdropFile(null);
  };

  const clearTrailerPreview = () => {
    if (trailerPreview) {
      URL.revokeObjectURL(trailerPreview);
    }
    setTrailerPreview(null);
    setTrailerFile(null);
  };

  const clearVideoPreview = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview);
      if (backdropPreview) URL.revokeObjectURL(backdropPreview);
      if (trailerPreview) URL.revokeObjectURL(trailerPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [posterPreview, backdropPreview, trailerPreview, videoPreview]);
  // Sidebar items
  const sidebarItems = [
    { id: "basic", label: "Basic Info", icon: <Info className="h-5 w-5" /> },
    { id: "media", label: "Media", icon: <Film className="h-5 w-5" /> },
    { id: "details", label: "Details", icon: <Tag className="h-5 w-5" /> },
    { id: "cast", label: "Cast & Crew", icon: <Users className="h-5 w-5" /> },
    { id: "seasons", label: "Seasons", icon: <Video className="h-5 w-5" /> },
    {
      id: "availability",
      label: "Availability",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "languages",
      label: "Languages",
      icon: <Globe className="h-5 w-5" />,
    },
    { id: "awards", label: "Awards", icon: <Award className="h-5 w-5" /> },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  // Dummy genres data (replace with actual data from API)
  const genres = [
    { id: "1", name: "Action" },
    { id: "2", name: "Comedy" },
    { id: "3", name: "Drama" },
    { id: "4", name: "Horror" },
    { id: "5", name: "Sci-Fi" },
    { id: "6", name: "Thriller" },
    { id: "7", name: "Romance" },
    { id: "8", name: "Adventure" },
    { id: "9", name: "Fantasy" },
    { id: "10", name: "Animation" },
    { id: "11", name: "Documentary" },
    { id: "12", name: "Crime" },
  ];

  // Cast members state
  const [castMembers, setCastMembers] = useState([
    { id: "1", name: "", role: "", character: "" },
  ]);

  const addCastMember = () => {
    setCastMembers([
      ...castMembers,
      { id: Date.now().toString(), name: "", role: "", character: "" },
    ]);
  };

  const removeCastMember = (id: string) => {
    setCastMembers(castMembers.filter((member) => member.id !== id));
  };

  const updateCastMember = (id: string, field: string, value: string) => {
    setCastMembers(
      castMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  // TV Show seasons state
  const [seasons, setSeasons] = useState([
    {
      id: "1",
      seasonNumber: 1,
      title: "",
      overview: "",
      posterImage: "",
      releaseYear: new Date().getFullYear(),
      episodes: [
        {
          id: "1",
          episodeNumber: 1,
          title: "",
          videoSourceType: "URL",
          videoUrl: "",
          videoSD: "",
          videoHD: "",
          video4K: "",
          videoHDR: "",
          description: "",
          duration: 0,
          thumbnailImage: "",
        },
      ],
    },
  ]);

  // State for managing collapsed seasons
  const [collapsedSeasons, setCollapsedSeasons] = useState<string[]>([]);

  // Toggle season collapse
  const toggleSeasonCollapse = (seasonId: string) => {
    setCollapsedSeasons((prev) =>
      prev.includes(seasonId)
        ? prev.filter((id) => id !== seasonId)
        : [...prev, seasonId]
    );
  };

  // Season management functions
  const addSeason = () => {
    const newSeason = {
      id: uuidv4(),
      seasonNumber: seasons.length + 1,
      title: "",
      overview: "",
      posterImage: "",
      releaseYear: new Date().getFullYear(),
      episodes: [],
    };
    setSeasons([...seasons, newSeason]);
  };

  const removeSeason = (seasonId: string) => {
    setSeasons(seasons.filter((season) => season.id !== seasonId));
  };

  const updateSeason = (seasonId: string, field: string, value: any) => {
    setSeasons(
      seasons.map((season) =>
        season.id === seasonId ? { ...season, [field]: value } : season
      )
    );
  };

  // Episode management functions
  const addEpisode = (seasonId: string) => {
    const season = seasons.find((s) => s.id === seasonId);
    if (!season) return;

    const newEpisode = {
      id: uuidv4(),
      episodeNumber: season.episodes.length + 1,
      title: "",
      description: "",
      duration: 0,
      thumbnailImage: "",
      videoUrl: "",
      videoFile: "",
      videoSourceType: "URL" as const,
      videoSD: "",
      videoHD: "",
      video4K: "",
      videoHDR: "",
    };

    setSeasons(
      seasons.map((season) =>
        season.id === seasonId
          ? { ...season, episodes: [...season.episodes, newEpisode] }
          : season
      )
    );
  };

  const removeEpisode = (seasonId: string, episodeId: string) => {
    setSeasons(
      seasons.map((season) =>
        season.id === seasonId
          ? {
              ...season,
              episodes: season.episodes.filter(
                (episode) => episode.id !== episodeId
              ),
            }
          : season
      )
    );
  };

  const updateEpisode = (
    seasonId: string,
    episodeId: string,
    field: string,
    value: any
  ) => {
    setSeasons(
      seasons.map((season) =>
        season.id === seasonId
          ? {
              ...season,
              episodes: season.episodes.map((episode) =>
                episode.id === episodeId
                  ? { ...episode, [field]: value }
                  : episode
              ),
            }
          : season
      )
    );
  };

  // Update form value when seasons change
  useEffect(() => {
    if (contentType === "TV_SHOW") {
      form.setValue("seasons", seasons);
    }
  }, [seasons, contentType, form]);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Content</h1>
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 sticky top-20">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeSection === item.id ? "" : "text-muted-foreground"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                    {activeSection === item.id && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>

              <Separator className="my-4" />

              <Button
                type="submit"
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Content"
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Info Section */}
                <Card
                  className={activeSection === "basic" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 mb-6">
                        <Info className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold">
                          Basic Information
                        </h2>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter content title"
                                {...field}
                                className="text-lg"
                              />
                            </FormControl>
                            <FormDescription>
                              The title of your movie, TV show, or other content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter a detailed description"
                                {...field}
                                className="min-h-[120px] resize-y"
                              />
                            </FormControl>
                            <FormDescription>
                              A compelling description of your content (minimum
                              10 characters)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Content Type
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select content type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MOVIE">Movie</SelectItem>
                                  <SelectItem value="TV_SHOW">
                                    TV Show
                                  </SelectItem>
                                  <SelectItem value="DOCUMENTARY">
                                    Documentary
                                  </SelectItem>
                                  <SelectItem value="SHORT_FILM">
                                    Short Film
                                  </SelectItem>
                                  <SelectItem value="SPECIAL">
                                    Special
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The type of content you're adding
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="releaseYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Release Year
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Release year"
                                  {...field}
                                  min={1900}
                                  max={new Date().getFullYear() + 5}
                                />
                              </FormControl>
                              <FormDescription>
                                The year when this content was released
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="maturityRating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Maturity Rating
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select maturity rating" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="G">
                                    G (General Audiences)
                                  </SelectItem>
                                  <SelectItem value="PG">
                                    PG (Parental Guidance)
                                  </SelectItem>
                                  <SelectItem value="PG_13">
                                    PG-13 (Parents Strongly Cautioned)
                                  </SelectItem>
                                  <SelectItem value="R">
                                    R (Restricted)
                                  </SelectItem>
                                  <SelectItem value="NC_17">
                                    NC-17 (Adults Only)
                                  </SelectItem>
                                  <SelectItem value="TV_Y">
                                    TV-Y (All Children)
                                  </SelectItem>
                                  <SelectItem value="TV_Y7">
                                    TV-Y7 (Older Children)
                                  </SelectItem>
                                  <SelectItem value="TV_G">
                                    TV-G (General Audience)
                                  </SelectItem>
                                  <SelectItem value="TV_PG">
                                    TV-PG (Parental Guidance)
                                  </SelectItem>
                                  <SelectItem value="TV_14">
                                    TV-14 (Parents Strongly Cautioned)
                                  </SelectItem>
                                  <SelectItem value="TV_MA">
                                    TV-MA (Mature Audience)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The content's age-appropriate rating
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">
                                Duration (minutes)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Duration in minutes"
                                  {...field}
                                  min={1}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                The content's runtime in minutes (optional for
                                TV shows)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-8 pt-6 border-t border-border">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="mr-2">
                                Saving Information...
                              </span>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            "Save Basic Information"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Placeholder for other sections */}
                {activeSection !== "basic" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center py-12">
                        <h3 className="text-xl font-medium mb-2">
                          {
                            sidebarItems.find(
                              (item) => item.id === activeSection
                            )?.label
                          }{" "}
                          Section
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          This section will be implemented next. Please complete
                          the Basic Information section first.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Media Section */}
                <Card
                  className={activeSection === "media" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-8">
                      <h2 className="text-2xl font-semibold flex items-center">
                        <Film className="mr-2 h-6 w-6 text-primary" />
                        Media Assets
                      </h2>

                      <div className="space-y-8">
                        {/* Poster Image Upload */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 p-5 rounded-lg border border-border bg-card/50"
                        >
                          <h3 className="text-lg font-medium flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                            Poster Image
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <FormLabel className="text-base">
                                Upload Poster Image
                              </FormLabel>
                              <div className="flex flex-col space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePosterChange}
                                  className="cursor-pointer"
                                />
                                <FormDescription>
                                  Recommended size: 300x450 pixels (2:3 ratio)
                                </FormDescription>
                              </div>
                            </div>
                            <div className="flex justify-center items-center">
                              {posterPreview ? (
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative"
                                >
                                  <div className="relative h-[240px] w-[160px] rounded-md overflow-hidden border border-border shadow-md">
                                    <Image
                                      src={posterPreview}
                                      alt="Poster preview"
                                      fill
                                      style={{ objectFit: "cover" }}
                                      className="transition-all duration-200 hover:scale-105"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md"
                                    onClick={clearPosterPreview}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex flex-col items-center justify-center h-[240px] w-[160px] bg-muted/50 rounded-md border border-dashed border-border"
                                >
                                  <File className="h-12 w-12 text-muted-foreground/60" />
                                  <p className="text-sm text-muted-foreground mt-2">
                                    No poster uploaded
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 mt-1 px-4 text-center">
                                    This will be the main image for your content
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        <Separator />

                        {/* Backdrop Image Upload */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-4 p-5 rounded-lg border border-border bg-card/50"
                        >
                          <h3 className="text-lg font-medium flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5 text-primary" />
                            Backdrop Image
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <FormLabel className="text-base">
                                Upload Backdrop Image
                              </FormLabel>
                              <div className="flex flex-col space-y-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleBackdropChange}
                                  className="cursor-pointer"
                                />
                                <FormDescription>
                                  Recommended size: 1280x720 pixels (16:9 ratio)
                                </FormDescription>
                              </div>
                            </div>
                            <div className="flex justify-center items-center">
                              {backdropPreview ? (
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="relative"
                                >
                                  <div className="relative h-[135px] w-[240px] rounded-md overflow-hidden border border-border shadow-md">
                                    <Image
                                      src={backdropPreview}
                                      alt="Backdrop preview"
                                      fill
                                      style={{ objectFit: "cover" }}
                                      className="transition-all duration-200 hover:scale-105"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md"
                                    onClick={clearBackdropPreview}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex flex-col items-center justify-center h-[135px] w-[240px] bg-muted/50 rounded-md border border-dashed border-border"
                                >
                                  <File className="h-12 w-12 text-muted-foreground/60" />
                                  <p className="text-sm text-muted-foreground mt-2">
                                    No backdrop uploaded
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 mt-1 px-4 text-center">
                                    This will appear as the background image
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        <Separator />

                        {/* Trailer Upload */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="space-y-4 p-5 rounded-lg border border-border bg-card/50"
                        >
                          <h3 className="text-lg font-medium flex items-center">
                            <Video className="mr-2 h-5 w-5 text-primary" />
                            Trailer
                          </h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="trailerType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">
                                    Trailer Source
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select trailer source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="URL">
                                        External URL (YouTube, Vimeo, etc.)
                                      </SelectItem>
                                      <SelectItem value="UPLOADED">
                                        Upload Video File
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {form.watch("trailerType") === "URL" ? (
                              <FormField
                                control={form.control}
                                name="trailerUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base">
                                      Trailer URL
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="https://youtube.com/watch?v=..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Enter a YouTube, Vimeo, or other video
                                      streaming URL
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <FormLabel className="text-base">
                                    Upload Trailer File
                                  </FormLabel>
                                  <div className="flex flex-col space-y-2">
                                    <Input
                                      type="file"
                                      accept="video/*"
                                      onChange={handleTrailerChange}
                                      className="cursor-pointer"
                                    />
                                    <FormDescription>
                                      Maximum file size: 100MB. Supported
                                      formats: MP4, WebM, MOV
                                    </FormDescription>
                                  </div>
                                </div>
                                <div className="flex justify-center items-center">
                                  {trailerPreview ? (
                                    <motion.div
                                      initial={{ scale: 0.9, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="relative"
                                    >
                                      <div className="relative h-[135px] w-[240px] rounded-md overflow-hidden border border-border shadow-md">
                                        <video
                                          src={trailerPreview}
                                          controls
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md"
                                        onClick={clearTrailerPreview}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="flex flex-col items-center justify-center h-[135px] w-[240px] bg-muted/50 rounded-md border border-dashed border-border"
                                    >
                                      <Video className="h-12 w-12 text-muted-foreground/60" />
                                      <p className="text-sm text-muted-foreground mt-2">
                                        No trailer uploaded
                                      </p>
                                      <p className="text-xs text-muted-foreground/70 mt-1 px-4 text-center">
                                        Upload a short preview of your content
                                      </p>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        <Separator />

                        {/* Main Video Upload */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="space-y-4 p-5 rounded-lg border border-border bg-card/50"
                        >
                          <h3 className="text-lg font-medium flex items-center">
                            <ListVideo className="mr-2 h-5 w-5 text-primary" />
                            Main Video Content
                          </h3>
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="videoSourceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Video Source</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select video source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="URL">
                                        External URL
                                      </SelectItem>
                                      <SelectItem value="UPLOADED">
                                        Uploaded File
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {form.watch("videoSourceType") === "URL" ? (
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="videoUrl"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base">
                                        Main Video URL
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="https://example.com/videos/my-video.mp4"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the URL to your main video content
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="videoSD"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          SD Quality URL (Optional)
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="SD quality URL"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="videoHD"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          HD Quality URL (Optional)
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="HD quality URL"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="video4K"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          4K Quality URL (Optional)
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="4K quality URL"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="videoHDR"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          HDR Quality URL (Optional)
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="HDR quality URL"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <FormLabel className="text-base">
                                    Upload Main Video File
                                  </FormLabel>
                                  <div className="flex flex-col space-y-2">
                                    <Input
                                      type="file"
                                      accept="video/*"
                                      onChange={handleVideoChange}
                                      className="cursor-pointer"
                                    />
                                    <FormDescription>
                                      Maximum file size: 100MB. For larger
                                      files, consider using a CDN URL.
                                    </FormDescription>
                                  </div>
                                  {videoFile && (
                                    <div className="flex items-center p-2 bg-primary/10 rounded-md">
                                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                                      <span className="text-sm font-medium">
                                        {videoFile.name}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto h-6 w-6"
                                        onClick={clearVideoPreview}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                <div className="p-4 bg-muted/50 rounded-md border border-dashed border-border">
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                                    Additional Quality Options
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    For uploaded files, different quality
                                    versions will be automatically generated
                                    when possible. You can also manually upload
                                    specific quality versions.
                                  </p>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="hasSD"
                                        checked={form.watch("hasSD")}
                                        onCheckedChange={(checked) =>
                                          form.setValue("hasSD", checked)
                                        }
                                      />
                                      <label
                                        htmlFor="hasSD"
                                        className="text-sm cursor-pointer"
                                      >
                                        SD Quality
                                      </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="hasHD"
                                        checked={form.watch("hasHD")}
                                        onCheckedChange={(checked) =>
                                          form.setValue("hasHD", checked)
                                        }
                                      />
                                      <label
                                        htmlFor="hasHD"
                                        className="text-sm cursor-pointer"
                                      >
                                        HD Quality
                                      </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="has4K"
                                        checked={form.watch("has4K")}
                                        onCheckedChange={(checked) =>
                                          form.setValue("has4K", checked)
                                        }
                                      />
                                      <label
                                        htmlFor="has4K"
                                        className="text-sm cursor-pointer"
                                      >
                                        4K Quality
                                      </label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="hasHDR"
                                        checked={form.watch("hasHDR")}
                                        onCheckedChange={(checked) =>
                                          form.setValue("hasHDR", checked)
                                        }
                                      />
                                      <label
                                        htmlFor="hasHDR"
                                        className="text-sm cursor-pointer"
                                      >
                                        HDR Support
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="mr-2"
                          onClick={() => setActiveSection("basic")}
                        >
                          Back to Basic Info
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            // Save media info and move to next section
                            setActiveSection("categories");
                          }}
                          className="gap-1"
                        >
                          Continue
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Section */}
                <Card
                  className={activeSection === "details" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">
                        Additional Details
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="director"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Director</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter director's name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="studio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Studio</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter studio name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country of Origin</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
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
                              <FormLabel>Primary Language</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter language code (e.g., en, fr, es)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                ISO 639-1 language code (e.g., en, fr, es)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="awards"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Awards</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter awards information"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("type") === "MOVIE" && (
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter duration in minutes"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Genres Section */}
                <Card
                  className={activeSection === "genres" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Genres</h2>

                      <FormField
                        control={form.control}
                        name="genreIds"
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Select Genres</FormLabel>
                              <FormDescription>
                                Choose all genres that apply to this content
                              </FormDescription>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {genres.map((genre) => (
                                <FormItem
                                  key={genre.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(genre.id)}
                                      onCheckedChange={(checked) => {
                                        const updatedGenres = checked
                                          ? [...(field.value || []), genre.id]
                                          : (field.value || []).filter(
                                              (id) => id !== genre.id
                                            );
                                        field.onChange(updatedGenres);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {genre.name}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories Section */}
                <Card
                  className={
                    activeSection === "categories" ? "block" : "hidden"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Categories</h2>

                      <FormField
                        control={form.control}
                        name="categories"
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Select Categories</FormLabel>
                              <FormDescription>
                                Choose all categories that apply to this content
                              </FormDescription>
                            </div>

                            {categories.length === 0 ? (
                              <div className="flex items-center justify-center p-6 border border-dashed rounded-md">
                                <p className="text-muted-foreground">
                                  Loading categories...
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {categories.map((category) => (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          category.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          const updatedCategories = checked
                                            ? [
                                                ...(field.value || []),
                                                category.id,
                                              ]
                                            : (field.value || []).filter(
                                                (id) => id !== category.id
                                              );
                                          field.onChange(updatedCategories);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {category.name}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cast & Crew Section */}
                <Card className={activeSection === "cast" ? "block" : "hidden"}>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Cast & Crew</h2>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCastMember}
                          className="flex items-center gap-1"
                        >
                          <Plus size={16} />
                          <span>Add Person</span>
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {castMembers.map((member, index) => (
                          <div
                            key={member.id}
                            className="border border-border rounded-lg p-4 bg-background"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium">
                                Cast/Crew Member #{index + 1}
                              </h3>
                              {castMembers.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCastMember(member.id)}
                                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <FormLabel>Name</FormLabel>
                                <Input
                                  placeholder="Enter name"
                                  value={member.name}
                                  onChange={(e) =>
                                    updateCastMember(
                                      member.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <FormLabel>Role</FormLabel>
                                <Select
                                  value={member.role}
                                  onValueChange={(value) =>
                                    updateCastMember(member.id, "role", value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Actor">Actor</SelectItem>
                                    <SelectItem value="Director">
                                      Director
                                    </SelectItem>
                                    <SelectItem value="Producer">
                                      Producer
                                    </SelectItem>
                                    <SelectItem value="Writer">
                                      Writer
                                    </SelectItem>
                                    <SelectItem value="Cinematographer">
                                      Cinematographer
                                    </SelectItem>
                                    <SelectItem value="Composer">
                                      Composer
                                    </SelectItem>
                                    <SelectItem value="Editor">
                                      Editor
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <FormLabel>Character (for actors)</FormLabel>
                                <Input
                                  placeholder="Enter character name"
                                  value={member.character || ""}
                                  onChange={(e) =>
                                    updateCastMember(
                                      member.id,
                                      "character",
                                      e.target.value
                                    )
                                  }
                                  disabled={member.role !== "Actor"}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Availability Section */}
                <Card
                  className={
                    activeSection === "availability" ? "block" : "hidden"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Availability</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="availableFrom"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Available From</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarComponent className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When this content becomes available for
                                streaming
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="availableUntil"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Available Until (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarComponent className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value || undefined}
                                    onSelect={field.onChange}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When this content will no longer be available
                                (leave empty for permanent availability)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Languages Section */}
                <Card
                  className={activeSection === "languages" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Languages</h2>

                      <FormField
                        control={form.control}
                        name="audioLanguages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audio Languages</FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  "en",
                                  "es",
                                  "fr",
                                  "de",
                                  "it",
                                  "ja",
                                  "ko",
                                  "zh",
                                  "hi",
                                  "pt",
                                  "ru",
                                ].map((lang) => (
                                  <div
                                    key={lang}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`audio-${lang}`}
                                      checked={field.value?.includes(lang)}
                                      onCheckedChange={(checked) => {
                                        const updatedLangs = checked
                                          ? [...(field.value || []), lang]
                                          : (field.value || []).filter(
                                              (l) => l !== lang
                                            );
                                        field.onChange(updatedLangs);
                                      }}
                                    />
                                    <label
                                      htmlFor={`audio-${lang}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {new Intl.DisplayNames(["en"], {
                                        type: "language",
                                      }).of(lang)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Select all available audio languages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subtitleLanguages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subtitle Languages</FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  "en",
                                  "es",
                                  "fr",
                                  "de",
                                  "it",
                                  "ja",
                                  "ko",
                                  "zh",
                                  "hi",
                                  "pt",
                                  "ru",
                                ].map((lang) => (
                                  <div
                                    key={lang}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`subtitle-${lang}`}
                                      checked={field.value?.includes(lang)}
                                      onCheckedChange={(checked) => {
                                        const updatedLangs = checked
                                          ? [...(field.value || []), lang]
                                          : (field.value || []).filter(
                                              (l) => l !== lang
                                            );
                                        field.onChange(updatedLangs);
                                      }}
                                    />
                                    <label
                                      htmlFor={`subtitle-${lang}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {new Intl.DisplayNames(["en"], {
                                        type: "language",
                                      }).of(lang)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Select all available subtitle languages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features Section */}
                <Card
                  className={activeSection === "features" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Features</h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                Featured Content
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Show in featured sections
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="trending"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                Trending
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Mark as trending content
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="newRelease"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                New Release
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Mark as new release
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Section */}
                <Card
                  className={activeSection === "quality" ? "block" : "hidden"}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Quality Options</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField
                          control={form.control}
                          name="hasSD"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                SD Quality
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Standard Definition
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasHD"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                HD Quality
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                High Definition
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="has4K"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                4K Quality
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                Ultra High Definition
                              </FormDescription>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hasHDR"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm">
                              <FormLabel className="text-base mb-2">
                                HDR Support
                              </FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-center mt-2">
                                High Dynamic Range
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-8 pt-6 border-t border-border">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="mr-2">Creating Content...</span>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            "Create Content"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seasons Section - Only visible for TV Shows */}
                <Card
                  className={
                    activeSection === "seasons" && form.watch("type") === "TV_SHOW"
                      ? "block"
                      : "hidden"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TvIcon className="h-6 w-6 text-primary" />
                          <h2 className="text-xl font-semibold">Seasons & Episodes</h2>
                        </div>
                        <Button
                          type="button"
                          onClick={addSeason}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Add Season</span>
                        </Button>
                      </div>

                      <div className="space-y-8">
                        {seasons.map((season, seasonIndex) => (
                          <motion.div
                            key={season.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg border border-border bg-card"
                          >
                            <div className="border-b border-border p-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center space-x-2">
                                  <LayersIcon className="h-5 w-5 text-primary" />
                                  <span>Season {season.seasonNumber}</span>
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSeasonCollapse(season.id)}
                                  >
                                    {collapsedSeasons.includes(season.id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronUp className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {seasons.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeSeason(season.id)}
                                      className="text-destructive hover:text-destructive/90"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <AnimatePresence>
                              {!collapsedSeasons.includes(season.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="p-4 space-y-6"
                                >
                                  {/* Season Details */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <FormLabel>Season Title</FormLabel>
                                        <Input
                                          value={season.title || ""}
                                          onChange={(e) =>
                                            updateSeason(season.id, "title", e.target.value)
                                          }
                                          placeholder="Enter season title"
                                        />
                                      </div>
                                      <div>
                                        <FormLabel>Release Year</FormLabel>
                                        <Input
                                          type="number"
                                          value={season.releaseYear || ""}
                                          onChange={(e) =>
                                            updateSeason(
                                              season.id,
                                              "releaseYear",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          placeholder="Enter release year"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <FormLabel>Overview</FormLabel>
                                        <Textarea
                                          value={season.overview || ""}
                                          onChange={(e) =>
                                            updateSeason(season.id, "overview", e.target.value)
                                          }
                                          placeholder="Enter season overview"
                                          rows={4}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Episodes Section */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium">Episodes</h4>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addEpisode(season.id)}
                                        className="flex items-center space-x-2"
                                      >
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Add Episode</span>
                                      </Button>
                                    </div>

                                    <div className="space-y-4">
                                      {season.episodes.map((episode) => (
                                        <div
                                          key={episode.id}
                                          className="rounded-md border border-border p-4 space-y-4"
                                        >
                                          <div className="flex items-center justify-between">
                                            <h5 className="font-medium">
                                              Episode {episode.episodeNumber}
                                            </h5>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                removeEpisode(season.id, episode.id)
                                              }
                                              className="text-destructive hover:text-destructive/90"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <FormLabel>Title</FormLabel>
                                              <Input
                                                value={episode.title}
                                                onChange={(e) =>
                                                  updateEpisode(
                                                    season.id,
                                                    episode.id,
                                                    "title",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Enter episode title"
                                              />
                                            </div>
                                            <div>
                                              <FormLabel>Duration (minutes)</FormLabel>
                                              <Input
                                                type="number"
                                                value={episode.duration || ""}
                                                onChange={(e) =>
                                                  updateEpisode(
                                                    season.id,
                                                    episode.id,
                                                    "duration",
                                                    parseInt(e.target.value)
                                                  )
                                                }
                                                placeholder="Enter duration"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <FormLabel>Description</FormLabel>
                                            <Textarea
                                              value={episode.description || ""}
                                              onChange={(e) =>
                                                updateEpisode(
                                                  season.id,
                                                  episode.id,
                                                  "description",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Enter episode description"
                                              rows={3}
                                            />
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <FormLabel>Video Source Type</FormLabel>
                                              <Select
                                                value={episode.videoSourceType}
                                                onValueChange={(value) =>
                                                  updateEpisode(
                                                    season.id,
                                                    episode.id,
                                                    "videoSourceType",
                                                    value as "URL" | "UPLOADED"
                                                  )
                                                }
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select source type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="URL">URL</SelectItem>
                                                  <SelectItem value="UPLOADED">Uploaded</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            {episode.videoSourceType === "URL" ? (
                                              <div>
                                                <FormLabel>Video URL</FormLabel>
                                                <Input
                                                  value={episode.videoUrl || ""}
                                                  onChange={(e) =>
                                                    updateEpisode(
                                                      season.id,
                                                      episode.id,
                                                      "videoUrl",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="Enter video URL"
                                                />
                                              </div>
                                            ) : (
                                              <div>
                                                <FormLabel>Video File</FormLabel>
                                                <Input
                                                  type="file"
                                                  accept="video/*"
                                                  onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                      // Handle file upload here
                                                      const file = e.target.files[0];
                                                      // Simulate upload and get URL
                                                      const mockUrl = URL.createObjectURL(file);
                                                      updateEpisode(
                                                        season.id,
                                                        episode.id,
                                                        "videoFile",
                                                        mockUrl
                                                      );
                                                    }
                                                  }}
                                                />
                                              </div>
                                            )}
                                          </div>

                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                              <FormLabel>SD Version</FormLabel>
                                              <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const mockUrl = URL.createObjectURL(file);
                                                    updateEpisode(
                                                      season.id,
                                                      episode.id,
                                                      "videoSD",
                                                      mockUrl
                                                    );
                                                  }
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <FormLabel>HD Version</FormLabel>
                                              <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const mockUrl = URL.createObjectURL(file);
                                                    updateEpisode(
                                                      season.id,
                                                      episode.id,
                                                      "videoHD",
                                                      mockUrl
                                                    );
                                                  }
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <FormLabel>4K Version</FormLabel>
                                              <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const mockUrl = URL.createObjectURL(file);
                                                    updateEpisode(
                                                      season.id,
                                                      episode.id,
                                                      "video4K",
                                                      mockUrl
                                                    );
                                                  }
                                                }}
                                              />
                                            </div>
                                            <div>
                                              <FormLabel>HDR Version</FormLabel>
                                              <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files[0]) {
                                                    const file = e.target.files[0];
                                                    const mockUrl = URL.createObjectURL(file);
                                                    updateEpisode(
                                                      season.id,
                                                      episode.id,
                                                      "videoHDR",
                                                      mockUrl
                                                    );
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentAddPage;
