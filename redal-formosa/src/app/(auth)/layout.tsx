import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="font-display text-2xl font-bold tracking-tight text-action">
        RedAL
        <span className="ml-1.5 font-medium text-foreground">Formosa</span>
      </Link>
      <div className="w-full max-w-narrow">{children}</div>
    </div>
  );
}
