// Endereço base da API usada no frontend
export const API_URL = "http://localhost:3000";

// Função que busca os dados do usuário logado
export async function getUser() {
    // Pega o ID do usuário que foi salvo na sessão do navegador
    const id = sessionStorage.getItem('userId');
    
    
}