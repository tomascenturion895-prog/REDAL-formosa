export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          accion: string
          admin_id: string | null
          cambios: Json | null
          creado_en: string
          entidad: string
          entidad_id: string | null
          id: string
        }
        Insert: {
          accion: string
          admin_id?: string | null
          cambios?: Json | null
          creado_en?: string
          entidad: string
          entidad_id?: string | null
          id?: string
        }
        Update: {
          accion?: string
          admin_id?: string | null
          cambios?: Json | null
          creado_en?: string
          entidad?: string
          entidad_id?: string | null
          id?: string
        }
        Relationships: []
      }
      calificaciones: {
        Row: {
          actualizado_en: string | null
          comentario: string | null
          creado_en: string | null
          id: string
          producto_id: string | null
          puntuacion: number
          repartidor_id: string | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string | null
          comentario?: string | null
          creado_en?: string | null
          id?: string
          producto_id?: string | null
          puntuacion: number
          repartidor_id?: string | null
          usuario_id: string
        }
        Update: {
          actualizado_en?: string | null
          comentario?: string | null
          creado_en?: string | null
          id?: string
          producto_id?: string | null
          puntuacion?: number
          repartidor_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "nuevos_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_favoritos_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "calificaciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["similar_id"]
          },
          {
            foreignKeyName: "calificaciones_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidor_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidores"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      contactos: {
        Row: {
          comprador_id: string | null
          created_at: string
          emprendimiento_id: string
          estado: Database["public"]["Enums"]["contacto_estado"]
          id: string
          mensaje: string
          producto_id: string | null
        }
        Insert: {
          comprador_id?: string | null
          created_at?: string
          emprendimiento_id: string
          estado?: Database["public"]["Enums"]["contacto_estado"]
          id?: string
          mensaje: string
          producto_id?: string | null
        }
        Update: {
          comprador_id?: string | null
          created_at?: string
          emprendimiento_id?: string
          estado?: Database["public"]["Enums"]["contacto_estado"]
          id?: string
          mensaje?: string
          producto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contactos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "nuevos_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_favoritos_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "contactos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["similar_id"]
          },
        ]
      }
      emprendimientos: {
        Row: {
          activo: boolean
          comision_repartidor: number | null
          created_at: string
          deleted_at: string | null
          descripcion: string | null
          direccion: string | null
          email: string | null
          horario_apertura: string | null
          horario_cierre: string | null
          id: string
          latitud: number | null
          longitud: number | null
          nombre: string
          owner_id: string
          telefono: string | null
          ubicacion: unknown
          updated_at: string
        }
        Insert: {
          activo?: boolean
          comision_repartidor?: number | null
          created_at?: string
          deleted_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre: string
          owner_id: string
          telefono?: string | null
          ubicacion?: unknown
          updated_at?: string
        }
        Update: {
          activo?: boolean
          comision_repartidor?: number | null
          created_at?: string
          deleted_at?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          owner_id?: string
          telefono?: string | null
          ubicacion?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprendimientos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intentos_entrega: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          created_at: string
          distancia_estimada_km: number | null
          estado: Database["public"]["Enums"]["delivery_status"]
          id: string
          pedido_id: string
          razon_fallo: string | null
          repartidor_id: string
          started_at: string | null
          tiempo_estimado_min: number | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          distancia_estimada_km?: number | null
          estado?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          pedido_id: string
          razon_fallo?: string | null
          repartidor_id: string
          started_at?: string | null
          tiempo_estimado_min?: number | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          distancia_estimada_km?: number | null
          estado?: Database["public"]["Enums"]["delivery_status"]
          id?: string
          pedido_id?: string
          razon_fallo?: string | null
          repartidor_id?: string
          started_at?: string | null
          tiempo_estimado_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intentos_entrega_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intentos_entrega_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "usuario_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intentos_entrega_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidor_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intentos_entrega_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidores"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          asunto: string | null
          creado_en: string | null
          cuerpo: string
          destinatario: string
          enviado_en: string | null
          estado: string | null
          id: string
          intento_numero: number | null
          referencia_externa: string | null
          tipo: string
          ultimo_error: string | null
          usuario_id: string
        }
        Insert: {
          asunto?: string | null
          creado_en?: string | null
          cuerpo: string
          destinatario: string
          enviado_en?: string | null
          estado?: string | null
          id?: string
          intento_numero?: number | null
          referencia_externa?: string | null
          tipo: string
          ultimo_error?: string | null
          usuario_id: string
        }
        Update: {
          asunto?: string | null
          creado_en?: string | null
          cuerpo?: string
          destinatario?: string
          enviado_en?: string | null
          estado?: string | null
          id?: string
          intento_numero?: number | null
          referencia_externa?: string | null
          tipo?: string
          ultimo_error?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          actualizado_en: string | null
          created_at: string
          estado: Database["public"]["Enums"]["payment_status"]
          id: string
          liquidado_en: string | null
          monto: number
          pedido_id: string
          preferencia_mp_id: string | null
          proveedor: string
          referencia_externa: string | null
          retenido_hasta: string | null
          transaccion_id: string | null
          updated_at: string
          webhook_response: Json | null
        }
        Insert: {
          actualizado_en?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["payment_status"]
          id?: string
          liquidado_en?: string | null
          monto: number
          pedido_id: string
          preferencia_mp_id?: string | null
          proveedor?: string
          referencia_externa?: string | null
          retenido_hasta?: string | null
          transaccion_id?: string | null
          updated_at?: string
          webhook_response?: Json | null
        }
        Update: {
          actualizado_en?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["payment_status"]
          id?: string
          liquidado_en?: string | null
          monto?: number
          pedido_id?: string
          preferencia_mp_id?: string | null
          proveedor?: string
          referencia_externa?: string | null
          retenido_hasta?: string | null
          transaccion_id?: string | null
          updated_at?: string
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "usuario_pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          pedido_id: string
          precio_unitario: number
          producto_id: string
          subtotal: number
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          pedido_id?: string
          precio_unitario?: number
          producto_id?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "usuario_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "nuevos_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_favoritos_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["similar_id"]
          },
        ]
      }
      pedidos: {
        Row: {
          codigo_pin_entrega: string | null
          comprador_id: string
          created_at: string
          deleted_at: string | null
          direccion_entrega: string | null
          distancia_km: number | null
          emprendimiento_id: string
          entrega_lat: number | null
          entrega_lng: number | null
          entregado_en: string | null
          estado: Database["public"]["Enums"]["order_status"]
          id: string
          monto_envio: number | null
          monto_total: number
          nota_cliente: string | null
          numero_pedido: string
          repartidor_id: string | null
          tipo_entrega: string
          ubicacion_entrega: unknown
          updated_at: string
        }
        Insert: {
          codigo_pin_entrega?: string | null
          comprador_id: string
          created_at?: string
          deleted_at?: string | null
          direccion_entrega?: string | null
          distancia_km?: number | null
          emprendimiento_id: string
          entrega_lat?: number | null
          entrega_lng?: number | null
          entregado_en?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          monto_envio?: number | null
          monto_total: number
          nota_cliente?: string | null
          numero_pedido: string
          repartidor_id?: string | null
          tipo_entrega: string
          ubicacion_entrega?: unknown
          updated_at?: string
        }
        Update: {
          codigo_pin_entrega?: string | null
          comprador_id?: string
          created_at?: string
          deleted_at?: string | null
          direccion_entrega?: string | null
          distancia_km?: number | null
          emprendimiento_id?: string
          entrega_lat?: number | null
          entrega_lng?: number | null
          entregado_en?: string | null
          estado?: Database["public"]["Enums"]["order_status"]
          id?: string
          monto_envio?: number | null
          monto_total?: number
          nota_cliente?: string | null
          numero_pedido?: string
          repartidor_id?: string | null
          tipo_entrega?: string
          ubicacion_entrega?: unknown
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidor_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "repartidores"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias_notificaciones: {
        Row: {
          actualizado_en: string | null
          email_confirmacion: boolean | null
          email_estado_pedido: boolean | null
          email_ofertas: boolean | null
          id: string
          sms_confirmacion: boolean | null
          sms_estado_pedido: boolean | null
          usuario_id: string
        }
        Insert: {
          actualizado_en?: string | null
          email_confirmacion?: boolean | null
          email_estado_pedido?: boolean | null
          email_ofertas?: boolean | null
          id?: string
          sms_confirmacion?: boolean | null
          sms_estado_pedido?: boolean | null
          usuario_id: string
        }
        Update: {
          actualizado_en?: string | null
          email_confirmacion?: boolean | null
          email_estado_pedido?: boolean | null
          email_ofertas?: boolean | null
          id?: string
          sms_confirmacion?: boolean | null
          sms_estado_pedido?: boolean | null
          usuario_id?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          categoria_id: string | null
          created_at: string
          descripcion: string | null
          disponible: boolean
          emprendimiento_id: string
          id: string
          imagen_url: string | null
          nombre: string
          precio: number
          razon_rechazo: string | null
          search_vector: unknown
          unidad: string
          updated_at: string
          validado: boolean
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          emprendimiento_id: string
          id?: string
          imagen_url?: string | null
          nombre: string
          precio: number
          razon_rechazo?: string | null
          search_vector?: unknown
          unidad?: string
          updated_at?: string
          validado?: boolean
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          emprendimiento_id?: string
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio?: number
          razon_rechazo?: string | null
          search_vector?: unknown
          unidad?: string
          updated_at?: string
          validado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categoria_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bank_account: string | null
          created_at: string
          deleted_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          totp_secret: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bank_account?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          totp_secret?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bank_account?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          totp_secret?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      repartidores: {
        Row: {
          activo: boolean
          calificacion_promedio: number | null
          created_at: string
          deleted_at: string | null
          id: string
          placa_vehiculo: string | null
          tarifa_base: number
          tarifa_por_km: number
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type"]
          ubicacion_actualizado_at: string | null
          ubicacion_ultima: unknown
          updated_at: string
          user_id: string
          viajes_completados: number | null
          zona_cobertura_radio_km: number | null
        }
        Insert: {
          activo?: boolean
          calificacion_promedio?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          placa_vehiculo?: string | null
          tarifa_base?: number
          tarifa_por_km?: number
          tipo_vehiculo: Database["public"]["Enums"]["vehicle_type"]
          ubicacion_actualizado_at?: string | null
          ubicacion_ultima?: unknown
          updated_at?: string
          user_id: string
          viajes_completados?: number | null
          zona_cobertura_radio_km?: number | null
        }
        Update: {
          activo?: boolean
          calificacion_promedio?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          placa_vehiculo?: string | null
          tarifa_base?: number
          tarifa_por_km?: number
          tipo_vehiculo?: Database["public"]["Enums"]["vehicle_type"]
          ubicacion_actualizado_at?: string | null
          ubicacion_ultima?: unknown
          updated_at?: string
          user_id?: string
          viajes_completados?: number | null
          zona_cobertura_radio_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repartidores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          autor_id: string
          calificacion: number
          comentario: string | null
          created_at: string
          emprendimiento_id: string
          id: string
        }
        Insert: {
          autor_id: string
          calificacion: number
          comentario?: string | null
          created_at?: string
          emprendimiento_id: string
          id?: string
        }
        Update: {
          autor_id?: string
          calificacion?: number
          comentario?: string | null
          created_at?: string
          emprendimiento_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resenas_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      ubicaciones_tiempo_real: {
        Row: {
          actualizado_en: string
          created_at: string
          exactitud: number | null
          id: string
          latitud: number | null
          longitud: number | null
          pedido_id: string | null
          precision_metros: number | null
          repartidor_id: string
          rumbo: number | null
          ubicacion: unknown
          velocidad: number | null
        }
        Insert: {
          actualizado_en?: string
          created_at?: string
          exactitud?: number | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          pedido_id?: string | null
          precision_metros?: number | null
          repartidor_id: string
          rumbo?: number | null
          ubicacion?: unknown
          velocidad?: number | null
        }
        Update: {
          actualizado_en?: string
          created_at?: string
          exactitud?: number | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          pedido_id?: string | null
          precision_metros?: number | null
          repartidor_id?: string
          rumbo?: number | null
          ubicacion?: unknown
          velocidad?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_tiempo_real_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_tiempo_real_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "usuario_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_tiempo_real_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: true
            referencedRelation: "repartidor_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubicaciones_tiempo_real_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: true
            referencedRelation: "repartidores"
            referencedColumns: ["id"]
          },
        ]
      }
      validacion_biometrica: {
        Row: {
          created_at: string
          deleted_at: string | null
          dni_datos: Json | null
          dni_frente_url: string | null
          dni_reverso_url: string | null
          embedding_dni: string | null
          embedding_selfie: string | null
          estado: Database["public"]["Enums"]["verification_status"]
          id: string
          rechazo_razon: string | null
          resultado: Json | null
          selfie_url: string | null
          similitud_porcentaje: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          dni_datos?: Json | null
          dni_frente_url?: string | null
          dni_reverso_url?: string | null
          embedding_dni?: string | null
          embedding_selfie?: string | null
          estado?: Database["public"]["Enums"]["verification_status"]
          id?: string
          rechazo_razon?: string | null
          resultado?: Json | null
          selfie_url?: string | null
          similitud_porcentaje?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          dni_datos?: Json | null
          dni_frente_url?: string | null
          dni_reverso_url?: string | null
          embedding_dni?: string | null
          embedding_selfie?: string | null
          estado?: Database["public"]["Enums"]["verification_status"]
          id?: string
          rechazo_razon?: string | null
          resultado?: Json | null
          selfie_url?: string | null
          similitud_porcentaje?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validacion_biometrica_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          creado_en: string | null
          id: string
          producto_id: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string | null
          id?: string
          producto_id: string
          usuario_id: string
        }
        Update: {
          creado_en?: string | null
          id?: string
          producto_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "nuevos_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_favoritos_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "wishlist_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["similar_id"]
          },
          {
            foreignKeyName: "wishlist_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      categoria_stats: {
        Row: {
          categoria: string | null
          id: string | null
          precio_maximo: number | null
          precio_minimo: number | null
          precio_promedio: number | null
          slug: string | null
          total_productos: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      nuevos_productos: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          id: string | null
          imagen_url: string | null
          nombre: string | null
          precio: number | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categoria_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_detalles_completos: {
        Row: {
          cantidad: number | null
          comprador_id: string | null
          detalle_id: string | null
          pedido_estado: Database["public"]["Enums"]["order_status"] | null
          pedido_id: string | null
          precio_unitario: number | null
          producto_id: string | null
          producto_imagen: string | null
          producto_nombre: string | null
          producto_unidad: string | null
          subtotal: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "usuario_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "nuevos_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_favoritos_count"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto_ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["producto_id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos_similares"
            referencedColumns: ["similar_id"]
          },
          {
            foreignKeyName: "pedidos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      producto_favoritos_count: {
        Row: {
          id: string | null
          total_favoritos: number | null
        }
        Relationships: []
      }
      producto_ratings: {
        Row: {
          id: string | null
          promedio_puntuacion: number | null
          puntuacion_maxima: number | null
          puntuacion_minima: number | null
          total_ratings: number | null
        }
        Relationships: []
      }
      productos_similares: {
        Row: {
          imagen_url: string | null
          nombre: string | null
          precio: number | null
          producto_id: string | null
          relevancia: number | null
          similar_id: string | null
        }
        Relationships: []
      }
      repartidor_ratings: {
        Row: {
          id: string | null
          promedio_puntuacion: number | null
          puntuacion_maxima: number | null
          puntuacion_minima: number | null
          total_ratings: number | null
        }
        Relationships: []
      }
      usuario_compras_stats: {
        Row: {
          comprador_id: string | null
          gasto_promedio: number | null
          gasto_total: number | null
          productos_diferentes: number | null
          total_pedidos: number | null
          total_unidades: number | null
          ultimo_pedido: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_pedidos: {
        Row: {
          cantidad_items: number | null
          comprador_id: string | null
          created_at: string | null
          emprendimiento_id: string | null
          emprendimiento_nombre: string | null
          estado: Database["public"]["Enums"]["order_status"] | null
          id: string | null
          monto_envio: number | null
          monto_total: number | null
          numero_pedido: string | null
          tipo_entrega: string | null
          total_unidades: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_get_stats: {
        Args: never
        Returns: {
          ingresos_totales: number
          pedidos_completados: number
          pedidos_en_entrega: number
          total_calificaciones: number
          total_pedidos: number
          total_productos: number
          total_usuarios: number
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          cantidad_pedidos: number
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      admin_pending_products: {
        Args: never
        Returns: {
          created_at: string
          descripcion: string
          emprendimiento_nombre: string
          id: string
          imagen_url: string
          nombre: string
          precio: number
          productor_email: string
          unidad: string
        }[]
      }
      admin_pending_verifications: {
        Args: never
        Returns: {
          created_at: string
          dni_frente_url: string
          dni_reverso_url: string
          email: string
          emprendimiento_nombre: string
          full_name: string
          id: string
          selfie_url: string
          user_id: string
        }[]
      }
      admin_resumen: { Args: never; Returns: Json }
      admin_review_product: {
        Args: { approve: boolean; product_id: string; reason?: string }
        Returns: undefined
      }
      admin_review_verification: {
        Args: { p_approve: boolean; p_id: string; p_reason?: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user: string
        }
        Returns: undefined
      }
      calcular_envio: { Args: { cantidad_lineas: number }; Returns: number }
      crear_pedido: {
        Args: {
          p_direccion: string
          p_emprendimiento_id: string
          p_items: Json
          p_lat?: number
          p_lng?: number
          p_nota?: string
        }
        Returns: {
          out_monto: number
          out_numero: string
          out_pedido_id: string
        }[]
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: never; Returns: boolean }
      is_buyer_of_repartidor: { Args: { rid: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      owns_repartidor: { Args: { rid: string }; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      productor_avanzar_pedido: {
        Args: {
          p_estado: Database["public"]["Enums"]["order_status"]
          p_pedido_id: string
        }
        Returns: undefined
      }
      productor_pedidos: {
        Args: never
        Returns: {
          comprador_nombre: string
          creado_en: string
          direccion_entrega: string
          emprendimiento_id: string
          emprendimiento_nombre: string
          estado: Database["public"]["Enums"]["order_status"]
          id: string
          items: Json
          monto_envio: number
          monto_total: number
          nota_cliente: string
          numero_pedido: string
        }[]
      }
      productos_mas_vendidos: {
        Args: { max_results?: number }
        Returns: {
          imagen_url: string
          nombre: string
          precio: number
          producto_id: string
          veces_comprado: number
        }[]
      }
      recomendaciones_usuario: {
        Args: { max_results?: number }
        Returns: {
          imagen_url: string
          nombre: string
          precio: number
          producto_id: string
          razon: string
          relevancia: number
        }[]
      }
      search_productos: {
        Args: {
          disponible_only?: boolean
          price_max?: number
          price_min?: number
          search_query: string
        }
        Returns: {
          created_at: string
          descripcion: string
          disponible: boolean
          emprendimiento_id: string
          id: string
          imagen_url: string
          nombre: string
          precio: number
          relevance: number
          unidad: string
        }[]
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      contacto_estado: "pendiente" | "contactado" | "cerrado"
      delivery_status:
        | "aceptado"
        | "en_camino"
        | "entregado"
        | "cancelado"
        | "fallido"
      order_status:
        | "pendiente_pago"
        | "pagado"
        | "en_preparacion"
        | "listo"
        | "en_camino"
        | "entregado"
        | "cancelado"
      payment_status:
        | "pendiente"
        | "aprobado"
        | "en_custodia"
        | "liquidado"
        | "fallido"
        | "reembolsado"
      user_role: "comprador" | "emprendedor" | "admin"
      vehicle_type: "bicicleta" | "moto" | "auto" | "camion"
      verification_status:
        | "pendiente"
        | "approved"
        | "rejected"
        | "pending_review"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contacto_estado: ["pendiente", "contactado", "cerrado"],
      delivery_status: [
        "aceptado",
        "en_camino",
        "entregado",
        "cancelado",
        "fallido",
      ],
      order_status: [
        "pendiente_pago",
        "pagado",
        "en_preparacion",
        "listo",
        "en_camino",
        "entregado",
        "cancelado",
      ],
      payment_status: [
        "pendiente",
        "aprobado",
        "en_custodia",
        "liquidado",
        "fallido",
        "reembolsado",
      ],
      user_role: ["comprador", "emprendedor", "admin"],
      vehicle_type: ["bicicleta", "moto", "auto", "camion"],
      verification_status: [
        "pendiente",
        "approved",
        "rejected",
        "pending_review",
      ],
    },
  },
} as const
