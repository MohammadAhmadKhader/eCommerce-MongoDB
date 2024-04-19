import {createClient} from "redis";
import dotenv from "dotenv";
dotenv.config();

const client = createClient({
    url:`${process.env.REDIS_URL}`
})
client.on("error", function(err) {
    throw err;
});
client.on("connect",()=>{
    console.log("Redis Client Connected Successfully...")
});
(async()=>{
    await client.connect()
})();


export default client;