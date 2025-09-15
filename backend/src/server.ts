import express from 'express'
import session from 'express-session'
import cors from 'cors'
import fs from 'fs';

import { config } from 'dotenv'
import { DatabaseClient } from './db/DBClient';
import { ProfessorDataModel } from 'dataModels';
import { config } from 'dotenv';

// Arquivo env
config();

const db = new DatabaseClient();
const professorClient = db.table<ProfessorDataModel>("professor");
// Servidor
const app = express();

// PORTAS
const BACKEND_PORT = process.env.BACKEND_PORT ?? 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 5000;

// Função para criar as rotas da API
async function CreateRoutes(base: string) {
	const entries = fs.readdirSync(base, { withFileTypes: true });

	for (const entry of entries) {
		const entryPath = `${base}/${entry}`;

		if (entry.isDirectory()) {
			CreateRoutes(entryPath);
		} else {
			const file = await import(entryPath);
			const route = entryPath.slice(0, -3);

			app.use(route, file.default);
		}
	}

}

// CORS para conexão com front-end
app.use(cors({
	origin: `http://localhost:${FRONTEND_PORT}/`,
	credentials: true,
}));

// Inicializa o express-session
app.use(session({
	secret: process.env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
	},
}));

// Aceitar envio de JSON 
app.use(express.json());

// Cria as rotas da API
CreateRoutes("./controllers");

// Inicializa o servidor
app.listen(BACKEND_PORT, () => {
    console.log('Server running!')
})
