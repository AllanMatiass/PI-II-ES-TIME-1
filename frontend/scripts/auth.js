const mostrarEsconderSenhaBtn = document.querySelector("#mostrarEsconderSenha");

mostrarEsconderSenhaBtn.addEventListener("click", () => {
    const inputSenha = document.querySelector("#senhaTxt");
    const icone = document.querySelector("#iconeSenha");

    if (inputSenha.type == "password") {
        inputSenha.type = "text";
        icone.src = "../icons/olho-cortado.png";
    } else {
        inputSenha.type = "password";
        icone.src = "../icons/olho.png";
    }
});