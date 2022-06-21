import express from "express";
import redis from "redis";
import mongoose from "mongoose";
import cors from "cors";
import Message from "./models/Message.js";
import "dotenv/config";

const PORT = process.env.CORE_PORT;

const publisher = redis.createClient({
  url: process.env.REDIS,
});

await publisher.connect();

const app = express();

app.use(express.json());

app.use(cors());

const DB_CONNECT = `${process.env.DB_LINK}`;
await mongoose.connect(DB_CONNECT, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

app.post("/answer", async (req, res) => {
  res.send();
  const randomTimeout = Math.floor(1 + Math.random() * 4);
  await sleep(randomTimeout);
  const { userText } = req.body;

  const userMessage = await Message.create({
    actor: "user",
    text: userText,
  });

  const serverMessage = await Message.create({
    actor: "server",
    text: "Hello user",
  });


  await publisher.publish("serverText", JSON.stringify(serverMessage.text));
});

app.get("/messages", async (req, res) => {
  res.send();
  const allMessages = await Message.find();
  await publisher.publish("allMessages", JSON.stringify(allMessages));
});

app.listen(PORT, () => console.log(`START ON PORT ${PORT}`));
