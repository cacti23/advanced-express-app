const mongoose = require("mongoose");
const redis = require("redis");
const url = "redis://127.0.0.1:6379";
const client = redis.createClient(url);
const util = require("util");

// client.get takes callback but we use promisify to change

client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function () {
  this.useCache = true;
  // to make cache chainable
  return this;
};

mongoose.Query.prototype.exec = async function () {
  // here this represents to the current running query
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // see if you have a value for 'key' in redis
  const cachedValue = await client.get(key);

  // if we do return that
  if (cachedValue) {
    // this.model represents the class of model on which this query is running
    const doc = JSON.parse(cachedValue);

    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  client.set(key, JSON.stringify(result));

  return result;
};
