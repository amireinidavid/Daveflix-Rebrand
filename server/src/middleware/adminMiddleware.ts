import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
  }
};
