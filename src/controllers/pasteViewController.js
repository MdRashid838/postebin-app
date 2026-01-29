import Paste from "../models/pasteModule.js";
import getNow from "../utils//timeUtil.js";

/**
 * Escape HTML to prevent script execution
 */
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * GET /p/:id
 * Returns HTML page with paste content
 */
const viewPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    const paste = await Paste.findById(id);

    // Not found
    if (!paste) {
      return res.status(404).send("Paste not found");
    }

    // Expired
    if (await paste.isExpired(now)) {
      return res.status(404).send("Paste expired");
    }

    // View limit exceeded
    if (await paste.isViewLimitExceeded()) {
      return res.status(404).send("Paste unavailable");
    }

    // Count view
    paste.views += 1;
    await paste.save();

    const safeContent = escapeHtml(paste.content);

    // HTML response
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Paste</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              padding: 20px;
            }
            pre {
              background: #fff;
              padding: 15px;
              border-radius: 6px;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h2>Your Paste</h2>
          <pre>${safeContent}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("View paste error:", error);
    return res.status(404).send("Paste unavailable");
  }
};

export default viewPaste;