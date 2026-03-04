import express from "express";
import { chatMessage } from "../Controllers/chat.js";

const chatRouter = express.Router();

// POST /api/chat/message
// Body: { message: string, history?: Array<{ from: "user"|"bot", text: string }> }
chatRouter.post("/message", chatMessage);

export default chatRouter;