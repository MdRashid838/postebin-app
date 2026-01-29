import Paste from "../models/pasteModule.js";
import getNow from "../utils/timeUtil.js";

//  Create a new paste
export const createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;
    const baseUrl = process.env.BASE_URl;

    // ===== Validation =====
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res
        .status(400)
        .json({ error: "ttl_seconds must be an integer >= 1" });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res
        .status(400)
        .json({ error: "max_views must be an integer >= 1" });
    }

    const now = getNow(req);

    // ===== Paste data =====
    const pasteData = {
      content: content.trim(), // defaults from schema:
      // expiresAt -> 24h
      // maxViews  -> 5
    };

    // Override defaults if provided
    if (ttl_seconds) {
      pasteData.expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }

    if (max_views) {
      pasteData.maxViews = max_views;
    }

    const paste = await Paste.create(pasteData);
    console.log("TTL:", ttl_seconds);
    console.log("ExpiresAt:", paste.expiresAt);

    return res.status(201).json({
      id: paste._id.toString(),
      url: `${baseUrl}/p/${paste._id}`,
    });
  } catch (error) {
    console.error("Create paste error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /api/pastes/:id
 * Fetch a paste (counts as a view)
 */
export const getPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    const paste = await Paste.findById(id);

    // Not found
    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }

    // Expired
    if (await paste.isExpired(now)) {
      return res.status(404).json({ error: "Paste expired" });
    }

    // View limit exceeded
    if (await paste.isViewLimitExceeded()) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    // Increment views
    paste.views += 1;
    await paste.save();

    return res.status(200).json({
      content: paste.content,
      remaining_views:
        paste.maxViews === null
          ? null
          : Math.max(paste.maxViews - paste.views, 0),
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Get paste error:", error);
    return res.status(404).json({ error: "Paste not available" });
  }
};
