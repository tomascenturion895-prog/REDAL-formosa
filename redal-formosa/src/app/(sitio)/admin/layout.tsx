import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="page-container flex items-center justify-between h-16">
          <h1 className="text-heading">🔧 Panel de Admin</h1>
          <a href="/" className="text-sm text-link hover:underline">
            Volver al sitio
          </a>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 bg-surface border-r border-border sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="p-4 space-y-2">
            <a href="/admin" className="block px-4 py-2 rounded-control hover:bg-surface-muted text-foreground text-sm">
              📊 Dashboard
            </a>
            <a href="/admin/productos" className="block px-4 py-2 rounded-control hover:bg-surface-muted text-foreground text-sm">
              📦 Productos
            </a>
            <a href="/admin/usuarios" className="block px-4 py-2 rounded-control hover:bg-surface-muted text-foreground text-sm">
              👥 Usuarios
            </a>
          </nav>
        </aside>

        <main className="flex-1 page-container py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
