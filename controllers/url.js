const shortid = require("shortid");
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "url is required" });
  const shortID = shortid();

  const expirationTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // Set expiration time to 48 hours from now
  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    visitHistory: [],
    expiresAt: expirationTime,
  });

  return res.json({ id: shortID, expiresAt: expirationTime });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });

  if (!result) {
    return res.status(404).json({ error: "URL not found" });
  }

  if (result.expiresAt && result.expiresAt < new Date()) {
    return res.status(400).json({ error: "URL has expired" });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
