export default function ProductorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="page-container flex-1 py-section">{children}</div>
    </div>
  );
}
