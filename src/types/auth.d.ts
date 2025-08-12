// src/types/auth.d.ts
// version: "1.0.0",
// quick description: basic interface for authentication forms in a Next.js application
// CAUTION: Alway leave quick description at the top of the file each time update 

export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormInputs {
  email: string;
}