import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Logo />
      <div className="w-full max-w-narrow">{children}</div>
    </div>
  );
}
