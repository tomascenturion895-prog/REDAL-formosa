// Tipos generados a mano a partir de supabase/migrations/20260924000000_init_schema.sql
// Si el esquema cambia, regenerar (requiere `npx supabase login` primero):
//   npx supabase gen types typescript --project-id nkctinnawxjofbfuzvwr --schema public > src/lib/supabase/types.ts

export type UserRole = "comprador" | "emprendedor" | "admin";
export type ContactoEstado = "pendiente" | "contactado" | "cerrado";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      categorias: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          slug?: string;
          created_at?: string;
        };
      };
      emprendimientos: {
        Row: {
          id: string;
          owner_id: string;
          nombre: string;
          descripcion: string | null;
          telefono: string | null;
          email: string | null;
          direccion: string | null;
          latitud: number | null;
          longitud: number | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          nombre: string;
          descripcion?: string | null;
          telefono?: string | null;
          email?: string | null;
          direccion?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nombre?: string;
          descripcion?: string | null;
          telefono?: string | null;
          email?: string | null;
          direccion?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      productos: {
        Row: {
          id: string;
          emprendimiento_id: string;
          categoria_id: string | null;
          nombre: string;
          descripcion: string | null;
          precio: number;
          unidad: string;
          imagen_url: string | null;
          disponible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          emprendimiento_id: string;
          categoria_id?: string | null;
          nombre: string;
          descripcion?: string | null;
          precio: number;
          unidad?: string;
          imagen_url?: string | null;
          disponible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          emprendimiento_id?: string;
          categoria_id?: string | null;
          nombre?: string;
          descripcion?: string | null;
          precio?: number;
          unidad?: string;
          imagen_url?: string | null;
          disponible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contactos: {
        Row: {
          id: string;
          comprador_id: string | null;
          emprendimiento_id: string;
          producto_id: string | null;
          mensaje: string;
          estado: ContactoEstado;
          created_at: string;
        };
        Insert: {
          id?: string;
          comprador_id?: string | null;
          emprendimiento_id: string;
          producto_id?: string | null;
          mensaje: string;
          estado?: ContactoEstado;
          created_at?: string;
        };
        Update: {
          id?: string;
          comprador_id?: string | null;
          emprendimiento_id?: string;
          producto_id?: string | null;
          mensaje?: string;
          estado?: ContactoEstado;
          created_at?: string;
        };
      };
      resenas: {
        Row: {
          id: string;
          autor_id: string;
          emprendimiento_id: string;
          calificacion: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          autor_id: string;
          emprendimiento_id: string;
          calificacion: number;
          comentario?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          autor_id?: string;
          emprendimiento_id?: string;
          calificacion?: number;
          comentario?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
