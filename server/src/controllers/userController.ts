import { Request, Response } from "express";
import { prisma } from "../server";
import { User, Profile, Subscription } from "@prisma/client";

// Define the type for user with included relations
type UserWithRelations = User & {
  profiles: Profile[];
  subscription: Subscription | null;
  likedMovies: {
    id: string;
    movieId: string;
    createdAt: Date;
  }[];
  watchHistory: {
    id: string;
    movieId: string;
    progress: number;
    lastWatched: Date;
  }[];
};

// Get user details with profiles and subscription
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.id; // From auth middleware

    const user = (await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
            isKids: true,
            avatar: true,
            maturityLevel: true,
            language: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        subscription: {
          select: {
            id: true,
            tier: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,

            // Payment details
            stripeCustomerId: true,
            stripePriceId: true,

            // Trial info
            trialStart: true,
            trialEnd: true,

            // Enhanced features
            maxQuality: true,
            maxSimultaneousStreams: true,
            downloadAllowed: true,
            adFree: true,
            offlineViewing: true,

            // Family sharing
            maxProfiles: true,
            familySharingEnabled: true,

            // Billing details
            billingCycle: true,
            nextBillingDate: true,
            gracePeriodEnd: true,

            createdAt: true,
            updatedAt: true,
          },
        },
        // likedMovies: {
        //   select: {
        //     id: true,
        //     movieId: true,
        //     createdAt: true,
        //   },
        // },
        watchHistory: {
          select: {
            id: true,
            // movieId: true,
            progress: true,
            completed: true,
            lastWatched: true,
            profileId: true,
           
          },
          orderBy: {
            lastWatched: "desc",
          },
          take: 20,
        },
      },
    })) as UserWithRelations | null; // Type assertion here

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;

    // Add computed subscription fields
    const subscriptionData = user.subscription
      ? {
          ...userWithoutPassword,
          isSubscriptionActive: user.subscription.status === "active",
          isInTrialPeriod: user.subscription.trialEnd
            ? new Date() < user.subscription.trialEnd
            : false,
          daysLeftInPeriod: user.subscription.currentPeriodEnd
            ? Math.ceil(
                (user.subscription.currentPeriodEnd.getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
          canAddProfiles:
            user.profiles.length < (user.subscription.maxProfiles || 1),
          hasStreamingLimit: user.subscription.maxSimultaneousStreams > 0,
        }
      : userWithoutPassword;

    res.json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
    });
  }
};

// Get user watch history
export const getWatchHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        // movie: {
        //   select: {
        //     id: true,
        //     title: true,
        //     thumbnailUrl: true,
        //     duration: true,
        //   },
        // },
      },
      orderBy: {
        lastWatched: "desc",
      },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      success: true,
      data: watchHistory,
    });
  } catch (error) {
    console.error("Get watch history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching watch history",
    });
  }
};

// Get user liked movies
// export const getLikedMovies = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const userId = req.user.id;
//     const { limit = 20, offset = 0 } = req.query;

//     // const likedMovies = await prisma.likedMovie.findMany({
//     //   where: { userId },
//     //   include: {
//     //     movie: {
//     //       select: {
//     //         id: true,
//     //         title: true,
//     //         thumbnailUrl: true,
//     //         genre: true,
//     //         year: true,
//     //       },
//     //     },
//     //   },
//     //   orderBy: {
//     //     createdAt: "desc",
//     //   },
//     //   take: Number(limit),
//     //   skip: Number(offset),
//     // });

//     res.json({
//       success: true,
//       data: likedMovies,
//     });
//   } catch (error) {
//     console.error("Get liked movies error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching liked movies",
//     });
//   }
// };
