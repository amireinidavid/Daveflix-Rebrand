import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "@prisma/client";

// Define types for request user
interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Helper function to generate tokens
function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "60m" }
  );
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

// Helper function to set auth cookies
async function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        error: "Please provide firstName, lastName, email and password",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    // Create profile for the user
    const profile = await prisma.profile.create({
      data: {
        name: `${firstName}'s Profile`,
        avatar: `https://cdn.vectorstock.com/i/1000x1000/44/01/default-avatar-photo-placeholder-icon-grey-vector-38594401.webp`,
        userId: user.id
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Set active profile
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        activeProfileId: profile.id
      },
    });

    // Store refresh token in a cookie instead of database
    await setAuthCookies(res, accessToken, refreshToken);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Registration successful! Your profile has been created.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: {
          id: profile.id,
          avatar: profile.avatar,
        }
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      error: "Registration failed. Please try again later." 
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
      return;
    }

    // Find user with profiles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profiles: true,
        activeProfile: true
      }
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Set cookies
    await setAuthCookies(res, accessToken, refreshToken);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profiles: user.profiles,
        activeProfile: user.activeProfile
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      error: "Login failed. Please try again later." 
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      success: false,
      error: "Logout failed" 
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: "Refresh token not found",
      });
      return;
    }

    // Verify token using JWT secret
    try {
      const decoded = jwt.verify(req.cookies.accessToken, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid user",
        });
        return;
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user.id,
        user.email,
        user.role
      );

      // Set cookies
      await setAuthCookies(res, accessToken, newRefreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to refresh token" 
    });
  }
};

// Get current user
export const getCurrentUser = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    // User ID should be available from auth middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Find user with profiles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
        activeProfile: true,
        watchHistory: true,
        watchlist: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Return user data
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profiles: user.profiles,
        activeProfile: user.activeProfile,
        watchHistory: user.watchHistory,
        watchlist: user.watchlist
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get user data" 
    });
  }
};

// Create profile
export const createProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const { name, isKids, avatar } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: "Profile name is required",
      });
      return;
    }

    // Check if user has reached max profiles (e.g., 5)
    const profileCount = await prisma.profile.count({
      where: { userId },
    });

    if (profileCount >= 5) {
      res.status(400).json({
        success: false,
        error: "Maximum number of profiles reached",
      });
      return;
    }

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        name,
        isKids: isKids || false,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create profile" 
    });
  }
};

// Update profile
export const updateProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { profileId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Check if profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!existingProfile) {
      res.status(404).json({
        success: false,
        error: "Profile not found",
      });
      return;
    }

    const { name, isKids, avatar, pin } = req.body;

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        name: name || undefined,
        isKids: isKids !== undefined ? isKids : undefined,
        avatar: avatar || undefined,
        pin: pin || undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update profile" 
    });
  }
};

// Set active profile
export const setActiveProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { profileId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Check if profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!existingProfile) {
      res.status(404).json({
        success: false,
        error: "Profile not found",
      });
      return;
    }

    // Set active profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        activeProfileId: profileId,
      },
      include: {
        activeProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Active profile set successfully",
      activeProfile: updatedUser.activeProfile,
    });
  } catch (error) {
    console.error("Set active profile error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to set active profile" 
    });
  }
};

// Delete profile
export const deleteProfile = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { profileId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Check if profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!existingProfile) {
      res.status(404).json({
        success: false,
        error: "Profile not found",
      });
      return;
    }

    // Check if it's the last profile
    const profileCount = await prisma.profile.count({
      where: { userId },
    });

    if (profileCount <= 1) {
      res.status(400).json({
        success: false,
        error: "Cannot delete the last profile",
      });
      return;
    }

    // Check if it's the active profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Delete profile
    await prisma.profile.delete({
      where: { id: profileId },
    });

    // If deleted profile was active, set another profile as active
    if (user?.activeProfileId === profileId) {
      const anotherProfile = await prisma.profile.findFirst({
        where: { userId },
      });

      if (anotherProfile) {
        await prisma.user.update({
          where: { id: userId },
          data: { activeProfileId: anotherProfile.id },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete profile" 
    });
  }
};

// Delete account
export const deleteAccount = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Delete user (cascading delete will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete account" 
    });
  }
};
