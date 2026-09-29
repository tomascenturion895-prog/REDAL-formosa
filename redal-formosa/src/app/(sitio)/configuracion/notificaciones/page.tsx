"use client";

import { loginHref } from "@/lib/auth/login-href";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-context";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UserIcon } from "@/components/ui/icons";
import { PageLoading } from "@/components/ui/skeleton";

export default function NotificationsSettingsPage() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoading />;

  if (!user) {
    return (
      <div className="page-container py-section">
        <EmptyState
          icon={<UserIcon size={36} />}
          title="Ingresá para elegir tus avisos"
          action={
            <Link href={loginHref("/configuracion/notificaciones")} className="btn btn-primary">
              Ingresar
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container py-section">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Notificaciones" description="Elegí cómo querés enterarte del estado de tus pedidos." />
        <NotificationPreferences />
      </div>
    </div>
  );
}
