export function notFoundMiddleware(req, res) {
  res.status(404).json({ error: "Not found", path: req.path });
}

// eslint-disable-next-line no-unused-vars
export function errorMiddleware(err, _req, res, _next) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message ?? "Server error";
  res.status(status).json({ error: message });
}

