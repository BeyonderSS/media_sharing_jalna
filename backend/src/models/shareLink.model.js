import mongoose from "mongoose";

const ShareLinkSchema = new mongoose.Schema({
    // Reference to the media
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
        required: true
    },

    // Short code used in URL (e.g., abc123)
    shortCode: {
        type: String,
        required: true,
        unique: true
    },

    // Full shareable URL (optional, but convenient)
    shareUrl: {
        type: String,
        required: true
    },

    // Password stored in plain text (as requested)
    password: {
        type: String,
        default: null
    },

    // Link expiration timestamp
    expiresAt: {
        type: Date,
        default: null // null means no expiry
    },


    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-delete expired links
ShareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ShareLink || mongoose.model("ShareLink", ShareLinkSchema);
