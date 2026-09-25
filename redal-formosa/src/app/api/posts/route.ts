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

export async function PUT(req: Request) {
  try {
    const { id, content } = await req.json();
    if (!id || !content) {
      return NextResponse.json({ error: "id y content son requeridos" }, { status: 400 });
    }

    if (!fs.existsSync(postsFile)) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    const posts = JSON.parse(fs.readFileSync(postsFile, "utf8"));
    const index = posts.findIndex((p: any) => p.id === Number(id) || p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    posts[index].content = content;
    posts[index].updated_at = new Date().toISOString();

    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return NextResponse.json(posts[index]);
  } catch (e: any) {
    return NextResponse.json({ error: "Error al actualizar la publicación", details: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    let id = idParam ? (isNaN(Number(idParam)) ? idParam : Number(idParam)) : null;

    if (!id) {
      const body = await req.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    if (!fs.existsSync(postsFile)) {
      return NextResponse.json({ success: true });
    }

    let posts = JSON.parse(fs.readFileSync(postsFile, "utf8"));
    posts = posts.filter((p: any) => p.id !== id && p.id !== Number(id));

    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Error al eliminar la publicación", details: e.message }, { status: 500 });
  }
}
