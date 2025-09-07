-- Migración para agregar columna 'type' a la tabla users
-- Esto resuelve el error: column "type" of relation "users" contains null values

-- 1. Agregar la columna 'type' con valor por defecto
ALTER TABLE users ADD COLUMN IF NOT EXISTS type VARCHAR DEFAULT 'User';

-- 2. Actualizar registros existentes basándose en el rol
UPDATE users SET type = 'Member' WHERE rol = 'member';
UPDATE users SET type = 'Admin' WHERE rol = 'admin';

-- 3. Hacer la columna NOT NULL después de actualizar todos los registros
ALTER TABLE users ALTER COLUMN type SET NOT NULL;

-- 4. Agregar índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
