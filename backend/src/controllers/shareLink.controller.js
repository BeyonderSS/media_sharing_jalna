import ShareLink from '../models/shareLink.model.js';
import Media from '../models/media.model.js';
import { shortenUrl, getShortUrlStats } from '../utils/urlShortner.js';
import appLogger from '../utils/appLogger.js';

/**
 * Create a share link for a media
 */
export const createShareLink = async (req, res, next) => {
  try {
    const { mediaId, expiresAt, password } = req.body;

    // Validate required fields
    if (!mediaId) {
      return res.status(400).json({
        error: {
          message: 'mediaId is required'
        }
      });
    }

    if (!expiresAt) {
      return res.status(400).json({
        error: {
          message: 'expiresAt is required'
        }
      });
    }

    // Check if media exists
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Media not found'
        }
      });
    }

    // Validate expiresAt date
    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({
        error: {
          message: 'Invalid expiresAt date format'
        }
      });
    }

    if (expirationDate <= new Date()) {
      return res.status(400).json({
        error: {
          message: 'expiresAt must be in the future'
        }
      });
    }

    // Create a temporary share link entry first to get the document ID
    // Use a temporary unique shortCode that will be replaced
    const tempShortCode = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempShareUrl = `${req.protocol}://${req.get('host')}/api/gallery/temp`;

    const shareLink = new ShareLink({
      mediaId: mediaId,
      shortCode: tempShortCode,
      shareUrl: tempShareUrl,
      password: password || null,
      expiresAt: expirationDate
    });

    await shareLink.save();

    // Generate the long accessible URL using the document ID
    // Use frontend URL from environment variable or request header
    const frontendBaseUrl = process.env.FRONTEND_URL || req.headers['x-frontend-url'] || `${req.protocol}://${req.get('host')}`;
    const longUrl = `${frontendBaseUrl}/temp-player/${shareLink._id}`;

    // Generate shortened URL using the utility
    let shortUrl;
    try {
      shortUrl = await shortenUrl(longUrl, password || null);
    } catch (error) {
      appLogger.error('Error shortening URL', 'SHARE_LINK', error);
      // Delete the share link if URL shortening fails
      await ShareLink.findByIdAndDelete(shareLink._id);
      return res.status(500).json({
        error: {
          message: 'Failed to generate shortened URL',
          details: error.message
        }
      });
    }

    // Extract short code from shortened URL (assuming format like https://spoo.me/abc123)
    const shortCode = shortUrl.split('/').pop() || shortUrl;

    // Update share link with the actual URLs
    shareLink.shortCode = shortCode;
    shareLink.shareUrl = longUrl;
    await shareLink.save();

    appLogger.info(`Share link created: ${shareLink._id}`, 'SHARE_LINK');

    res.status(201).json({
      message: 'Share link created successfully',
      data: {
        id: shareLink._id,
        mediaId: shareLink.mediaId,
        shortCode: shareLink.shortCode,
        shortUrl: shortUrl,
        longUrl: shareLink.shareUrl,
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    appLogger.error('Error creating share link', 'SHARE_LINK', error);
    next(error);
  }
};

/**
 * Access a share link by documentId
 */
export const accessShareLink = async (req, res, next) => {
  try {
    const { shareLinkId } = req.params;
    // const { password } = req.query;

    // Find share link by the documentId (which is the _id)
    const shareLink = await ShareLink.findById(shareLinkId);

    if (!shareLink) {
      return res.status(404).json({
        error: {
          message: 'Share link not found'
        }
      });
    }

    // Check if expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return res.status(410).json({
        error: {
          message: 'Share link has expired',
          expiredAt: shareLink.expiresAt
        }
      });
    }

    // // Check password if required
    // if (shareLink.password) {
    //   if (!password || password !== shareLink.password) {
    //     return res.status(401).json({
    //       error: {
    //         message: 'Invalid or missing password'
    //       }
    //     });
    //   }
    // }

    // Get the associated media
    const media = await Media.findById(shareLink.mediaId);
    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Associated media not found'
        }
      });
    }

    appLogger.info(`Share link accessed: ${shareLink._id}`, 'SHARE_LINK');

    res.status(200).json({
      message: 'Share link accessed successfully',
      data: {
        media: {
          id: media._id,
          title: media.title,
          size: media.size,
          mimeType: media.mimeType,
          createdAt: media.createdAt,
          url: `${req.protocol}://${req.get('host')}/api/media/${media._id}/file`
        },
        shareLink: {
          id: shareLink._id,
          expiresAt: shareLink.expiresAt,
          createdAt: shareLink.createdAt
        }
      }
    });
  } catch (error) {
    appLogger.error('Error accessing share link', 'SHARE_LINK', error);
    next(error);
  }
};

/**
 * Get analytics for a share link by its document ID
 */
export const getShareLinkAnalytics = async (req, res, next) => {
  try {
    const { shareLinkId } = req.params;
    const { password } = req.query;

    // Find share link by document ID
    const shareLink = await ShareLink.findById(shareLinkId);

    if (!shareLink) {
      return res.status(404).json({
        error: {
          message: 'Share link not found'
        }
      });
    }

    // Get analytics using the shortCode from the share link
    let analytics;
    try {
      analytics = await getShortUrlStats(shareLink.shortCode, password || shareLink.password || null);
    } catch (error) {
      appLogger.error('Error fetching analytics', 'SHARE_LINK', error);
      return res.status(500).json({
        error: {
          message: 'Failed to fetch analytics for shortened URL',
          details: error.message
        }
      });
    }

    appLogger.info(`Analytics retrieved for share link: ${shareLink._id}`, 'SHARE_LINK');

    res.status(200).json({
      message: 'Analytics retrieved successfully',
      data: {
        shareLink: {
          id: shareLink._id,
          mediaId: shareLink.mediaId,
          shortCode: shareLink.shortCode,
          shareUrl: shareLink.shareUrl,
          expiresAt: shareLink.expiresAt,
          createdAt: shareLink.createdAt
        },
        analytics: analytics
      }
    });
  } catch (error) {
    appLogger.error('Error getting share link analytics', 'SHARE_LINK', error);
    next(error);
  }
};

/**
 * Get all share links for a media with filter options
 */
export const getShareLinksByMedia = async (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const { 
      expired, 
      hasPassword, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit,
      skip = 0
    } = req.query;

    // Validate media exists
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Media not found'
        }
      });
    }

    // Build query
    const query = { mediaId: mediaId };
    const orConditions = [];

    // Filter by expiration status
    if (expired !== undefined) {
      const now = new Date();
      if (expired === 'true' || expired === true) {
        query.expiresAt = { $lt: now };
      } else if (expired === 'false' || expired === false) {
        orConditions.push(
          { expiresAt: { $gt: now } },
          { expiresAt: null }
        );
      }
    }

    // Filter by password presence
    if (hasPassword !== undefined) {
      if (hasPassword === 'true' || hasPassword === true) {
        query.password = { $ne: null, $exists: true };
      } else if (hasPassword === 'false' || hasPassword === false) {
        // For "no password", we need to check both null and non-existent
        // We'll add this as a separate condition that must be ANDed with expiration filter
        if (orConditions.length > 0) {
          // Both filters need OR conditions, use $and to combine them
          // mediaId is already in query, so we just add the $and conditions
          query.$and = [
            { $or: orConditions },
            {
              $or: [
                { password: null },
                { password: { $exists: false } }
              ]
            }
          ];
          // Remove expiresAt if it was set directly (it's now in $and)
          delete query.expiresAt;
        } else {
          query.$or = [
            { password: null },
            { password: { $exists: false } }
          ];
        }
      }
    } else if (orConditions.length > 0) {
      // Only expiration filter with OR conditions
      query.$or = orConditions;
    }

    // Build sort object
    const sort = {};
    const validSortFields = ['createdAt', 'expiresAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;
    sort[sortField] = order;

    // Build query options
    const queryOptions = {
      sort: sort,
      skip: parseInt(skip) || 0
    };

    if (limit) {
      queryOptions.limit = parseInt(limit);
    }

    // Execute query
    const shareLinks = await ShareLink.find(query)
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit || null)
      .populate('mediaId', 'title mimeType size');

    // Get total count for pagination
    const totalCount = await ShareLink.countDocuments(query);

    // Format response
    const shareLinksData = shareLinks.map(shareLink => {
      const isExpired = shareLink.expiresAt && new Date() > shareLink.expiresAt;
      return {
        id: shareLink._id,
        mediaId: shareLink.mediaId,
        shortCode: shareLink.shortCode,
        shareUrl: shareLink.shareUrl,
        hasPassword: !!shareLink.password,
        password: shareLink.password, // Include the password
        expiresAt: shareLink.expiresAt,
        isExpired: isExpired,
        createdAt: shareLink.createdAt,
        media: shareLink.mediaId ? {
          id: shareLink.mediaId._id,
          title: shareLink.mediaId.title,
          mimeType: shareLink.mediaId.mimeType,
          size: shareLink.mediaId.size
        } : null
      };
    });

    appLogger.info(`Share links retrieved for media: ${mediaId}`, 'SHARE_LINK');

    res.status(200).json({
      message: 'Share links retrieved successfully',
      data: {
        count: shareLinksData.length,
        total: totalCount,
        filters: {
          expired: expired,
          hasPassword: hasPassword,
          sortBy: sortField,
          sortOrder: order === 1 ? 'asc' : 'desc',
          skip: queryOptions.skip,
          limit: queryOptions.limit || 'none'
        },
        shareLinks: shareLinksData
      }
    });
  } catch (error) {
    appLogger.error('Error getting share links by media', 'SHARE_LINK', error);
    next(error);
  }
};

