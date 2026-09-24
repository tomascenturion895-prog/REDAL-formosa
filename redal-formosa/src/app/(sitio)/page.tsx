import { PageHeader } from "@/components/layout/page-header";

export default function Home() {
  return (
    <div className="page-container py-section">
      <PageHeader
        title="Lo que se produce en Formosa, cerca tuyo"
        description="Encontrá productos y servicios de emprendedores locales y contactalos directamente."
      />
    </div>
  );
}
