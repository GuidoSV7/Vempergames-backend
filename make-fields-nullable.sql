-- Script para hacer nullable los campos description, redeem y termsConditions en la tabla products
-- Ejecutar este script en la base de datos PostgreSQL

-- Hacer nullable el campo description
ALTER TABLE products ALTER COLUMN description DROP NOT NULL;

-- Hacer nullable el campo redeem  
ALTER TABLE products ALTER COLUMN redeem DROP NOT NULL;

-- Hacer nullable el campo termsConditions
ALTER TABLE products ALTER COLUMN termsConditions DROP NOT NULL;

-- Verificar los cambios
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('description', 'redeem', 'termsConditions');
