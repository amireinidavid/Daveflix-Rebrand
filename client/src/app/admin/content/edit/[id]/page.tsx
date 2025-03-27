"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
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
} from "@/store/useMovieStore";
import useCategoryStore from "@/store/useCategoryStore";
import axios from "axios";
import { toast } from "react-hot-toast";
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

// Form schema - identical to the add page
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
//   director: z.string().optional(),
//   studio: z.string().optional(),
//   language: z.string().default("en"),
//   country: z.string().optional(),
//   awards: z.string().optional(),

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
  hasSD: z.string().optional(),
  hasHD: z.string().optional(),
  has4K: z.string().optional(),
  hasHDR: z.string().optional(),

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
        profileImage: z.string().optional(),
      })
    )
    .optional(),

  // Video
  videoUrl: z.string().optional(),
  videoSourceType: z.enum(["URL", "UPLOADED"]).default("URL"),
  videoSD: z.string().optional(),
  videoHD: z.string().optional(),
  video4K: z.string().optional(),
  videoHDR: z.string().optional(),

  // TV Show specific
  seasons: z.array(
    z.object({
      id: z.string(),
      seasonNumber: z.number(),
      title: z.string().optional(),
      overview: z.string().optional(),
      posterImage: z.string().optional(),
      releaseYear: z.number().optional(),
      episodes: z.array(
        z.object({
          id: z.string(),
          episodeNumber: z.number(),
          title: z.string(),
          description: z.string().optional(),
          duration: z.number().optional(),
          thumbnailImage: z.string().optional(),
          videoUrl: z.string().optional(),
          videoFile: z.string().optional(),
          videoSourceType: z.enum(["URL", "UPLOADED"]),
          videoSD: z.string().optional(),
          videoHD: z.string().optional(),
          video4K: z.string().optional(),
          videoHDR: z.string().optional(),
        })
      ),
    })
  ).optional(),
});

// Navigation items
const baseNavItems = [
  { id: "basic", label: "Basic Info", icon: <Info size={16} /> },
  { id: "media", label: "Media", icon: <Film size={16} /> },
  { id: "genres", label: "Genres", icon: <Tag size={16} /> },
  { id: "cast", label: "Cast", icon: <Users size={16} /> },
  { id: "video", label: "Video", icon: <Video size={16} /> },
  { id: "features", label: "Features", icon: <Settings size={16} /> },
];

const tvShowNavItem = {
  id: "tvshow",
  label: "Seasons & Episodes",
  icon: <ListVideo size={16} />,
};

type ContentFormValues = z.infer<typeof contentFormSchema>;

const AdminContentEditPage = () => {
  const params = useParams();
  const contentId = params.id as string;
  const router = useRouter();
  
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

  // TV Show seasons state
  const [seasons, setSeasons] = useState<any[]>([]);
  const [collapsedSeasons, setCollapsedSeasons] = useState<string[]>([]);

  // Cast members state
  const [castMembers, setCastMembers] = useState<any[]>([]);

  const {
    currentContent,
    fetchContentById,
    updateContent,
    uploadPosterImage,
    uploadBackdropImage,
    uploadTrailer,
    uploadVideo,
    loading,
    error,
  } = useMovieStore();

  const { categories, fetchCategories } = useCategoryStore();

  // Fetch content data when component mounts
  useEffect(() => {
    fetchContentById(contentId);
    fetchCategories();
  }, [contentId, fetchContentById, fetchCategories]);

  // Form setup
  const form = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "MOVIE",
      releaseYear: new Date().getFullYear(),
      maturityRating: MaturityRating.PG_13,
    //   language: "en",
      trailerType: "URL",
      featured: false,
      trending: false,
      newRelease: false,
      hasSD:"",
      hasHD:"",
      has4K: "",
      hasHDR: "",
      audioLanguages: ["en"],
      subtitleLanguages: ["en"],
      availableFrom: new Date(),
      videoSourceType: "URL",
    },
  });

  // Update form values when currentContent changes
  useEffect(() => {
    if (currentContent) {
      // Set form values from currentContent
      form.reset({
        title: currentContent.title,
        description: currentContent.description,
        type: currentContent.type,
        releaseYear: currentContent.releaseYear,
        maturityRating: currentContent.maturityRating,
        duration: currentContent.duration,
        // director: currentContent.cast.director || "",
        // studio: currentContent.cast.studio || "",
        // language: currentContent.cast.language || "en",
        // country: currentContent.cast.country || "",
        // awards: currentContent.cast.awards || "",
        posterImage: currentContent.posterImage,
        backdropImage: currentContent.backdropImage || "",
        trailerUrl: currentContent.trailerUrl || "",
        trailerType: currentContent.trailerType,
        featured: currentContent.featured,
        trending: currentContent.trending,
        newRelease: currentContent.newRelease,
        hasSD: currentContent.videoSD,
        hasHD: currentContent.videoHD,
        has4K: currentContent.video4K,
        hasHDR: currentContent.videoHDR,
        // audioLanguages: currentContent.audioLanguages || ["en"],
        // subtitleLanguages: currentContent.subtitleLanguages || ["en"],
        // availableFrom: currentContent.availableFrom ? new Date(currentContent.availableFrom) : new Date(),
        // availableUntil: currentContent.availableUntil ? new Date(currentContent.availableUntil) : undefined,
        genreIds: currentContent.genres?.map(genre => genre.id) || [],
        castMembers: currentContent.cast || [],
        videoUrl: currentContent.videoUrl || "",
        videoSourceType: currentContent.videoSourceType,
        videoSD: currentContent.videoSD || "",
        videoHD: currentContent.videoHD || "",
        video4K: currentContent.video4K || "",
        videoHDR: currentContent.videoHDR || "",
      });
      
      // Set preview images
      setPosterPreview(currentContent.posterImage);
      setBackdropPreview(currentContent.backdropImage || null);
      setTrailerPreview(currentContent.trailerUrl || null);
      setVideoPreview(currentContent.videoUrl || null);
      
      // Initialize cast members
      if (currentContent.cast && currentContent.cast.length > 0) {
        setCastMembers(currentContent.cast.map(castMember => ({
          id: castMember.id || uuidv4(),
          name: castMember.name,
          role: castMember.role,
          character: castMember.character || "",
          profileImage: castMember.profileImage || ""
        })));
      } else {
        // Initialize with one empty cast member if none exist
        setCastMembers([{ 
          id: uuidv4(), 
          name: "", 
          role: "", 
          character: "" 
        }]);
      }
      
      // Initialize seasons for TV shows
      if (currentContent.type === "TV_SHOW" && currentContent.seasons) {
        setSeasons(currentContent.seasons.map(season => ({
          id: season.id,
          seasonNumber: season.seasonNumber,
          title: season.title || "",
          overview: season.overview || "",
          posterImage: season.posterImage || "",
          releaseYear: season.releaseYear || new Date().getFullYear(),
          episodes: season.episodes.map(episode => ({
            id: episode.id,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            description: episode.description || "",
            duration: episode.duration || 0,
            thumbnailImage: episode.thumbnailImage || "",
            videoUrl: episode.videoUrl || "",
            videoFile: "",
            videoSourceType: episode.videoSourceType,
            videoSD: episode.videoSD || "",
            videoHD: episode.videoHD || "",
            video4K: episode.video4K || "",
            videoHDR: episode.videoHDR || "",
          })),
        })));
      }
    }
  }, [currentContent, form]);

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
    if (form.watch("type") === "TV_SHOW") {
      form.setValue("seasons", seasons);
    }
  }, [seasons, form]);
  
  // Cast member management functions
  const addCastMember = () => {
    setCastMembers([
      ...castMembers,
      { id: uuidv4(), name: "", role: "", character: "" }
    ]);
  };
  
  const removeCastMember = (id: string) => {
    setCastMembers(castMembers.filter(member => member.id !== id));
  };
  
  const updateCastMember = (id: string, field: string, value: string) => {
    setCastMembers(
      castMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };
  
  // Update form value when cast members change
  useEffect(() => {
    form.setValue("castMembers", castMembers);
  }, [castMembers, form]);
  
  // Get the current content type to determine if we should show TV show specific fields
  const contentType = form.watch("type");
  
  // Dynamically determine navigation items based on content type
  const navItems =
    contentType === "TV_SHOW" ? [...baseNavItems, tvShowNavItem] : baseNavItems;
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof contentFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Prepare update data
      const updateData: any = {
        title: data.title,
        description: data.description,
        type: data.type,
        releaseYear: data.releaseYear,
        maturityRating: data.maturityRating,
        duration: data.duration,
        // director: data.director,
        // studio: data.studio,
        // language: data.language,
        // country: data.country,
        // awards: data.awards,
        featured: data.featured,
        trending: data.trending,
        newRelease: data.newRelease,
        hasSD: data.hasSD,
        hasHD: data.hasHD,
        has4K: data.has4K,
        hasHDR: data.hasHDR,
        audioLanguages: data.audioLanguages,
        subtitleLanguages: data.subtitleLanguages,
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,
        genreIds: data.genreIds,
        cast: castMembers.filter(member => member.name.trim() !== ""),
      };
      
      // Add TV show-specific fields
      if (data.type === "TV_SHOW") {
        updateData.seasons = seasons;
      }
      
      // Handle file uploads if files were selected
      let posterImageUrl = data.posterImage;
      if (posterFile) {
        const posterFormData = new FormData();
        posterFormData.append("file", posterFile);
        const posterResponse = await useMovieStore
          .getState()
          .uploadPosterImage(posterFormData);
        posterImageUrl = posterResponse.data.posterImage;
      }
      
      let backdropImageUrl = data.backdropImage;
      if (backdropFile) {
        const backdropFormData = new FormData();
        backdropFormData.append("file", backdropFile);
        const backdropResponse = await useMovieStore
          .getState()
          .uploadBackdropImage(backdropFormData);
        backdropImageUrl = backdropResponse.data.backdropImage;
      }
      
      // Handle trailer upload
      let trailerData: any = {
        trailerUrl: data.trailerUrl,
        trailerType: data.trailerType,
      };
      
      if (data.trailerType === "URL" && data.trailerUrl) {
        trailerData.trailerUrl = data.trailerUrl;
      } else if (data.trailerType === "UPLOADED" && trailerFile) {
        try {
          const trailerResponse = await useMovieStore
            .getState()
            .uploadTrailer(contentId, trailerFile, "UPLOADED");
          
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
      let videoData: any = {
        videoUrl: data.videoUrl,
        videoSourceType: data.videoSourceType,
        videoSD: data.videoSD,
        videoHD: data.videoHD,
        video4K: data.video4K,
        videoHDR: data.videoHDR,
      };
      
      if (data.videoSourceType === "URL" && data.videoUrl) {
        videoData.videoUrl = data.videoUrl;
      } else if (data.videoSourceType === "UPLOADED" && videoFile) {
        try {
          const videoResponse = await useMovieStore
            .getState()
            .uploadVideo(contentId, videoFile, "UPLOADED");
          
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
          return;
        }
      }
      
      // Now update the content with all the data
      const contentData = {
        ...updateData,
        posterImage: posterImageUrl,
        backdropImage: backdropImageUrl,
        ...trailerData,
        ...videoData,
      };
      
      await updateContent(contentId, contentData);
      
      toast.success("Content updated successfully");
      router.push("/admin/content");
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Error updating content");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (loading && !currentContent) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium">Loading content...</h2>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !currentContent) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
          <h2 className="text-xl font-medium text-destructive mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => fetchContentById(contentId)}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Content</h1>
          <Button
            type="button"
            onClick={() => router.push("/admin/content")}
            variant="outline"
          >
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-20">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
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
            </div>
          </div>
          
          {/* Main content */}
          <div className="col-span-12 md:col-span-9">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Basic Info Section */}
                {activeSection === "basic" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Basic Information</h2>
                        
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter description"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
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
                                <FormLabel>Content Type</FormLabel>
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
                                    <SelectItem value="TV_SHOW">TV Show</SelectItem>
                                    <SelectItem value="DOCUMENTARY">Documentary</SelectItem>
                                    <SelectItem value="SHORT_FILM">Short Film</SelectItem>
                                    <SelectItem value="SPECIAL">Special</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="releaseYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Release Year</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1900}
                                    max={new Date().getFullYear() + 5}
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
                            name="maturityRating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maturity Rating</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="G">G</SelectItem>
                                    <SelectItem value="PG">PG</SelectItem>
                                    <SelectItem value="PG_13">PG-13</SelectItem>
                                    <SelectItem value="R">R</SelectItem>
                                    <SelectItem value="NC_17">NC-17</SelectItem>
                                    <SelectItem value="TV_Y">TV-Y</SelectItem>
                                    <SelectItem value="TV_Y7">TV-Y7</SelectItem>
                                    <SelectItem value="TV_G">TV-G</SelectItem>
                                    <SelectItem value="TV_PG">TV-PG</SelectItem>
                                    <SelectItem value="TV_14">TV-14</SelectItem>
                                    <SelectItem value="TV_MA">TV-MA</SelectItem>
                                  </SelectContent>
                                </Select>
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
                                    <Input type="number" min={1} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Language</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                    <SelectItem value="it">Italian</SelectItem>
                                    <SelectItem value="ja">Japanese</SelectItem>
                                    <SelectItem value="ko">Korean</SelectItem>
                                    <SelectItem value="zh">Chinese</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="ar">Arabic</SelectItem>
                                    <SelectItem value="ru">Russian</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country of Origin</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Media Section */}
                {activeSection === "media" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Media Assets</h2>
                        
                        <div className="space-y-4">
                          <div>
                            <FormLabel>Poster Image</FormLabel>
                            <div className="mt-2 flex items-center gap-4">
                              {posterPreview && (
                                <div className="relative w-32 h-48 rounded-md overflow-hidden border border-border">
                                  <Image
                                    src={posterPreview}
                                    alt="Poster preview"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      setPosterFile(file);
                                      setPosterPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  Recommended: 2:3 ratio, minimum 500x750px
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <FormLabel>Backdrop Image</FormLabel>
                            <div className="mt-2 flex items-center gap-4">
                              {backdropPreview && (
                                <div className="relative w-64 h-36 rounded-md overflow-hidden border border-border">
                                  <Image
                                    src={backdropPreview}
                                    alt="Backdrop preview"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      setBackdropFile(file);
                                      setBackdropPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  Recommended: 16:9 ratio, minimum 1280x720px
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <FormLabel>Trailer</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="trailerType"
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Trailer source" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="URL">External URL</SelectItem>
                                        <SelectItem value="UPLOADED">Upload File</SelectItem>
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
                                      <FormControl>
                                        <Input
                                          placeholder="Enter trailer URL"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e);
                                            setTrailerPreview(e.target.value);
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ) : (
                                <div>
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setTrailerFile(file);
                                        setTrailerPreview(URL.createObjectURL(file));
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {trailerPreview && form.watch("trailerType") === "URL" && (
                              <div className="mt-4">
                                <iframe
                                  src={trailerPreview}
                                  className="w-full aspect-video rounded-md border border-border"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                            
                            {trailerPreview && form.watch("trailerType") === "UPLOADED" && (
                              <div className="mt-4">
                                <video
                                  src={trailerPreview}
                                  controls
                                  className="w-full aspect-video rounded-md border border-border"
                                ></video>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Genres Section */}
                {activeSection === "genres" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Genres</h2>
                        
                        <FormField
                          control={form.control}
                          name="genreIds"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categories.map((category) => (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedGenres = checked
                                            ? [...(field.value || []), category.id]
                                            : (field.value || []).filter(
                                                (id) => id !== category.id
                                              );
                                          field.onChange(updatedGenres);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {category.name}
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
                )}
                
                {/* Cast Section */}
                {activeSection === "cast" && (
                  <Card>
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
                                    value={member.name}
                                    onChange={(e) =>
                                      updateCastMember(member.id, "name", e.target.value)
                                    }
                                    placeholder="Actor/Crew Name"
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
                                      <SelectItem value="ACTOR">Actor</SelectItem>
                                      <SelectItem value="DIRECTOR">Director</SelectItem>
                                      <SelectItem value="PRODUCER">Producer</SelectItem>
                                      <SelectItem value="WRITER">Writer</SelectItem>
                                      <SelectItem value="CINEMATOGRAPHER">
                                        Cinematographer
                                      </SelectItem>
                                      <SelectItem value="COMPOSER">Composer</SelectItem>
                                      <SelectItem value="EDITOR">Editor</SelectItem>
                                      <SelectItem value="PRODUCTION_DESIGNER">
                                        Production Designer
                                      </SelectItem>
                                      <SelectItem value="COSTUME_DESIGNER">
                                        Costume Designer
                                      </SelectItem>
                                      <SelectItem value="SOUND_DESIGNER">
                                        Sound Designer
                                      </SelectItem>
                                      <SelectItem value="VISUAL_EFFECTS">
                                        Visual Effects
                                      </SelectItem>
                                      <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <FormLabel>Character (for actors)</FormLabel>
                                  <Input
                                    value={member.character || ""}
                                    onChange={(e) =>
                                      updateCastMember(
                                        member.id,
                                        "character",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Character Name"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Video Section */}
                {activeSection === "video" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Video Content</h2>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Video source" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="URL">External URL</SelectItem>
                                      <SelectItem value="UPLOADED">Upload File</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {form.watch("videoSourceType") === "URL" ? (
                              <FormField
                                control={form.control}
                                name="videoUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Video URL</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter video URL"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          setVideoPreview(e.target.value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <div>
                                <FormLabel>Upload Video</FormLabel>
                                <Input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      setVideoFile(file);
                                      setVideoPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          {videoPreview && form.watch("videoSourceType") === "URL" && (
                            <div className="mt-4">
                              <iframe
                                src={videoPreview}
                                className="w-full aspect-video rounded-md border border-border"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )}
                          
                          {videoPreview && form.watch("videoSourceType") === "UPLOADED" && (
                            <div className="mt-4">
                              <video
                                src={videoPreview}
                                controls
                                className="w-full aspect-video rounded-md border border-border"
                              ></video>
                            </div>
                          )}
                          
                          <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-medium">Quality Versions</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <FormLabel>SD Version</FormLabel>
                                <Input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      // Handle SD video upload
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
                                      // Handle HD video upload
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
                                      // Handle 4K video upload
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
                                      // Handle HDR video upload
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Features Section */}
                {activeSection === "features" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Features & Availability</h2>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="featured"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Featured</FormLabel>
                                    <FormDescription>
                                      Show on homepage featured carousel
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="trending"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Trending</FormLabel>
                                    <FormDescription>
                                      Show in trending section
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="newRelease"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">New Release</FormLabel>
                                    <FormDescription>
                                      Show in new releases section
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-medium">Availability</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
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
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* TV Show Seasons & Episodes Section */}
                {activeSection === "tvshow" && contentType === "TV_SHOW" && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold">Seasons & Episodes</h2>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSeason}
                            className="flex items-center gap-1"
                          >
                            <Plus size={16} />
                            <span>Add Season</span>
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {seasons.map((season) => (
                            <motion.div
                              key={season.id}
                              className="border border-border rounded-lg overflow-hidden"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div
                                className="bg-card p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSeasonCollapse(season.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <TvIcon size={18} />
                                  <h3 className="font-medium">
                                    Season {season.seasonNumber}
                                    {season.title && `: ${season.title}`}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSeason(season.id);
                                    }}
                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                              
                              {collapsedSeasons.includes(season.id) && (
                                <div className="p-4">
                                  {season.episodes.map((episode) => (
                                    <div
                                      key={episode.id}
                                      className="border border-border rounded-lg p-4 mb-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">
                                          Episode {episode.episodeNumber}
                                        </h4>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeEpisode(season.id, episode.id);
                                          }}
                                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Form submission button */}
                <div className="mt-8 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">Updating Content...</span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "Update Content"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContentEditPage;
