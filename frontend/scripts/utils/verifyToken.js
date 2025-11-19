// Autor: Allan Matias

export function isValidToken(res) {
	// Se a resposta da API retornar status 401,
	// significa que o token não é mais válido.
	if (res.status === 401) {
		// Remove o token salvo no navegador
		localStorage.removeItem('token');
		// Remove também o ID do usuário salvo
		localStorage.removeItem('userId');
		return false;
	}

	return true;
}