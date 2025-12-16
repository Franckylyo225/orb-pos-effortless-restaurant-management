import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const emailSchema = z
  .string()
  .email("Adresse email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères");

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Password strength calculation
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metCriteria = Object.values(criteria).filter(Boolean).length;

  let score: number;
  let label: string;
  let color: string;

  if (metCriteria <= 1) {
    score = 0;
    label = "Très faible";
    color = "bg-destructive";
  } else if (metCriteria === 2) {
    score = 1;
    label = "Faible";
    color = "bg-orange-500";
  } else if (metCriteria === 3) {
    score = 2;
    label = "Moyen";
    color = "bg-yellow-500";
  } else if (metCriteria === 4) {
    score = 3;
    label = "Fort";
    color = "bg-green-500";
  } else {
    score = 4;
    label = "Très fort";
    color = "bg-green-600";
  }

  return { score, label, color, criteria };
}

// Auth error handling
export function getAuthErrorMessage(error: any): string {
  const message = error?.message?.toLowerCase() || "";
  const code = error?.code || "";

  // Compromised password (leaked password protection)
  if (message.includes("weak_password") || message.includes("compromised") || message.includes("leaked")) {
    return "Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre plus sécurisé.";
  }

  // Already registered
  if (message.includes("already registered") || message.includes("user already registered")) {
    return "Cet email est déjà utilisé. Veuillez vous connecter.";
  }

  // Invalid credentials
  if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect.";
  }

  // Email not confirmed
  if (message.includes("email not confirmed")) {
    return "Veuillez confirmer votre email avant de vous connecter.";
  }

  // Too many requests
  if (message.includes("too many requests") || code === "over_request_rate_limit") {
    return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
  }

  // Password requirements
  if (message.includes("password") && (message.includes("short") || message.includes("weak"))) {
    return "Le mot de passe ne respecte pas les critères de sécurité requis.";
  }

  // Invalid email format
  if (message.includes("invalid email")) {
    return "Format d'email invalide.";
  }

  // Generic error
  return "Une erreur est survenue. Veuillez réessayer.";
}
