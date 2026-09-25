import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const postsFile = path.join(dataDir, "posts.json");

export async function GET() {
  try {
    if (!fs.existsSync(postsFile)) return NextResponse.json([]);
    const data = fs.readFileSync(postsFile, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const { content, author } = await req.json();
    let posts = [];
    if (fs.existsSync(postsFile)) {
      posts = JSON.parse(fs.readFileSync(postsFile, "utf8"));
    }
    
    const newPost = { 
      id: Date.now(), 
      content, 
      author: author || "Productor", 
      date: new Date().toISOString() 
    };
    
    posts.unshift(newPost);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return NextResponse.json(newPost);
  } catch (e: any) {
    return NextResponse.json({ error: "Error al guardar la publicación", details: e.message }, { status: 500 });
  }
}
