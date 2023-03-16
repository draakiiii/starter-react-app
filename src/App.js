import logo from './logo.svg';
import './App.css';

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const openaiApiKey = process.env.OPENAI_API_KEY;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("static")); // Esto sirve los archivos estáticos en la carpeta "static"

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});

app.get("/prompts", (req, res) => {
  res.sendFile(__dirname + "/static/prompts.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/static/chat.html");
});

app.get("/teach", (req, res) => {
  res.sendFile(__dirname + "/static/teach.html");
});

app.post("/api/:subpath", async (req, res) => {
  const subpath = req.params.subpath;
  const message = req.body.message;

  let systemContent;
  switch (subpath) {
    case "prompts":
      systemContent = "You are an artificial intelligence that creates prompts for the Midjourney image AI. Compose a simple text that includes the provided elements to generate the final image. You must send the response in ENGLISH, it is very important. Also, it doesn't have to be a very long text";
      break;
    case "chat":
      systemContent = "You are an AI that engages in a normal conversation with a human. Respond to the user's message in a natural and human-like manner, without appearing as an AI. Responde todo en el idioma adecuado para la conversacion";
      break;
    case "teach":
      systemContent = "You are an AI designed to learn tasks from user instructions. Listen carefully to the user's input and adapt your behavior to perform the task as accurately as possible. Responde todo en el idioma adecuado para la conversacion";
      break;
    default:
      return res.status(404).json({ error: "Invalid URL" });
  }

  try {
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const reply = openaiResponse.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the request" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
