import express from 'express'
import session from 'express-session'
import cors from 'cors'

// Servidor
const app = express();

// CORS para conexão com front-end
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// Sessão
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
}));

// Modelo de retorno: { status, data }

// Aceitar envio de JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa o servidor
app.listen(3000, () => {
    console.log('Server running!')
})