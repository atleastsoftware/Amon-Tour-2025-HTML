import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { Request } from 'express';

// Ensure upload directories exist
const createUploadDirs = async () => {
  await fs.ensureDir(path.join(process.cwd(), 'uploads'));
  await fs.ensureDir(path.join(process.cwd(), 'uploads/tours'));
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(process.cwd(), 'uploads/tours'));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'tour-' + uniqueSuffix + ext);
  }
});

// Create a file filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Configure the multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  }
});

// Helper function to build a public URL for an uploaded file
export const getPublicFileUrl = (filename: string): string => {
  return `/uploads/tours/${filename}`;
};

// Helper function to delete a file
export const deleteFile = async (publicUrl: string): Promise<void> => {
  // Check if this is a local uploaded file
  if (publicUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), publicUrl);
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
    }
  }
};