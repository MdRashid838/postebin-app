import mongoose from "mongoose";

/**
 * GET /api/healthz
 * Health check endpoint
 */
const healthCheck = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;

    /**
     * readyState meanings:
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     */

    const isDbConnected = dbState === 1;

    return res.status(200).json({
      ok: true,
      db: isDbConnected ? "connected" : "not_connected",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Health check failed",
    });
  }
};

export default healthCheck;
