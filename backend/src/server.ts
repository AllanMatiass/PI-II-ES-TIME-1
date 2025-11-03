import express from 'express'
import session from 'express-session'
import cors from 'cors'
import PublicRoutes from './routes/public';
import PrivateRoutes from './routes/private';
import { isAuth } from './middlewares/auth';
import { config } from 'dotenv'

// Arquivo env
config();

// Servidor
const app = express();

// PORTAS
const BACKEND_PORT = process.env.BACKEND_PORT ?? 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT ?? 5500;

// CORS para conexão com front-end
const allowedOrigins = [
	`http://localhost:${FRONTEND_PORT}`,
	`http://127.0.0.1:${FRONTEND_PORT}`
];


app.use(cors({
	origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'] 
}));

// Inicializa o express-session
app.use(session({
	secret: process.env.SESSION_SECRET as string,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false,
		sameSite: 'none',
	},
}));

// Aceitar envio de JSON 
app.use(express.json());

// Cria as rotas da API
// CreateRoutes("./controllers");

// rotas
app.use('/api', PublicRoutes);
app.use('/api', isAuth, PrivateRoutes);

// Inicializa o servidor
app.listen(BACKEND_PORT, () => {
    console.log('Server running!')
});
