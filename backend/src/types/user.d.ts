declare module 'UserTypes' {
    interface UserLoginDTO {
    email: string;
    password: string;
    }

    interface UserCadDTO {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    }
}