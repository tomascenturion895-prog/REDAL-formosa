-- Agregar rol de admin a profiles si no existe
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Crear tabla de auditoría para acciones de admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(100) NOT NULL, -- 'producto', 'usuario', 'pedido', etc
  entidad_id UUID,
  cambios JSONB,
  ip_address INET,
  user_agent TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entidad ON admin_audit_log(entidad);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_creado_en ON admin_audit_log(creado_en DESC);

-- Crear vista de estadísticas
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM productos) as total_productos,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM calificaciones) as total_calificaciones,
  (SELECT COALESCE(SUM(monto_total), 0) FROM pedidos WHERE estado = 'confirmado') as ingresos_totales,
  (SELECT COUNT(*) FROM pedidos WHERE estado = 'confirmado') as pedidos_completados,
  (SELECT COUNT(*) FROM pedidos WHERE estado = 'en_entrega') as pedidos_en_entrega;

-- Crear vista de productos pendientes de validación
CREATE OR REPLACE VIEW productos_pendientes_validacion AS
SELECT
  p.id,
  p.nombre,
  p.descripcion,
  p.precio,
  p.creado_en,
  e.nombre as emprendimiento_nombre,
  u.email as productor_email
FROM productos p
LEFT JOIN emprendimientos e ON p.emprendimiento_id = e.id
LEFT JOIN auth.users u ON e.usuario_id = u.id
WHERE p.validado = false
ORDER BY p.creado_en DESC;

-- Crear vista de usuarios para moderación
CREATE OR REPLACE VIEW usuarios_moderacion AS
SELECT
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.verification_status,
  (SELECT COUNT(*) FROM productos WHERE emprendimiento_id IN (
    SELECT id FROM emprendimientos WHERE usuario_id = u.id
  )) as cantidad_productos,
  (SELECT COUNT(*) FROM pedidos WHERE comprador_id = u.id) as cantidad_pedidos,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- RLS para admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver audit logs
CREATE POLICY "Solo admins ven audit logs" ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Sistema automático de log
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_id, accion, entidad, entidad_id, cambios)
  VALUES (
    auth.uid(),
    TG_ARGV[0],
    TG_ARGV[1],
    NEW.id,
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para promover a admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET is_admin = true
  WHERE id = user_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Función para remover admin
CREATE OR REPLACE FUNCTION remove_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET is_admin = false
  WHERE id = user_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql;
