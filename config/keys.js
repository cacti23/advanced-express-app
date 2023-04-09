/**
 * @file
 * This file will
 * - In Production: Pull the keys values out of envs as used by Heroku envs.
 * - In Development: Pull the keys values defined in the .env root of the project for development.
 */

require("dotenv").config();

if (process.env.NODE_ENV === "prod") {
  module.exports = require("./prod");
} else if (process.env.NODE_ENV === "ci") {
  module.exports = require("./ci");
} else {
  module.exports = require("./dev");
}
