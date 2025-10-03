// Autor: Allan Giovanni Matias Paes & Cristian Eduardo Fava
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";


// T = Tipo dinâmico, usando o tipo definido no Generic.
// Tipo para Where que se molda de acordo com o Tipo colocado no Generic.
type Where<T> = Partial<T>;

export class DatabaseClient {
    private pool: any;

    // Construtor para definir o pool ("Logar na db")
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

    // Método para queries personalizadas.
    async query(sql: string, params: any[] = []): Promise<any> {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error: any) {
            console.error("Database query error:", error);
            throw new Error(`Database query failed: ${error.message}`);
        }
    }

    // Método para gerar um UUID aleatório.
    generateId(): string {
        return uuidv4();
    }

    // Método para definir a tabela que será manipulada.
    table<T extends Record<string, any>>(tableName: string) {

        // Retorna um objeto com várias funções
        return {
            
            // Função para inserir um dado no banco de dados, sem obrigar a colocar o ID na hora que for executar a função.
            insert: async (data: Omit<T, "id">) => {
                
                // Destrincha o objeto recebido.
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map(() => "?").join(", ");

                // Gera um ID aleatório.
                const id = this.generateId();
                
                // Faz a query SQL de forma dinâmica.
                const sql = `INSERT INTO ${tableName} (id, ${keys.join(", ")})
                 VALUES (?, ${placeholders})`;

                // Executa a query montada e retorna o ID.
                await this.query(sql, [id, ...values]);
                return id;
            },

            
            // Função para atualizar um dado
            update: async (data: Partial<T>, where: Where<T>) => {

                // Obriga a ter o parâmetro `Where`
                if (!where || Object.keys(where).length === 0) {
                    throw new Error("update needs at least one condition in `where` field");
                }
                
                // Destrincha o objeto fornecido.
                const setFields = Object.keys(data)
                    .map((key) => `${key} = ?`)
                    .join(", ");

                const conditions = Object.keys(where)
                    .map((key) => `${key} = ?`)
                    .join(" AND ");


                // Monta a query de forma dinâmica
                const sql = `UPDATE ${tableName} SET ${setFields} WHERE ${conditions}`;
                
                // Pega os valores atualizados e retorna a query
                const values = [...Object.values(data), ...Object.values(where)];
                return await this.query(sql, values);
            },

            // Função para encontrar vários registros no banco de dados
            findMany: async (where?: Where<T>): Promise<T[]> => {

                // Montando a query dinâmica
                let sql = `SELECT * FROM ${tableName}`;

                let values: any[] = [];

                // Se tiver where, adiciona no select
                if (where && Object.keys(where).length > 0) {
                    const conditions = Object.keys(where)
                        .map((key) => `${key} = ?`)
                        .join(" AND ");
                    sql += ` WHERE ${conditions}`;
                    values = Object.values(where);
                }

                // Retorna a query de forma dinâmica com Where opcional.
                return await this.query(sql, values);
            },

            // Função para encontrar um único registro
            findUnique: async (where: Where<T>): Promise<T | null> => {
                // Where é obrigatorio.
                if (!where || Object.keys(where).length === 0) {
                    throw new Error("findUnique needs at least one condition in `where` field");
                }

                // Destrincha as condições do where
                const conditions = Object.keys(where)
                    .map((key) => `${key} = ?`)
                    .join(" AND ");

                    // Monta a query de forma dinâmica.
                const sql = `SELECT * FROM ${tableName} WHERE ${conditions} LIMIT 1`;

                // Transforma as linhas da tabela em um Array onde os valores tem o tipo T (definido no generic).
                const rows = (await await this.query(sql, Object.values(where))) as T[];

                // Se não tiver nenhuma linha, retorna nulo.
                if (!rows[0]) {
                    return null;
                }

                // Retorna o primeiro índice da lista.
                return rows.length > 0 ? rows[0] : null;
            },

            // Função para deletar muitos registros
            deleteMany: async (where?: Where<T>) => {
                // Monta o SQL base.
                let sql = `DELETE FROM ${tableName}`;
                let values: any[] = [];

                // Destrincha o where e insere no SQL.
                if (where && Object.keys(where).length > 0) {
                    const conditions = Object.keys(where)
                        .map((key) => `${key} = ?`)
                        .join(" AND ");
                    sql += ` WHERE ${conditions}`;
                    values = Object.values(where);
                }

                // Retorna os objetos deletados
                return await this.query(sql, values);
            },
        };
    }
}
