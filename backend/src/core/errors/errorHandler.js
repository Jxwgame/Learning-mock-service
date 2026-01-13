module.exports = function errorHandler(err, req, res, next) {
  const status =
    typeof err.status === "number"
      ? err.status
      : typeof err.status?.status === "number"
        ? err.status.status
        : 500;

  const code = err.code || err.message || "INTERNAL_SERVER_ERROR";
  const message = err.message || "INTERNAL_SERVER_ERROR";

  if (process.env.NODE_ENV !== "production") console.error(err);

  return res.status(status).json({
    ok: false,
    error: { code, message },
    request_id: req.ctx?.request_id,
  });
};
