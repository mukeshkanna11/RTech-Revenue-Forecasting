const Redis = require("ioredis");

let redis;
let warned = false;

try {
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    retryStrategy: () => null // stop infinite retry
  });

  redis.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redis.on("error", () => {
    if (!warned) {
      console.log("⚠ Redis not running - caching disabled");
      warned = true;
    }
  });

} catch (error) {
  console.log("⚠ Redis initialization failed");
}

module.exports = redis;