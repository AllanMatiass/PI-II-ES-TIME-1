
export class AppError extends Error {
  code: number;
  // É um erro com codigo, pra facilitar o retorno de respostas.
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
