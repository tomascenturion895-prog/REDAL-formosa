import { Logo } from "@/components/brand/logo";
import { BackButton } from "@/components/layout/back-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 pb-10 pt-20">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <BackButton />
      </div>
      <Logo />
      <div className="w-full max-w-narrow">{children}</div>
    </div>
  );
}
