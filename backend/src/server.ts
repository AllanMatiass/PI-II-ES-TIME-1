import express from 'express'
import session from 'express-session'
import cors from 'cors'

import { config } from 'dotenv';

// Arquivo env
config();

// Servidor
const app = express();

// CORS para conexão com front-end
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
);

// Sessão
app.use(
	session({
		secret: process.env.SESSION_SECRET as string,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
		},
	})
);

// Aceitar envio de JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estatizar pasta public
// const frontendPath = path.resolve(path.join(__dirname, "../../../frontend"));
// app.use("/public", express.stati(c(frontendPath));

// app.get("/", (_req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
// });

app.get('/health', (req, res) => {
	return 'Health check';
});

// Inicializa o servidor
app.listen(3000, () => {
    console.log('Server running!')
})