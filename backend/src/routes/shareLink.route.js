import express from "express";
import { createShareLink, accessShareLink, getShareLinkAnalytics, getShareLinksByMedia } from "../controllers/shareLink.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ShareLink:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Share link document ID
 *         mediaId:
 *           type: string
 *           description: Associated media document ID
 *         shortCode:
 *           type: string
 *           description: Short code for the share link
 *         shortUrl:
 *           type: string
 *           description: Shortened URL
 *         longUrl:
 *           type: string
 *           description: Long accessible URL
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *     CreateShareLinkRequest:
 *       type: object
 *       required:
 *         - mediaId
 *         - expiresAt
 *       properties:
 *         mediaId:
 *           type: string
 *           description: Media document ID to share
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration date and time (ISO 8601 format)
 *         password:
 *           type: string
 *           description: Optional password to protect the share link
 *     ShareLinkAccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             media:
 *               $ref: '#/components/schemas/Media'
 *             shareLink:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/share-link:
 *   post:
 *     summary: Create a share link for a media
 *     tags: [Share Link]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShareLinkRequest'
 *           example:
 *             mediaId: "507f1f77bcf86cd799439011"
 *             expiresAt: "2024-12-31T23:59:59Z"
 *             password: "optional-password"
 *     responses:
 *       201:
 *         description: Share link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ShareLink'
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *       404:
 *         description: Media not found
 *       500:
 *         description: Internal server error
 */
router.post("/share-link", createShareLink);

/**
 * @swagger
 * /api/gallery/{shareLinkId}:
 *   get:
 *     summary: Access a share link by document ID
 *     tags: [Share Link]
 *     parameters:
 *       - in: path
 *         name: shareLinkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Share link document ID
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if the share link is protected
 *     responses:
 *       200:
 *         description: Share link accessed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShareLinkAccessResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing password
 *       404:
 *         description: Share link or associated media not found
 *       410:
 *         description: Share link has expired
 *       500:
 *         description: Internal server error
 */
router.get("/gallery/:shareLinkId", accessShareLink);

/**
 * @swagger
 * /api/share-link/{shareLinkId}/analytics:
 *   get:
 *     summary: Get analytics for a share link by document ID
 *     tags: [Share Link]
 *     parameters:
 *       - in: path
 *         name: shareLinkId
 *         required: true
 *         schema:
 *           type: string
 *         description: Share link document ID
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         description: Password if the share link is protected (optional, will use stored password if not provided)
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
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
 *                     shareLink:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         mediaId:
 *                           type: string
 *                         shortCode:
 *                           type: string
 *                         shareUrl:
 *                           type: string
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     analytics:
 *                       type: object
 *                       description: Analytics data from the URL shortener service
 *       404:
 *         description: Share link not found
 *       500:
 *         description: Internal server error or failed to fetch analytics
 */
router.get("/share-link/:shareLinkId/analytics", getShareLinkAnalytics);

/**
 * @swagger
 * /api/share-link/media/{mediaId}:
 *   get:
 *     summary: Get all share links for a media with filter options
 *     tags: [Share Link]
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Media document ID
 *       - in: query
 *         name: expired
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by expiration status (true for expired, false for not expired)
 *       - in: query
 *         name: hasPassword
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by password presence (true for has password, false for no password)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, expiresAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of results to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip (for pagination)
 *     responses:
 *       200:
 *         description: Share links retrieved successfully
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
 *                     count:
 *                       type: number
 *                       description: Number of results returned
 *                     total:
 *                       type: number
 *                       description: Total number of share links matching the filters
 *                     filters:
 *                       type: object
 *                       description: Applied filter options
 *                     shareLinks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           mediaId:
 *                             type: string
 *                           shortCode:
 *                             type: string
 *                           shareUrl:
 *                             type: string
 *                           hasPassword:
 *                             type: boolean
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                           isExpired:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           media:
 *                             type: object
 *                             nullable: true
 *       404:
 *         description: Media not found
 *       500:
 *         description: Internal server error
 */
router.get("/share-link/media/:mediaId", getShareLinksByMedia);

export default router;

