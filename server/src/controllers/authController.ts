import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

// Helper function to set auth cookie
const setAuthCookie = (res: Response, token: string) => {
  // Set HTTP-only cookie that expires in 30 days
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure in production
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        // Create default profile
        profiles: {
          create: {
            name: firstName || "Default Profile",
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    // Set auth cookie
    setAuthCookie(res, token);

    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profiles: user.profiles,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profiles: true,
        subscription: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Create token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    // Set auth cookie
    setAuthCookie(res, token);

    res.cookie("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profiles: user.profiles,
        subscription: user.subscription,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
    return;
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the auth cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Create new profile
export const createProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id; // From auth middleware
    const { name, isKids, pin, avatar, maturityLevel, language } = req.body;

    // Check profile limit based on subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
        subscription: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const profileLimit = user.subscription?.maxProfiles || 5;
    if (user.profiles.length >= profileLimit) {
      res.status(400).json({
        success: false,
        message: "Profile limit reached",
      });
      return;
    }

    // Create profile with all fields
    const profile = await prisma.profile.create({
      data: {
        name,
        isKids,
        pin,
        avatar,
        maturityLevel: maturityLevel || 18,
        language: language || "en",
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating profile",
    });
  }
};

// Update profile
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id; // From auth middleware
    const { name, isKids, pin, avatar, maturityLevel, language } = req.body;

    // Verify profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!existingProfile) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    // Update profile with all fields
    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        name,
        isKids,
        pin,
        avatar,
        maturityLevel,
        language,
      },
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

// Delete profile
export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id; // From auth middleware

    // Verify profile belongs to user
    const existingProfile = await prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
      },
    });

    if (!existingProfile) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    // Don't allow deleting the last profile
    const profileCount = await prisma.profile.count({
      where: { userId },
    });

    if (profileCount <= 1) {
      res.status(400).json({
        success: false,
        message: "Cannot delete the last profile",
      });
      return;
    }

    // Delete profile
    await prisma.profile.delete({
      where: { id: profileId },
    });

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting profile",
    });
  }
};
