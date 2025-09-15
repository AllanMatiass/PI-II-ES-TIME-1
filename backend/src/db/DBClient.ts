// Autor: Allan Giovanni Matias Paes & Cristian Eduardo Fava
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";

type Where<T> = Partial<T>;
const professorQuery = `id, name, email, phone`;

export class DatabaseClient {
    private pool: any;

    constructor() {
        this.pool = mysql.createPool({
            host: "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASS || "root",
            database: "nota_dez_db",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }

    async query(sql: string, params: any[] = []): Promise<any> {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error: any) {
            console.error("Database query error:", error);
            throw new Error(`Database query failed: ${error.message}`);
        }
    }

    async generateId(): Promise<string> {
        return uuidv4();
    }

    table<T extends Record<string, any>>(tableName: string) {
        return {
            insert: async (data: T) => {
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map(() => "?").join(", ");
                const id = await this.generateId();

                const sql = `INSERT INTO ${tableName} (id, ${keys.join(", ")})
                 VALUES (?, ${placeholders})`;
                return this.query(sql, [id, ...values]);
            },

            update: async (data: Partial<T>, where: Where<T>) => {
                if (!where || Object.keys(where).length === 0) {
                    throw new Error("update needs at least one condition in `where` field");
                }

                const setFields = Object.keys(data)
                    .map((key) => `${key} = ?`)
                    .join(", ");

                const conditions = Object.keys(where)
                    .map((key) => `${key} = ?`)
                    .join(" AND ");

                const sql = `UPDATE ${tableName} SET ${setFields} WHERE ${conditions}`;

                const values = [...Object.values(data), ...Object.values(where)];

                return this.query(sql, values);
            },

            findMany: async (where?: Where<T>): Promise<T[]> => {
                let sql = tableName.toLowerCase().trim() !== 'professor' ?
                    `SELECT * FROM ${tableName}` :
                    `SELECT ${professorQuery} FROM ${tableName}`;

                let values: any[] = [];

                if (where && Object.keys(where).length > 0) {
                    const conditions = Object.keys(where)
                        .map((key) => `${key} = ?`)
                        .join(" AND ");
                    sql += ` WHERE ${conditions}`;
                    values = Object.values(where);
                }

                return this.query(sql, values);
            },

            findUnique: async (where: Where<T>): Promise<T | null> => {
                if (!where || Object.keys(where).length === 0) {
                    throw new Error("findUnique needs at least one condition in `where` field");
                }

                const conditions = Object.keys(where)
                    .map((key) => `${key} = ?`)
                    .join(" AND ");

                const sql = tableName.toLowerCase().trim() !== 'professor' ?
                    `SELECT * FROM ${tableName} WHERE ${conditions} LIMIT 1` :
                    `SELECT ${professorQuery} FROM ${tableName} WHERE ${conditions} LIMIT 1`;

                const rows = (await this.query(sql, Object.values(where))) as T[];

                if (!rows[0]) {
                    return null;
                }

                return rows.length > 0 ? rows[0] : null;
            },

            deleteMany: async (where?: Where<T>) => {
                let sql = `DELETE FROM ${tableName}`;
                let values: any[] = [];

                if (where && Object.keys(where).length > 0) {
                    const conditions = Object.keys(where)
                        .map((key) => `${key} = ?`)
                        .join(" AND ");
                    sql += ` WHERE ${conditions}`;
                    values = Object.values(where);
                }

                return this.query(sql, values);
            },
        };
    }
}
