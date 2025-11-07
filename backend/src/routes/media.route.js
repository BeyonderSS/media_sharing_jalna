import express from "express";
import { uploadMedia, getAllMedia, getMediaFile, deleteMedia } from "../controllers/media.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Media document ID
 *         title:
 *           type: string
 *           description: Media title/name
 *         size:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         url:
 *           type: string
 *           description: Accessible URL for the media
 *     MediaUpload:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Optional title for the media
 *         file:
 *           type: string
 *           format: binary
 *           description: The file to upload
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload a media file
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The media file to upload
 *               title:
 *                 type: string
 *                 description: Optional title for the media
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       400:
 *         description: Bad request - No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/upload", upload.single('file'), uploadMedia);

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Get all media with accessible URLs, with pagination and search
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter media by title
 *     responses:
 *       200:
 *         description: A paginated list of media
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                   description: Number of media items on the current page
 *                 total:
 *                   type: number
 *                   description: Total number of media items matching the search criteria
 *                 page:
 *                   type: number
 *                   description: Current page number
 *                 pages:
 *                   type: number
 *                   description: Total number of pages
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllMedia);

/**
 * @swagger
 * /api/media/{id}/file:
 *   get:
 *     summary: Get a media file by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media document ID
 *     responses:
 *       200:
 *         description: Media file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Media not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/file", getMediaFile);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Delete a media file
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media document ID
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       404:
 *         description: Media not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteMedia);

export default router;

