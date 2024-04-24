import dotenv from "dotenv";
dotenv.config();
import "./config/database";
import "./config/cloudinary";
import createServer from "./utils/Server";

export const app = createServer();
