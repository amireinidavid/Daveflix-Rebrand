import { query, Request, Response } from "express";
import {
  PrismaClient,
  Prisma,
  ContentType,
  MaturityRating,
  TrailerType,
  VideoSourceType,
} from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);
const prisma = new PrismaClient();

interface ContentWithGenres {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  releaseYear: number;
  maturityRating: MaturityRating;
  duration: number | null;
  posterImage: string;
  backdropImage: string | null;
  // ... other content fields
  genres: {
    genre: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
  // ... other included relations
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4|webm|mov|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image and video files are allowed"));
  },
});

// Helper function to upload file to cloudinary
const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  resourceType: "image" | "video"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });

    // Delete the local file after upload
    await unlinkAsync(filePath);

    return result;
  } catch (error) {
    // Delete the local file if upload fails
    await unlinkAsync(filePath);
    throw error;
  }
};

// Helper function to delete file from cloudinary
const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video"
) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url: string) => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  return publicId;
};

// ADMIN CONTROLLERS

/**
 * Create a new movie or TV show
 * POST /api/admin/content
 */
export const createContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      releaseYear,
      maturityRating,
      duration,
      director,
      studio,
      language,
      country,
      awards,
      featured,
      trending,
      newRelease,
      hasSD,
      hasHD,
      has4K,
      hasHDR,
      audioLanguages,
      subtitleLanguages,
      genreIds,
      castMembers,
      availableFrom,
      availableUntil,
      posterImage, // Accept the uploaded poster URL
      backdropImage, // Accept the uploaded backdrop URL
      // Trailer fields
      trailerUrl,
      trailerFile,
      trailerType,
      // Video fields
      videoUrl,
      videoSourceType,
      videoSD,
      videoHD,
      video4K,
      videoHDR,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !releaseYear || !maturityRating) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
    }

    // Handle audioLanguages and subtitleLanguages properly
    let parsedAudioLanguages = ["en"];
    let parsedSubtitleLanguages = ["en"];

    if (audioLanguages) {
      // Check if it's already an array
      if (Array.isArray(audioLanguages)) {
        parsedAudioLanguages = audioLanguages;
      } else {
        // Try to parse it as JSON, but handle the case where it's just a string
        try {
          parsedAudioLanguages = JSON.parse(audioLanguages);
        } catch (e) {
          // If it's a single string value, wrap it in an array
          parsedAudioLanguages = [audioLanguages];
        }
      }
    }

    if (subtitleLanguages) {
      // Check if it's already an array
      if (Array.isArray(subtitleLanguages)) {
        parsedSubtitleLanguages = subtitleLanguages;
      } else {
        // Try to parse it as JSON, but handle the case where it's just a string
        try {
          parsedSubtitleLanguages = JSON.parse(subtitleLanguages);
        } catch (e) {
          // If it's a single string value, wrap it in an array
          parsedSubtitleLanguages = [subtitleLanguages];
        }
      }
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type: type as ContentType,
        releaseYear: parseInt(releaseYear),
        maturityRating: maturityRating as MaturityRating,
        duration: duration ? parseInt(duration) : null,
        director: director || null,
        studio: studio || null,
        language: language || "en",
        country: country || null,
        awards: awards || null,
        posterImage: posterImage || "",
        backdropImage: backdropImage || null,
        featured: featured === true || featured === "true",
        trending: trending === true || trending === "true",
        newRelease: newRelease === true || newRelease === "true",
        hasSD: hasSD === true || hasSD === "true",
        hasHD: hasHD === true || hasHD === "true",
        has4K: has4K === true || has4K === "true",
        hasHDR: hasHDR === true || hasHDR === "true",
        audioLanguages: parsedAudioLanguages,
        subtitleLanguages: parsedSubtitleLanguages,
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        // Trailer fields
        trailerUrl: trailerUrl || null,
        trailerFile: trailerFile || null,
        trailerType: trailerType as TrailerType || "URL",
        // Video fields
        videoUrl: videoUrl || null,
        videoSourceType: videoSourceType as VideoSourceType || "URL",
        videoSD: videoSD || null,
        videoHD: videoHD || null,
        video4K: video4K || null,
        videoHDR: videoHDR || null,
      },
    });

    // Add genres if provided
    if (genreIds && Array.isArray(genreIds)) {
      // First, validate that all genre IDs exist
      const existingGenres = await prisma.genre.findMany({
        where: {
          id: {
            in: genreIds
          }
        },
        select: {
          id: true
        }
      });
      
      // Only use the genre IDs that actually exist in the database
      const validGenreIds = existingGenres.map(genre => genre.id);
      
      if (validGenreIds.length > 0) {
        const genreConnections = validGenreIds.map((genreId: string) => ({
          genreId,
          contentId: content.id,
        }));

        await prisma.genreOnContent.createMany({
          data: genreConnections,
        });
      }
    }

    // Add cast members if provided
    if (castMembers && Array.isArray(castMembers)) {
      const castData = castMembers.map((member: any) => ({
        name: member.name,
        role: member.role,
        character: member.character,
        contentId: content.id,
      }));

      await prisma.castMember.createMany({
        data: castData,
      });
    }

    res.status(201).json({
      success: true,
      message: "Content created successfully",
      data: content,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Upload poster image for content
 * POST /api/admin/content/:id/poster
 */
// Fix the uploadPosterImage function
export const uploadPosterImage = async (req: Request, res: Response) => {
  const uploadMiddleware = upload.single("file");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload to cloudinary - make sure your env variables are set correctly
      const result = await uploadToCloudinary(file.path, "posters", "image");

      return res.status(200).json({
        success: true,
        message: "Poster image uploaded successfully",
        data: {
          posterImage: result.secure_url,
        },
      });
    } catch (error) {
      console.error("Error uploading poster image:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload poster image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Upload backdrop image for content
 * POST /api/admin/content/:id/backdrop
 */
export const uploadBackdropImage = async (req: Request, res: Response) => {
  const uploadMiddleware = upload.single("file"); // Change from "posterImage" to "file"

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload to cloudinary
      const result = await uploadToCloudinary(file.path, "backdrops", "image");

      // Update content with new backdrop URL

      return res.status(200).json({
        success: true,
        message: "Backdrop image uploaded successfully",
        data: {
          backdropImage: result.secure_url,
        },
      });
    } catch (error) {
      console.error("Error uploading backdrop image:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload backdrop image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Upload trailer for content
 * POST /api/admin/content/:id/trailer
 */
export const uploadTrailer = async (req: Request, res: Response) => {
  const uploadMiddleware = upload.single("trailer");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { trailerType, trailerUrl } = req.body;
      const file = req.file;

      let trailerData: any = {};

      // Handle based on trailer type
      if (trailerType === "URL") {
        if (!trailerUrl) {
          return res.status(400).json({
            success: false,
            message: "Trailer URL is required for URL type",
          });
        }
        trailerData = {
          trailerUrl,
          trailerFile: null,
          trailerType: "URL",
        };
      } else if (trailerType === "UPLOADED") {
        if (!file) {
          return res.status(400).json({
            success: false,
            message: "Trailer file is required for UPLOADED type",
          });
        }

        // Upload to cloudinary
        const result = await uploadToCloudinary(file.path, "trailers", "video");

        trailerData = {
          trailerFile: result.secure_url,
          trailerUrl: null,
          trailerType: "UPLOADED",
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid trailer type",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Trailer uploaded successfully",
        data: trailerData,
      });
    } catch (error) {
      console.error("Error uploading trailer:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload trailer",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Upload video for movie content
 * POST /api/admin/content/:id/video
 */
/**
 * Upload video for movie content
 * POST /api/admin/upload/video
 */
export const uploadVideo = async (req: Request, res: Response) => {
  const uploadMiddleware = upload.fields([
    { name: "videoSD", maxCount: 1 },
    { name: "videoHD", maxCount: 1 },
    { name: "video4K", maxCount: 1 },
    { name: "videoHDR", maxCount: 1 },
  ]);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { videoSourceType } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let videoData: any = {
        videoSourceType,
      };

      // Handle based on video source type
      if (videoSourceType === "URL") {
        const { videoUrl, videoSD, videoHD, video4K, videoHDR } = req.body;
        videoData = {
          ...videoData,
          videoUrl,
          videoFile: null,
          videoSD: videoSD || null,
          videoHD: videoHD || null,
          video4K: video4K || null,
          videoHDR: videoHDR || null,
        };
      } else if (videoSourceType === "UPLOADED") {
        // Process uploaded files
        let sdUrl = null, hdUrl = null, url4K = null, hdrUrl = null;

        // Upload quality variants if provided
        if (files.videoSD && files.videoSD[0]) {
          const result = await uploadToCloudinary(files.videoSD[0].path, "videos/sd", "video");
          sdUrl = result.secure_url;
        }

        if (files.videoHD && files.videoHD[0]) {
          const result = await uploadToCloudinary(files.videoHD[0].path, "videos/hd", "video");
          hdUrl = result.secure_url;
        }

        if (files.video4K && files.video4K[0]) {
          const result = await uploadToCloudinary(files.video4K[0].path, "videos/4k", "video");
          url4K = result.secure_url;
        }

        if (files.videoHDR && files.videoHDR[0]) {
          const result = await uploadToCloudinary(files.videoHDR[0].path, "videos/hdr", "video");
          hdrUrl = result.secure_url;
        }

        videoData = {
          ...videoData,
          videoUrl: null,
          videoSD: sdUrl,
          videoHD: hdUrl,
          video4K: url4K,
          videoHDR: hdrUrl,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid video source type",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        data: videoData,
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload video",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Create a new season for a TV show
 * POST /api/admin/content/:id/seasons
 */
export const createSeason = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { seasonNumber, title, overview, releaseYear } = req.body;

    // Check if content exists and is a TV show
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
      return;
    }

    if (content.type !== "TV_SHOW") {
      res.status(400).json({
        success: false,
        message: "Seasons can only be added to TV shows",
      });
      return;
    }

    // Check if season already exists
    const existingSeason = await prisma.season.findFirst({
      where: {
        showId: id,
        seasonNumber: parseInt(seasonNumber),
      },
    });

    if (existingSeason) {
      res.status(400).json({
        success: false,
        message: `Season ${seasonNumber} already exists for this show`,
      });
      return;
    }

    // Create new season
    const season = await prisma.season.create({
      data: {
        seasonNumber: parseInt(seasonNumber),
        title,
        overview,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        showId: id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Season created successfully",
      data: season,
    });
  } catch (error) {
    console.error("Error creating season:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create season",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Upload season poster image
 * POST /api/admin/seasons/:id/poster
 */
export const uploadSeasonPoster = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadMiddleware = upload.single("posterImage");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Check if season exists
      const season = await prisma.season.findUnique({
        where: { id },
      });

      if (!season) {
        return res.status(404).json({
          success: false,
          message: "Season not found",
        });
      }

      // Upload to cloudinary
      const result = await uploadToCloudinary(
        file.path,
        "season-posters",
        "image"
      );

      // Update season with new poster URL
      const updatedSeason = await prisma.season.update({
        where: { id },
        data: {
          posterImage: result.secure_url,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Season poster uploaded successfully",
        data: {
          posterImage: result.secure_url,
        },
      });
    } catch (error) {
      console.error("Error uploading season poster:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload season poster",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Create a new episode for a season
 * POST /api/admin/seasons/:id/episodes
 */
export const createEpisode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { episodeNumber, title, description, duration } = req.body;

    // Check if season exists
    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    // Check if episode already exists
    const existingEpisode = await prisma.episode.findFirst({
      where: {
        seasonId: id,
        episodeNumber: parseInt(episodeNumber),
      },
    });

    if (existingEpisode) {
      res.status(400).json({
        success: false,
        message: `Episode ${episodeNumber} already exists for this season`,
      });
    }

    // Create new episode
    const episode = await prisma.episode.create({
      data: {
        episodeNumber: parseInt(episodeNumber),
        title,
        description,
        duration: duration ? parseInt(duration) : null,
        seasonId: id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Episode created successfully",
      data: episode,
    });
  } catch (error) {
    console.error("Error creating episode:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create episode",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Upload episode thumbnail
 * POST /api/admin/episodes/:id/thumbnail
 */
export const uploadEpisodeThumbnail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadMiddleware = upload.single("thumbnailImage");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Check if episode exists
      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        return res.status(404).json({
          success: false,
          message: "Episode not found",
        });
      }

      // Upload to cloudinary
      const result = await uploadToCloudinary(
        file.path,
        "episode-thumbnails",
        "image"
      );

      // Update episode with new thumbnail URL
      const updatedEpisode = await prisma.episode.update({
        where: { id },
        data: {
          thumbnailImage: result.secure_url,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Episode thumbnail uploaded successfully",
        data: {
          thumbnailImage: result.secure_url,
        },
      });
    } catch (error) {
      console.error("Error uploading episode thumbnail:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload episode thumbnail",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

/**
 * Upload episode video
 * POST /api/admin/episodes/:id/video
 */
export const uploadEpisodeVideo = async (req: Request, res: Response) => {
  const uploadMiddleware = upload.fields([
    { name: "video", maxCount: 1 },
    { name: "videoSD", maxCount: 1 },
    { name: "videoHD", maxCount: 1 },
    { name: "video4K", maxCount: 1 },
    { name: "videoHDR", maxCount: 1 },
  ]);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const { id } = req.params;
      const { videoSourceType, videoUrl, videoSD, videoHD, video4K, videoHDR } =
        req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Check if episode exists
      const episode = await prisma.episode.findUnique({
        where: { id },
      });

      if (!episode) {
        return res.status(404).json({
          success: false,
          message: "Episode not found",
        });
      }

      let updateData: any = {
        videoSourceType: videoSourceType as VideoSourceType,
      };

      // Handle based on video source type
      if (videoSourceType === "URL") {
        updateData.videoUrl = videoUrl;
        updateData.videoFile = null;

        // Add quality variants if provided
        if (videoSD) updateData.videoSD = videoSD;
        if (videoHD) updateData.videoHD = videoHD;
        if (video4K) updateData.video4K = video4K;
        if (videoHDR) updateData.videoHDR = videoHDR;
      } else if (videoSourceType === "UPLOADED") {
        // Process uploaded files
        let videoFile = null;

        // Upload main video file if provided
        if (files.video && files.video[0]) {
          const result = await uploadToCloudinary(
            files.video[0].path,
            "videos/episodes",
            "video"
          );
          videoFile = result.secure_url;
        }

        // Upload quality variants if provided
        let sdUrl = null,
          hdUrl = null,
          url4K = null,
          hdrUrl = null;

        if (files.videoSD && files.videoSD[0]) {
          const result = await uploadToCloudinary(
            files.videoSD[0].path,
            "videos/episodes/sd",
            "video"
          );
          sdUrl = result.secure_url;
        }

        if (files.videoHD && files.videoHD[0]) {
          const result = await uploadToCloudinary(
            files.videoHD[0].path,
            "videos/episodes/hd",
            "video"
          );
          hdUrl = result.secure_url;
        }

        if (files.video4K && files.video4K[0]) {
          const result = await uploadToCloudinary(
            files.video4K[0].path,
            "videos/episodes/4k",
            "video"
          );
          url4K = result.secure_url;
        }

        if (files.videoHDR && files.videoHDR[0]) {
          const result = await uploadToCloudinary(
            files.videoHDR[0].path,
            "videos/episodes/hdr",
            "video"
          );
          hdrUrl = result.secure_url;
        }

        updateData = {
          ...updateData,
          videoFile,
          videoUrl: null,
          videoSD: sdUrl,
          videoHD: hdUrl,
          video4K: url4K,
          videoHDR: hdrUrl,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid video source type",
        });
      }

      // Update episode with new video info
      const updatedEpisode = await prisma.episode.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: "Episode video uploaded successfully",
        data: {
          videoSourceType: updatedEpisode.videoSourceType,
          videoUrl: updatedEpisode.videoUrl,
          videoFile: updatedEpisode.videoFile,
          videoSD: updatedEpisode.videoSD,
          videoHD: updatedEpisode.videoHD,
          video4K: updatedEpisode.video4K,
          videoHDR: updatedEpisode.videoHDR,
        },
      });
    } catch (error) {
      console.error("Error uploading episode video:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload episode video",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

// ADMIN CONTENT MANAGEMENT

/**
 * Update content details
 * PUT /api/admin/content/:id
 */
export const updateContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      releaseYear,
      maturityRating,
      duration,
      director,
      studio,
      language,
      country,
      awards,
      featured,
      trending,
      newRelease,
      hasSD,
      hasHD,
      has4K,
      hasHDR,
      audioLanguages,
      subtitleLanguages,
      availableFrom,
      availableUntil,
    } = req.body;

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Update content
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
        description,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        maturityRating: maturityRating as MaturityRating | undefined,
        duration: duration ? parseInt(duration) : undefined,
        director,
        studio,
        language,
        country,
        awards,
        featured: featured === "true",
        trending: trending === "true",
        newRelease: newRelease === "true",
        hasSD: hasSD === "true",
        hasHD: hasHD === "true",
        has4K: has4K === "true",
        hasHDR: hasHDR === "true",
        audioLanguages: audioLanguages ? JSON.parse(audioLanguages) : undefined,
        subtitleLanguages: subtitleLanguages
          ? JSON.parse(subtitleLanguages)
          : undefined,
        availableFrom: availableFrom ? new Date(availableFrom) : undefined,
        availableUntil: availableUntil ? new Date(availableUntil) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update content genres
 * PUT /api/admin/content/:id/genres
 */
export const updateContentGenres = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { genreIds } = req.body;

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Delete existing genre connections
    await prisma.genreOnContent.deleteMany({
      where: { contentId: id },
    });

    // Add new genre connections
    if (genreIds && Array.isArray(genreIds)) {
      const genreConnections = genreIds.map((genreId: string) => ({
        genreId,
        contentId: id,
      }));

      await prisma.genreOnContent.createMany({
        data: genreConnections,
      });
    }

    // Get updated content with genres
    const updatedContent = await prisma.content.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Content genres updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating content genres:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content genres",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update content cast
 * PUT /api/admin/content/:id/cast
 */
export const updateContentCast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { castMembers } = req.body;

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Delete existing cast members
    await prisma.castMember.deleteMany({
      where: { contentId: id },
    });

    // Add new cast members
    if (castMembers && Array.isArray(castMembers)) {
      const castData = castMembers.map((member: any) => ({
        name: member.name,
        role: member.role,
        character: member.character,
        profileImage: member.profileImage,
        contentId: id,
      }));

      await prisma.castMember.createMany({
        data: castData,
      });
    }

    // Get updated content with cast
    const updatedContent = await prisma.content.findUnique({
      where: { id },
      include: {
        cast: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Content cast updated successfully",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Error updating content cast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content cast",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete content
 * DELETE /api/admin/content/:id
 */
export const deleteContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: true,
          },
        },
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
      return;
    }

    // Delete media files from Cloudinary with proper null checks
    if (
      content.posterImage &&
      typeof content.posterImage === "string" &&
      !content.posterImage.includes("placeholder")
    ) {
      const posterId = getPublicIdFromUrl(content.posterImage);
      await deleteFromCloudinary(posterId, "image");
    }

    if (
      content.backdropImage &&
      typeof content.backdropImage === "string" &&
      !content.backdropImage.includes("placeholder")
    ) {
      const backdropId = getPublicIdFromUrl(content.backdropImage);
      await deleteFromCloudinary(backdropId, "image");
    }

    if (content.trailerFile && typeof content.trailerFile === "string") {
      const trailerId = getPublicIdFromUrl(content.trailerFile);
      await deleteFromCloudinary(trailerId, "video");
    }

    if (content.videoFile && typeof content.videoFile === "string") {
      const videoId = getPublicIdFromUrl(content.videoFile);
      await deleteFromCloudinary(videoId, "video");
    }

    // Delete quality variants with proper null checks
    if (content.videoSD && typeof content.videoSD === "string") {
      const videoSDId = getPublicIdFromUrl(content.videoSD);
      await deleteFromCloudinary(videoSDId, "video");
    }

    if (content.videoHD && typeof content.videoHD === "string") {
      const videoHDId = getPublicIdFromUrl(content.videoHD);
      await deleteFromCloudinary(videoHDId, "video");
    }

    if (content.video4K && typeof content.video4K === "string") {
      const video4KId = getPublicIdFromUrl(content.video4K);
      await deleteFromCloudinary(video4KId, "video");
    }

    if (content.videoHDR && typeof content.videoHDR === "string") {
      const videoHDRId = getPublicIdFromUrl(content.videoHDR);
      await deleteFromCloudinary(videoHDRId, "video");
    }

    // For TV shows, delete episode media
    if (content.type === "TV_SHOW") {
      for (const season of content.seasons) {
        for (const episode of season.episodes) {
          if (
            episode.thumbnailImage &&
            typeof episode.thumbnailImage === "string"
          ) {
            const thumbnailId = getPublicIdFromUrl(episode.thumbnailImage);
            await deleteFromCloudinary(thumbnailId, "image");
          }

          if (episode.videoFile && typeof episode.videoFile === "string") {
            const videoId = getPublicIdFromUrl(episode.videoFile);
            await deleteFromCloudinary(videoId, "video");
          }

          // Delete quality variants
          if (episode.videoSD && typeof episode.videoSD === "string") {
            const videoSDId = getPublicIdFromUrl(episode.videoSD);
            await deleteFromCloudinary(videoSDId, "video");
          }

          if (episode.videoHD && typeof episode.videoHD === "string") {
            const videoHDId = getPublicIdFromUrl(episode.videoHD);
            await deleteFromCloudinary(videoHDId, "video");
          }

          if (episode.video4K && typeof episode.video4K === "string") {
            const video4KId = getPublicIdFromUrl(episode.video4K);
            await deleteFromCloudinary(video4KId, "video");
          }

          if (episode.videoHDR && typeof episode.videoHDR === "string") {
            const videoHDRId = getPublicIdFromUrl(episode.videoHDR);
            await deleteFromCloudinary(videoHDRId, "video");
          }
        }
      }
    }

    // Delete content from database (will cascade delete related records)
    await prisma.content.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

// USER CONTENT ENDPOINTS

/**
 * Get all content with pagination and filtering
 * GET /api/content
 */
export const getAllContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      type,
      genre,
      search,
      releaseYear,
      maturityRating,
      featured,
      trending,
      newRelease,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {
      availableFrom: { lte: new Date() },
      OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (releaseYear) {
      where.releaseYear = parseInt(releaseYear as string);
    }

    if (maturityRating) {
      where.maturityRating = maturityRating;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (trending === "true") {
      where.trending = true;
    }

    if (newRelease === "true") {
      where.newRelease = true;
    }

    // Handle genre filter
    if (genre) {
      where.genres = {
        some: {
          genre: {
            name: { equals: genre as string, mode: "insensitive" },
          },
        },
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.content.count({ where });

    // Get content with pagination
    const content = await prisma.content.findMany({
      where,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNum,
    });

    // Format the response
    const formattedContent = content.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedContent,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get content details by ID
 * GET /api/content/:id
 */
export const getContentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        cast: true,
        seasons: {
          orderBy: {
            seasonNumber: "asc",
          },
          include: {
            episodes: {
              orderBy: {
                episodeNumber: "asc",
              },
            },
          },
        },
        ratings: {
          select: {
            score: true,
          },
        },
        reviews: {
          include: {
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
      return;
    }

    // Format the response with proper type assertion
    const formattedContent = {
      ...content,
      genres: content.genres.map((g) => g.genre),
      averageRating:
        content.ratings.length > 0
          ? content.ratings.reduce((sum, item) => sum + item.score, 0) /
            content.ratings.length
          : null,
      ratingCount: content.ratings.length,
    };

    // Increment view count
    await prisma.content.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: formattedContent,
    });
  } catch (error) {
    console.error("Error fetching content details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// USER INTERACTIONS

/**
 * Rate content
 * POST /api/content/:id/rate
 */
export const rateContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    // Validate rating
    const ratingValue = parseInt(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check if user has already rated this content
    const existingRating = await prisma.rating.findFirst({
      where: {
        contentId: id,
        userId,
        profileId,
      },
    });

    let userRating;

    if (existingRating) {
      // Update existing rating
      userRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score: ratingValue },
      });
    } else {
      // Create new rating
      userRating = await prisma.rating.create({
        data: {
          score: ratingValue,
          contentId: id,
          userId,
          profileId,
        },
      });
    }

    // Calculate and update average rating
    const ratings = await prisma.rating.findMany({
      where: { contentId: id },
      select: { score: true },
    });

    const averageRating =
      ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length;

    await prisma.content.update({
      where: { id },
      data: { averageRating },
    });

    res.status(200).json({
      success: true,
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      data: userRating,
    });
  } catch (error) {
    console.error("Error rating content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rate content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add review for content
 * POST /api/content/:id/review
 */
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    if (!text || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Review text is required",
      });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check if user has already reviewed this content
    const existingReview = await prisma.review.findFirst({
      where: {
        contentId: id,
        userId,
        profileId,
      },
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "You have already reviewed this content",
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        content: text,
        rating: 0,
        isPublished: true,
        spoilerAlert: false,
        contentId: id,
        userId,
        profileId,
      },
      include: {
        profile: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Like or unlike content
 * POST /api/content/:id/like
 */
export const toggleLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check if user has already liked this content
    const existingLike = await prisma.like.findFirst({
      where: {
        contentId: id,
        userId,
        profileId,
      },
    });

    let action;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      action = "unliked";

      // Decrement like count
      await prisma.content.update({
        where: { id },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          contentId: id,
          userId,
          profileId,
        },
      });
      action = "liked";

      // Increment like count
      await prisma.content.update({
        where: { id },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Content ${action} successfully`,
      data: { liked: action === "liked" },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add or remove content from watchlist
 * POST /api/content/:id/watchlist
 */
export const toggleWatchlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check if content is already in watchlist
    const existingWatchlist = await prisma.watchlist.findFirst({
      where: {
        contentId: id,
        userId,
        profileId,
      },
    });

    let action;

    if (existingWatchlist) {
      // Remove from watchlist
      await prisma.watchlist.delete({
        where: { id: existingWatchlist.id },
      });
      action = "removed from";
    } else {
      // Add to watchlist
      await prisma.watchlist.create({
        data: {
          contentId: id,
          userId,
          profileId,
        },
      });
      action = "added to";
    }

    res.status(200).json({
      success: true,
      message: `Content ${action} watchlist successfully`,
      data: { inWatchlist: action === "added to" },
    });
  } catch (error) {
    console.error("Error toggling watchlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle watchlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get user's watchlist
 * GET /api/watchlist
 */
export const getWatchlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    const watchlist = await prisma.watchlist.findMany({
      where: {
        userId,
        profileId,
      },
      include: {
        contentItem: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedWatchlist = watchlist.map((item) => ({
      ...item,
      content: {
        ...item.contentItem,
        genres: item.contentItem.genres.map((g) => g.genre),
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedWatchlist,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Record watch history
 * POST /api/content/:id/watch
//  */
// export const recordWatchHistory = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { episodeId, progress, duration } = req.body;
//     const userId = req.user.id;
//     const profileId = req.user.activeProfileId;

//     if (!profileId) {
//       res.status(400).json({
//         success: false,
//         message: "Active profile is required",
//       });
//     }

//     // Check if content exists
//     const content = await prisma.content.findUnique({
//       where: { id },
//       include: {
//         seasons: {
//           include: {
//             episodes: true,
//           },
//         },
//       },
//     });

//     if (!content) {
//       res.status(404).json({
//         success: false,
//         message: "Content not found",
//       });
//       return;
//     }

//     // For TV shows, episode ID is required
//     if (content.type === "TV_SHOW" && !episodeId) {
//       res.status(400).json({
//         success: false,
//         message: "Episode ID is required for TV shows",
//       });
//     }

//     // Validate episode belongs to this content
//     if (episodeId) {
//       const episodeBelongsToContent = content.seasons.some((season) =>
//         season.episodes.some((episode) => episode.id === episodeId)
//       );

//       if (!episodeBelongsToContent) {
//         res.status(400).json({
//           success: false,
//           message: "Episode does not belong to this content",
//         });
//       }
//     }

//     // Calculate completion percentage
//     const progressValue = parseFloat(progress);
//     const durationValue = parseFloat(duration);

//     if (isNaN(progressValue) || isNaN(durationValue) || durationValue === 0) {
//       res.status(400).json({
//         success: false,
//         message: "Valid progress and duration values are required",
//       });
//     }

//     const completionPercentage = Math.min(
//       100,
//       (progressValue / durationValue) * 100
//     );

//     // Determine if completed (>90% watched)
//     const completed = completionPercentage >= 90;

//     // Update watch history
//     let watchHistory;

//     if (episodeId) {
//       // For TV show episodes
//       const existingHistory = await prisma.watchHistory.findFirst({
//         where: {
//           episodeId,
//           userId,
//           profileId,
//         },
//       });

//       if (existingHistory) {
//         watchHistory = await prisma.watchHistory.update({
//           where: { id: existingHistory.id },
//           data: {
//             progress: progressValue,
//             completionPercentage,
//             completed,
//             lastWatched: new Date(),
//           },
//         });
//       } else {
//         watchHistory = await prisma.watchHistory.create({
//           data: {
//             progress: progressValue,
//             watchTime: durationValue,
//             completionPercentage,
//             completed,
//             contentId: id,
//             episodeId,
//             userId,
//             profileId,
//           },
//         });
//       }

//       // Update continue watching
//       if (completionPercentage < 90) {
//         const existingContinueWatching =
//           await prisma.continueWatching.findFirst({
//             where: {
//               episodeId,
//               userId,
//               profileId,
//             },
//           });

//         if (existingContinueWatching) {
//           await prisma.continueWatching.update({
//             where: { id: existingContinueWatching.id },
//             data: {
//               progress: progressValue,
//               status: "IN_PROGRESS",
//               lastWatched: new Date(),
//               completionPercentage,
//             },
//           });
//         } else {
//           await prisma.continueWatching.create({
//             data: {
//               progress: progressValue,
//               status: "IN_PROGRESS",
//               contentId: id,
//               episodeId,
//               userId,
//               profileId,
//               completionPercentage,
//             },
//           });
//         }
//       } else {
//         // Remove from continue watching if completed
//         await prisma.continueWatching.deleteMany({
//           where: {
//             episodeId,
//             userId,
//             profileId,
//           },
//         });
//       }
//     } else {
//       // For movies
//       const existingHistory = await prisma.watchHistory.findFirst({
//         where: {
//           contentId: id,
//           userId,
//           profileId,
//           episodeId: null,
//         },
//       });

//       if (existingHistory) {
//         watchHistory = await prisma.watchHistory.update({
//           where: { id: existingHistory.id },
//           data: {
//             progress: progressValue,
//             completionPercentage,
//             completed,
//             lastWatched: new Date(),
//           },
//         });
//       } else {
//         watchHistory = await prisma.watchHistory.create({
//           data: {
//             progress: progressValue,
//             completionPercentage,
//             completed,
//             watchTime: durationValue,
//             lastWatched: new Date(),
//             contentId: id,
//             userId,
//             profileId,
//           },
//         });
//       }

//       // Update continue watching
//       if (completionPercentage < 90) {
//         const existingContinueWatching =
//           await prisma.continueWatching.findFirst({
//             where: {
//               contentId: id,
//               userId,
//               profileId,
//               episodeId: null,
//             },
//           });

//         if (existingContinueWatching) {
//           await prisma.continueWatching.update({
//             where: { id: existingContinueWatching.id },
//             data: {
//               progress: progressValue,
//               status: "IN_PROGRESS",
//               lastWatched: new Date(),
//               completionPercentage,
//             },
//           });
//         } else {
//           await prisma.continueWatching.create({
//             data: {
//               progress: progressValue,
//               status: "IN_PROGRESS",
//               contentId: id,
//               userId,
//               profileId,
//               completionPercentage,
//             },
//           });
//         }
//       } else {
//         // Remove from continue watching if completed
//         await prisma.continueWatching.deleteMany({
//           where: {
//             contentId: id,
//             userId,
//             profileId,
//             episodeId: null,
//           },
//         });
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Watch history recorded successfully",
//       data: watchHistory,
//     });
//   } catch (error) {
//     console.error("Error recording watch history:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to record watch history",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

// RECOMMENDATIONS AND DISCOVERY

/**
 * Get recommended content for user
 * GET /api/content/recommendations
 */
export const getRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    // Get user's watch history
    const watchHistory = await prisma.watchHistory.findMany({
      where: {
        userId,
        profileId,
      },
      include: {
        Content: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastWatched: "desc",
      },
      take: 20,
    });

    // Extract genre preferences
    const genrePreferences = new Map<string, number>();

    watchHistory.forEach((history) => {
      if (history.Content) {
        history.Content.genres.forEach((genreRelation) => {
          const genreId = genreRelation.genreId;
          genrePreferences.set(
            genreId,
            (genrePreferences.get(genreId) || 0) + 1
          );
        });
      }
    });

    // Sort genres by preference count
    const sortedGenres = [...genrePreferences.entries()]
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .slice(0, 5); // Top 5 genres

    // Get content based on genre preferences
    let recommendations: ContentWithGenres[] = [];

    if (sortedGenres.length > 0) {
      recommendations = await prisma.content.findMany({
        where: {
          genres: {
            some: {
              genreId: {
                in: sortedGenres,
              },
            },
          },
          id: {
            notIn: watchHistory
              .map((h) => h.contentId)
              .filter(Boolean) as string[],
          },
          availableFrom: { lte: new Date() },
          OR: [
            { availableUntil: null },
            { availableUntil: { gte: new Date() } },
          ],
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
        orderBy: [
          {
            averageRating: "desc",
          },
          {
            releaseYear: "desc",
          },
        ],
        take: 20,
      });
    }

    // If not enough recommendations, add trending content
    if (recommendations.length < 10) {
      const additionalContent = await prisma.content.findMany({
        where: {
          trending: true,
          id: {
            notIn: [
              ...(watchHistory
                .map((h) => h.contentId)
                .filter(Boolean) as string[]),
              ...recommendations.map((r) => r.id),
            ],
          },
          availableFrom: { lte: new Date() },
          OR: [
            { availableUntil: null },
            { availableUntil: { gte: new Date() } },
          ],
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
        orderBy: {
          viewCount: "desc",
        },
        take: 20 - recommendations.length,
      });

      recommendations = [...recommendations, ...additionalContent];
    }

    // Format the response
    const formattedRecommendations = recommendations.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedRecommendations,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get continue watching list
 * GET /api/content/continue-watching
 */
export const getContinueWatching = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
    }

    // Get continue watching items
    const continueWatching = await prisma.continueWatching.findMany({
      where: {
        userId,
        profileId,
        status: "IN_PROGRESS",
      },
      include: {
        contentItem: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
          },
        },
        episode: {
          include: {
            season: true,
          },
        },
      },
      orderBy: {
        lastWatched: "desc",
      },
    });

    // Format the response
    const formattedItems = continueWatching.map((item) => ({
      id: item.id,
      progress: item.progress,
      updatedAt: item.lastWatched,
      content: item.contentItem
        ? {
            ...item.contentItem,
            genres: item.contentItem.genres.map((g) => g.genre),
          }
        : null,
      episode: item.episode,
      isEpisode: !!item.episodeId,
    }));

    res.status(200).json({
      success: true,
      data: formattedItems,
    });
  } catch (error) {
    console.error("Error getting continue watching:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get continue watching",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Search content
 * GET /api/content/search
 */
export const searchContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, page = "1", limit = "20" } = req.query;
    const userId = req.user?.id;
    const profileId = req.user?.activeProfileId;

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Define the type for content with included relations
    type ContentWithGenres = Prisma.ContentGetPayload<{
      include: {
        genres: {
          include: {
            genre: true;
          };
        };
      };
    }>;

    // Search content
    const content = (await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
          { director: { contains: query as string, mode: "insensitive" } },
          {
            cast: {
              some: {
                name: { contains: query as string, mode: "insensitive" },
              },
            },
          },
          {
            genres: {
              some: {
                genre: {
                  name: { contains: query as string, mode: "insensitive" },
                },
              },
            },
          },
        ],
        availableFrom: { lte: new Date() },
        // OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: [{ releaseYear: "desc" }, { viewCount: "desc" }],
      skip,
      take: limitNum,
    })) as ContentWithGenres[];

    // Get total count for pagination
    const totalCount = await prisma.content.count({
      where: {
        OR: [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
          { director: { contains: query as string, mode: "insensitive" } },
          {
            cast: {
              some: {
                name: { contains: query as string, mode: "insensitive" },
              },
            },
          },
          {
            genres: {
              some: {
                genre: {
                  name: { contains: query as string, mode: "insensitive" },
                },
              },
            },
          },
        ],
        availableFrom: { lte: new Date() },
        // OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
    });

    // Format the response with proper type checking
    const formattedContent = content.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    // Record search history if user is logged in
    if (userId && profileId) {
      await prisma.searchHistory.create({
        data: {
          query: query as string,
          userId,
          profileId,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: formattedContent,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Error searching content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get featured content
 * GET /api/content/featured
 */
export const getFeaturedContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const featured = await prisma.content.findMany({
      where: {
        featured: true,
        availableFrom: { lte: new Date() },
        OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: [{ releaseYear: "desc" }, { viewCount: "desc" }],
      take: 10,
    });

    // Format the response
    const formattedContent = featured.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedContent,
    });
  } catch (error) {
    console.error("Error getting featured content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get trending content
 * GET /api/content/trending
 */
export const getTrendingContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const trending = await prisma.content.findMany({
      where: {
        trending: true,
        availableFrom: { lte: new Date() },
        OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        viewCount: "desc",
      },
      take: 20,
    });

    // Format the response
    const formattedContent = trending.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedContent,
    });
  } catch (error) {
    console.error("Error getting trending content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trending content",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get new releases
 * GET /api/content/new-releases
 */
export const getNewReleases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newReleases = await prisma.content.findMany({
      where: {
        newRelease: true,
        availableFrom: { lte: new Date() },
        OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        releaseYear: "desc",
      },
      take: 20,
    });

    // Format the response
    const formattedContent = newReleases.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedContent,
    });
  } catch (error) {
    console.error("Error getting new releases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get new releases",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get content by genre
 * GET /api/content/genre/:genreId
 */
export const getContentByGenre = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { genreId } = req.params;
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if genre exists
    const genre = await prisma.genre.findUnique({
      where: { id: genreId },
    });

    if (!genre) {
      res.status(404).json({
        success: false,
        message: "Genre not found",
      });
      return;
    }

    // Get content by genre
    const content = await prisma.content.findMany({
      where: {
        genres: {
          some: {
            genreId,
          },
        },
        availableFrom: { lte: new Date() },
        OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: [{ releaseYear: "desc" }, { viewCount: "desc" }],
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const totalCount = await prisma.content.count({
      where: {
        genres: {
          some: {
            genreId,
          },
        },
        availableFrom: { lte: new Date() },
        OR: [{ availableUntil: null }, { availableUntil: { gte: new Date() } }],
      },
    });

    // Format the response
    const formattedContent = content.map((item) => ({
      ...item,
      genres: item.genres.map((g) => g.genre),
    }));

    res.status(200).json({
      success: true,
      data: formattedContent,
      genre: genre.name, // This is now safe because we checked for null above
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
    return;
  } catch (error) {
    console.error("Error getting content by genre:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get content by genre",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get TV show seasons
 * GET /api/tv-show/:id/seasons
 */
export const getTVShowSeasons = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: true,
          },
          orderBy: {
            seasonNumber: "asc",
          },
        },
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: "TV show not found",
      });
      return;
    }

    if (content.type !== "TV_SHOW") {
      res.status(400).json({
        success: false,
        message: "Content is not a TV show",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: content.seasons,
    });
  } catch (error) {
    console.error("Error getting TV show seasons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get TV show seasons",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get season details
 * GET /api/tv-show/:id/season/:seasonNumber
 */
export const getSeasonDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, seasonNumber } = req.params;
    const seasonNum = parseInt(seasonNumber);

    const season = await prisma.season.findFirst({
      where: {
        showId: id,
        seasonNumber: seasonNum,
      },
      include: {
        episodes: {
          orderBy: {
            episodeNumber: "asc",
          },
        },
      },
    });

    if (!season) {
      res.status(404).json({
        success: false,
        message: "Season not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: season,
    });
  } catch (error) {
    console.error("Error getting season details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get season details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get episode details
 * GET /api/tv-show/:id/season/:seasonNumber/episode/:episodeNumber
 */
export const getEpisodeDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;
    const seasonNum = parseInt(seasonNumber);
    const episodeNum = parseInt(episodeNumber);

    const episode = await prisma.episode.findFirst({
      where: {
        season: {
          showId: id,
          seasonNumber: seasonNum,
        },
        episodeNumber: episodeNum,
      },
      include: {
        season: true,
      },
    });

    if (!episode) {
      res.status(404).json({
        success: false,
        message: "Episode not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: episode,
    });
  } catch (error) {
    console.error("Error getting episode details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get episode details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Record episode watch history
 * POST /api/tv-show/:id/season/:seasonNumber/episode/:episodeNumber/watch-history
 */
export const recordEpisodeWatchHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;
    const { progress, completed } = req.body;
    const userId = req.user.id;
    const profileId = req.user.activeProfileId;

    if (!profileId) {
      res.status(400).json({
        success: false,
        message: "Active profile is required",
      });
      return;
    }

    const episode = await prisma.episode.findFirst({
      where: {
        season: {
          showId: id,
          seasonNumber: parseInt(seasonNumber),
        },
        episodeNumber: parseInt(episodeNumber),
      },
    });

    if (!episode) {
      res.status(404).json({
        success: false,
        message: "Episode not found",
      });
      return;
    }

    // Update or create watch history using the correct unique constraint
    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_profileId_episodeId: {
          userId,
          profileId,
          episodeId: episode.id,
        },
      },
      update: {
        progress,
        completed,
        lastWatched: new Date(),
      },
      create: {
        userId,
        profileId,
        episodeId: episode.id,
        progress,
        completed,
      },
    });

    res.status(200).json({
      success: true,
      data: watchHistory,
    });
  } catch (error) {
    console.error("Error recording episode watch history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record episode watch history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all genres
 * GET /api/genres
 */
export const getAllGenres = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: genres,
    });
  } catch (error) {
    console.error("Error getting all genres:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get genres",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
