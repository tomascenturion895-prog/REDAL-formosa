"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  content: string;
  author: string;
  date: string;
};

export function ProducerFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-24 rounded-xl bg-surface-muted"></div>
        <div className="h-24 rounded-xl bg-surface-muted"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null; // No mostrar si no hay posts
  }

  return (
    <div className="w-full mb-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Novedades de Productores
        </h2>
        <span className="flex h-6 items-center rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          En vivo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.slice(0, 6).map((post) => (
          <div 
            key={post.id} 
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{post.author}</h4>
                  <p className="text-xs text-muted">
                    {new Date(post.date).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                "{post.content}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
