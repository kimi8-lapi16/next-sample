import mongoose, { Document, Schema, model, models } from "mongoose";
import { NextResponse } from "next/server";

// ===== 型定義 =====
interface ITask extends Document {
  title: string;
}

// ===== MongoDB接続 =====
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  throw new Error("⚠️ MONGO_URI is not defined in environment variables");
}

const connectDB = async () => {
  console.log("start connectDB", MONGO_URI, mongoose.connection, mongoose.connection.readyState);
  if (mongoose.connection.readyState >= 1) return;
  console.log("let me check connect...", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("done connectDB")
};

// ===== モデル定義 =====
const TaskSchema = new Schema<ITask>(
  { title: { type: String, required: true } },
  { collection: "Tasks" }
);

const Task = models.Task || model<ITask>("Tasks", TaskSchema);

// ===== GET /api/tasks =====
export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().lean();
    return NextResponse.json(tasks, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ===== POST /api/tasks =====
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const newTask = new Task({ title: body.title });
    await newTask.save();
    return NextResponse.json(newTask, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
