/**
 * Cria e retorna os cabeçalhos padrão para requisições autenticadas.
 */
export function GetAuthHeaders() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = '/frontend/pages/auth/signin.html';
        throw new Error("Usuário não autenticado");
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}   