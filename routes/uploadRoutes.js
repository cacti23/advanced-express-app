const AWS = require("aws-sdk");
const uuid = require("uuid");
const authenticate = require("../middleware/authenticate");
const { aws } = require("../config/keys");

AWS.config.update({
  accessKeyId: aws.accessKeyId,
  secretAccessKey: aws.secretAccessKey,
  region: aws.region,
});

s3 = new AWS.S3({ apiVersion: "2006-03-01" });

module.exports = (app) => {
  app.get("/api/upload", authenticate, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      "putObject",
      {
        Bucket: aws.bucket,
        ContentType: "image/jpeg",
        Key: key,
      },
      (err, url) => {
        res.send({ key, url });
      }
    );
  });
};
