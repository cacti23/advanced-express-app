const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  // will run next request handler and wait for it's completion
  await next();

  clearHash(req.user.id);
};
