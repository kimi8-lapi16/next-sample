import mongoose, { Document, Schema, model, models } from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

interface ITask extends Document {
  title: string;
}

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  throw new Error("⚠️ MONGO_URI is not defined in environment variables");
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
};

const TaskSchema = new Schema<ITask>(
  { title: { type: String, required: true } },
  { collection: "tasks" }
);

const Task = models.Task || model<ITask>("Task", TaskSchema);

// ===== APIハンドラ =====
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const tasks = await Task.find().lean();
      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "title is required" });
      }
      const newTask = new Task({ title });
      await newTask.save();
      return res.status(201).json(newTask);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
