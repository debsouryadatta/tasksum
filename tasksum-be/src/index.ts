// index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./lib/db";
import { summarizeTodos } from "./lib/openai";
import { sendToSlack } from "./lib/slack";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ health: "OK" });
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await db.todo.findMany();
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title, description } = req.body;
    const todo = await db.todo.create({
      data: {
        title,
        description,
      },
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.todo.delete({
      where: { id },
    });
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.post("/summarize", async (req, res) => {
  try {
    // Get all todos
    const todos = await db.todo.findMany();

    if (todos.length === 0) {
      res.status(200).json({ message: "No todos to summarize" });
    }

    // Generate summary using the OpenAI function
    const summary = await summarizeTodos(todos);

    // Store the summary
    const savedSummary = await db.summary.create({
      data: {
        content: summary,
        sentToSlack: false,
      },
    });

    // Send to Slack using the Slack function
    const slackSent = await sendToSlack(summary);

    // Update summary status
    if (slackSent) {
      await db.summary.update({
        where: { id: savedSummary.id },
        data: { sentToSlack: true },
      });
    }

    res.status(200).json({ 
      message: slackSent 
        ? "Todos summarized and sent to Slack" 
        : "Todos summarized but failed to send to Slack", 
      summary 
    });
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({ error: "Failed to summarize todos" });
  }
});

app.listen(8000, () => console.log("Server is running on port 3000"));
