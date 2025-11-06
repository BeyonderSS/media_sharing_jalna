import Media from '../models/media.model.js';
import ShareLink from '../models/shareLink.model.js';
import appLogger from '../utils/appLogger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload a media file
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'No file uploaded'
        }
      });
    }

    const media = new Media({
      mediaPath: req.file.path,
      title: req.body.title || req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    await media.save();

    appLogger.info(`Media uploaded: ${media._id}`, 'MEDIA');

    res.status(201).json({
      message: 'Media uploaded successfully',
      data: {
        id: media._id,
        title: media.title,
        size: media.size,
        mimeType: media.mimeType,
        createdAt: media.createdAt,
        url: `${req.protocol}://${req.get('host')}/api/media/${media._id}/file`
      }
    });
  } catch (error) {
    appLogger.error('Error uploading media', 'MEDIA', error);
    next(error);
  }
};

/**
 * Get all media with accessible URLs
 */
export const getAllMedia = async (req, res, next) => {
  try {
    const medias = await Media.find().sort({ createdAt: -1 });

    const mediasWithUrls = medias.map(media => ({
      id: media._id,
      title: media.title,
      size: media.size,
      mimeType: media.mimeType,
      createdAt: media.createdAt,
      url: `${req.protocol}://${req.get('host')}/api/media/${media._id}/file`
    }));

    res.status(200).json({
      message: 'Media retrieved successfully',
      count: mediasWithUrls.length,
      data: mediasWithUrls
    });
  } catch (error) {
    appLogger.error('Error retrieving media', 'MEDIA', error);
    next(error);
  }
};

/**
 * Get a single media file
 */
export const getMediaFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Media not found'
        }
      });
    }

    const fs = (await import('fs')).default;
    const filePath = path.resolve(media.mediaPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          message: 'Media file not found on disk'
        }
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    appLogger.error('Error retrieving media file', 'MEDIA', error);
    next(error);
  }
};

/**
 * Delete a media file
 */
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Media not found'
        }
      });
    }

    // Delete associated share links first
    await ShareLink.deleteMany({ mediaId: id });
    appLogger.info(`Deleted share links for media: ${id}`, 'MEDIA');

    // Delete the file from filesystem
    const filePath = path.resolve(media.mediaPath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        appLogger.info(`Deleted file: ${filePath}`, 'MEDIA');
      } catch (fileError) {
        appLogger.warn(`Failed to delete file: ${filePath}`, 'MEDIA', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the database entry
    await Media.findByIdAndDelete(id);

    appLogger.info(`Media deleted: ${id}`, 'MEDIA');

    res.status(200).json({
      message: 'Media deleted successfully',
      data: {
        id: id
      }
    });
  } catch (error) {
    appLogger.error('Error deleting media', 'MEDIA', error);
    next(error);
  }
};

