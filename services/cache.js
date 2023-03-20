const mongoose = require("mongoose");
const redis = require("redis");
const url = "redis://127.0.0.1:6379";
const client = redis.createClient(url);
const util = require("util");

// client.hget takes callback but we use promisify to change

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  // top level key (check the diagram to understand the redis structure)
  this.hashKey = JSON.stringify(options.key || "");
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
  const cachedValue = await client.hget(this.hashKey, key);

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

  client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
