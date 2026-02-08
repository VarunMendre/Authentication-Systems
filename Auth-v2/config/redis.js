import { createClient } from "redis";

const redisClient = createClient({
  password: "MyStrongPassIs741963",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
await redisClient.connect();
console.log("RedisDB connected");

export default redisClient;