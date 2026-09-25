import Image from "next/image";

import { PackageIcon } from "./icons";

interface ProductImageProps {
  src: string | null;
  /** Vacío cuando la imagen es decorativa y el nombre ya está en el texto vecino. */
  alt?: string;
  /** Tamaños reales en pantalla: el navegador pide solo el ancho necesario. */
  sizes: string;
  /** Solo para la imagen principal de la página (mejora el LCP). */
  priority?: boolean;
  iconSize?: number;
}

/**
 * Imagen de producto optimizada (redimensionada y en WebP/AVIF por Next). El contenedor
 * padre debe ser `relative` y tener tamaño: la imagen lo llena.
 */
export function ProductImage({ src, alt = "", sizes, priority = false, iconSize = 36 }: ProductImageProps) {
  if (!src) {
    return (
      <span className="flex h-full w-full items-center justify-center text-border-strong">
        <PackageIcon size={iconSize} />
      </span>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
}
