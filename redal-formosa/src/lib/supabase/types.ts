// Tipos generados a partir de supabase/migrations/20260924000000_init_schema.sql y 20260924000001_expand_schema_for_sdd.sql
// Regenerar después de cambios en el schema:
//   npx supabase gen types typescript --project-id nkctinnawxjofbfuzvwr --schema public > src/lib/supabase/types.ts

export type UserRole = "comprador" | "emprendedor" | "admin";
export type ContactoEstado = "pendiente" | "contactado" | "cerrado";
export type VerificationStatus = "pendiente" | "approved" | "rejected" | "pending_review";
export type OrderStatus =
  | "pendiente_pago"
  | "pagado"
  | "en_preparacion"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";
export type DeliveryStatus = "aceptado" | "en_camino" | "entregado" | "cancelado" | "fallido";
export type PaymentStatus =
  | "pendiente"
  | "aprobado"
  | "en_custodia"
  | "liquidado"
  | "fallido"
  | "reembolsado";
export type VehicleType = "bicicleta" | "moto" | "auto" | "camion";

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
          verification_status: VerificationStatus;
          verified_at: string | null;
          totp_secret: string | null;
          bank_account: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          totp_secret?: string | null;
          bank_account?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          totp_secret?: string | null;
          bank_account?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
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
          horario_apertura: string | null;
          horario_cierre: string | null;
          comision_repartidor: number | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          ubicacion: string | null;
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
          horario_apertura?: string | null;
          horario_cierre?: string | null;
          comision_repartidor?: number | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          ubicacion?: string | null;
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
          horario_apertura?: string | null;
          horario_cierre?: string | null;
          comision_repartidor?: number | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          ubicacion?: string | null;
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
      validacion_biometrica: {
        Row: {
          id: string;
          user_id: string;
          dni_frente_url: string | null;
          dni_reverso_url: string | null;
          dni_datos: any | null;
          selfie_url: string | null;
          embedding_dni: string | null;
          embedding_selfie: string | null;
          similitud_porcentaje: number | null;
          estado: VerificationStatus;
          rechazo_razon: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          dni_frente_url?: string | null;
          dni_reverso_url?: string | null;
          dni_datos?: any | null;
          selfie_url?: string | null;
          embedding_dni?: string | null;
          embedding_selfie?: string | null;
          similitud_porcentaje?: number | null;
          estado?: VerificationStatus;
          rechazo_razon?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          dni_frente_url?: string | null;
          dni_reverso_url?: string | null;
          dni_datos?: any | null;
          selfie_url?: string | null;
          embedding_dni?: string | null;
          embedding_selfie?: string | null;
          similitud_porcentaje?: number | null;
          estado?: VerificationStatus;
          rechazo_razon?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      repartidores: {
        Row: {
          id: string;
          user_id: string;
          tipo_vehiculo: VehicleType;
          placa_vehiculo: string | null;
          tarifa_base: number;
          tarifa_por_km: number;
          zona_cobertura_radio_km: number | null;
          activo: boolean;
          ubicacion_ultima: string | null;
          ubicacion_actualizado_at: string | null;
          calificacion_promedio: number | null;
          viajes_completados: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo_vehiculo: VehicleType;
          placa_vehiculo?: string | null;
          tarifa_base?: number;
          tarifa_por_km?: number;
          zona_cobertura_radio_km?: number | null;
          activo?: boolean;
          ubicacion_ultima?: string | null;
          ubicacion_actualizado_at?: string | null;
          calificacion_promedio?: number | null;
          viajes_completados?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tipo_vehiculo?: VehicleType;
          placa_vehiculo?: string | null;
          tarifa_base?: number;
          tarifa_por_km?: number;
          zona_cobertura_radio_km?: number | null;
          activo?: boolean;
          ubicacion_ultima?: string | null;
          ubicacion_actualizado_at?: string | null;
          calificacion_promedio?: number | null;
          viajes_completados?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      pedidos: {
        Row: {
          id: string;
          numero_pedido: string;
          comprador_id: string;
          emprendimiento_id: string;
          repartidor_id: string | null;
          estado: OrderStatus;
          tipo_entrega: string;
          direccion_entrega: string | null;
          ubicacion_entrega: string | null;
          monto_total: number;
          monto_envio: number | null;
          distancia_km: number | null;
          nota_cliente: string | null;
          codigo_pin_entrega: string | null;
          entregado_en: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          numero_pedido: string;
          comprador_id: string;
          emprendimiento_id: string;
          repartidor_id?: string | null;
          estado?: OrderStatus;
          tipo_entrega: string;
          direccion_entrega?: string | null;
          ubicacion_entrega?: string | null;
          monto_total: number;
          monto_envio?: number | null;
          distancia_km?: number | null;
          nota_cliente?: string | null;
          codigo_pin_entrega?: string | null;
          entregado_en?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          numero_pedido?: string;
          comprador_id?: string;
          emprendimiento_id?: string;
          repartidor_id?: string | null;
          estado?: OrderStatus;
          tipo_entrega?: string;
          direccion_entrega?: string | null;
          ubicacion_entrega?: string | null;
          monto_total?: number;
          monto_envio?: number | null;
          distancia_km?: number | null;
          nota_cliente?: string | null;
          codigo_pin_entrega?: string | null;
          entregado_en?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          producto_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      pagos: {
        Row: {
          id: string;
          pedido_id: string;
          monto: number;
          estado: PaymentStatus;
          proveedor: string;
          transaccion_id: string | null;
          preferencia_mp_id: string | null;
          webhook_response: any | null;
          retenido_hasta: string | null;
          liquidado_en: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          monto: number;
          estado?: PaymentStatus;
          proveedor?: string;
          transaccion_id?: string | null;
          preferencia_mp_id?: string | null;
          webhook_response?: any | null;
          retenido_hasta?: string | null;
          liquidado_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          monto?: number;
          estado?: PaymentStatus;
          proveedor?: string;
          transaccion_id?: string | null;
          preferencia_mp_id?: string | null;
          webhook_response?: any | null;
          retenido_hasta?: string | null;
          liquidado_en?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      intentos_entrega: {
        Row: {
          id: string;
          pedido_id: string;
          repartidor_id: string;
          estado: DeliveryStatus;
          distancia_estimada_km: number | null;
          tiempo_estimado_min: number | null;
          razon_fallo: string | null;
          accepted_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          repartidor_id: string;
          estado?: DeliveryStatus;
          distancia_estimada_km?: number | null;
          tiempo_estimado_min?: number | null;
          razon_fallo?: string | null;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          repartidor_id?: string;
          estado?: DeliveryStatus;
          distancia_estimada_km?: number | null;
          tiempo_estimado_min?: number | null;
          razon_fallo?: string | null;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ubicaciones_tiempo_real: {
        Row: {
          id: string;
          repartidor_id: string;
          pedido_id: string | null;
          ubicacion: string | null;
          velocidad: number | null;
          precision_metros: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          repartidor_id: string;
          pedido_id?: string | null;
          ubicacion?: string | null;
          velocidad?: number | null;
          precision_metros?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          repartidor_id?: string;
          pedido_id?: string | null;
          ubicacion?: string | null;
          velocidad?: number | null;
          precision_metros?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
