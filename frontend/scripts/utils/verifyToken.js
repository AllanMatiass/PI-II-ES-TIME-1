export function isValidToken(res){
    if (res.status === 401){
			localStorage.removeItem('token');
			localStorage.removeItem('userId');
			return false;
	}

    return true;
}