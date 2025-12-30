import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Email inválido' })
  .max(255, { message: 'Email muito longo' });

// Password validation
export const passwordSchema = z
  .string()
  .min(4, { message: 'A senha deve ter pelo menos 4 caracteres' })
  .max(100, { message: 'Senha muito longa' });

// Comment validation
export const commentSchema = z
  .string()
  .trim()
  .min(1, { message: 'Comentário não pode estar vazio' })
  .max(500, { message: 'Comentário muito longo (máximo 500 caracteres)' });

// Photo title validation
export const photoTitleSchema = z
  .string()
  .trim()
  .max(100, { message: 'Título muito longo' })
  .optional();

// Photo description validation  
export const photoDescriptionSchema = z
  .string()
  .trim()
  .max(1000, { message: 'Descrição muito longa' })
  .optional();

// Child name validation
export const childNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Nome é obrigatório' })
  .max(50, { message: 'Nome muito longo' });

// Simple hash function for client-side password obfuscation
// NOTE: This is NOT cryptographically secure - it's just to avoid storing plain text
// For real security, use a backend with proper hashing (bcrypt, argon2)
export const simpleHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + 'family-album-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Sanitize text to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
