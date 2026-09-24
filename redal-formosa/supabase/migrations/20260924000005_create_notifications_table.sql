-- Crear tabla de notificaciones (auditoría)
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
  asunto VARCHAR(255),
  cuerpo TEXT NOT NULL,
  destinatario VARCHAR(255) NOT NULL, -- email o teléfono
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'enviado', 'fallido'
  intento_numero INTEGER DEFAULT 1,
  ultimo_error TEXT,
  referencia_externa VARCHAR(255), -- ID de SendGrid, Twilio, etc
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enviado_en TIMESTAMP WITH TIME ZONE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_estado ON notificaciones(estado);
CREATE INDEX IF NOT EXISTS idx_notificaciones_creado_en ON notificaciones(creado_en DESC);

-- Crear tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_confirmacion BOOLEAN DEFAULT true,
  email_estado_pedido BOOLEAN DEFAULT true,
  email_ofertas BOOLEAN DEFAULT true,
  sms_confirmacion BOOLEAN DEFAULT false,
  sms_estado_pedido BOOLEAN DEFAULT false,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Solo admins y el usuario pueden ver sus propias notificaciones
CREATE POLICY "Ver propias notificaciones" ON notificaciones
  FOR SELECT
  USING (auth.uid() = usuario_id OR auth.jwt() ->> 'role' = 'admin');

-- Solo backend puede crear notificaciones
CREATE POLICY "Backend crea notificaciones" ON notificaciones
  FOR INSERT
  WITH CHECK (true); -- Restringir en aplicación

-- RLS para preferencias
ALTER TABLE preferencias_notificaciones ENABLE ROW LEVEL SECURITY;

-- Usuarios ven/editan sus propias preferencias
CREATE POLICY "Ver propias preferencias" ON preferencias_notificaciones
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Actualizar propias preferencias" ON preferencias_notificaciones
  FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Crear propias preferencias" ON preferencias_notificaciones
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Función para crear preferencias por defecto
CREATE OR REPLACE FUNCTION crear_preferencias_notificaciones()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO preferencias_notificaciones (usuario_id)
  VALUES (NEW.id)
  ON CONFLICT (usuario_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear preferencias al registrarse
DROP TRIGGER IF EXISTS trigger_crear_preferencias ON auth.users;
CREATE TRIGGER trigger_crear_preferencias
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION crear_preferencias_notificaciones();
