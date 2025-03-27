import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const prisma = new PrismaClient();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Now TypeScript knows token is definitely a string
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    if (!decoded.id) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { activeProfile: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;

    // Get user from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};
