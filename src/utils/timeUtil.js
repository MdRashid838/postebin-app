/**
 * Get current time
 * - Normal mode: real system time
 * - TEST_MODE=1: use x-test-now-ms header (for automated tests)
 */
function getNow(req) {
  if (
    process.env.TEST_MODE === "1" &&
    req &&
    req.headers &&
    req.headers["x-test-now-ms"]
  ) {
    const testTime = Number(req.headers["x-test-now-ms"]);

    if (!Number.isNaN(testTime)) {
      return new Date(testTime);
    }
  }

  return new Date();
}

export default getNow;