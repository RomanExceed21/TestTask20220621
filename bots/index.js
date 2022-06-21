import express from "express";
import redis from "redis";
import fetch from "node-fetch";
import "dotenv/config";

const PORT = process.env.BOTS_PORT;

const client = redis.createClient({
  url: process.env.REDIS
});

const app = express();

app.use(express.json());

app.post("/message", (req, res) => {
  const { userText } = req.body;
  fetch(`${process.env.REQ_BOTS_ANSWER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userText }),
  }).catch((error) => console.log(error));

  const subscriber = client.duplicate();
  subscriber.connect();

  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      subscriber.unsubscribe("serverText");
      resolve(false);
    }, 3000);
  });

  const success = new Promise((resolve) => {
    subscriber.subscribe("serverText", (message) => {
      resolve(message);
    });
  });

  Promise.race([timeout, success])
    .then((data) => {
      if (!data) {
        res.send("Ответ не был найден");
        return;
      }
      res.send(data);
    })
    .catch((error) => console.log(error));
});

app.get("/messages", async (req, res) => {
  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe("allMessages", (message) => {
    res.send(message);
    subscriber.unsubscribe("allMessages");
  });

  fetch(`${process.env.REQ_BOTS_MESSAGES}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).catch((error) => console.log(error));
});

app.listen(PORT, () => console.log(`START ON PORT ${PORT}`));
