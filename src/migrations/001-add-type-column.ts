import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeColumn1700000000001 implements MigrationInterface {
    name = 'AddTypeColumn1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar la columna 'type' con valor por defecto
        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS type VARCHAR DEFAULT 'User'
        `);

        // Actualizar registros existentes basándose en el rol
        await queryRunner.query(`
            UPDATE users SET type = 'Member' WHERE rol = 'member'
        `);
        
        await queryRunner.query(`
            UPDATE users SET type = 'Admin' WHERE rol = 'admin'
        `);

        // Hacer la columna NOT NULL después de actualizar todos los registros
        await queryRunner.query(`
            ALTER TABLE users ALTER COLUMN type SET NOT NULL
        `);

        // Agregar índices para mejorar performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_type ON users(type)
        `);
        
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_rol`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_type`);
        
        // Eliminar la columna type
        await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS type`);
    }
}
