/**
 * Custom hook for user registration form logic
 *
 * Manages registration form state, validation, and submission.
 *
 * Responsibilities:
 * - Manage form state (email, password, confirmPassword)
 * - Validate form inputs (email format, password match, password strength)
 * - Handle form submission
 * - Navigate on successful registration
 *
 * Returns:
 * - email: Current email input value
 * - setEmail: Function to update email
 * - password: Current password input value
 * - setPassword: Function to update password
 * - confirmPassword: Current confirm password input value
 * - setConfirmPassword: Function to update confirm password
 * - error: Error message if any
 * - isRegistering: Boolean indicating registration in progress
 * - handleSubmit: Form submission handler
 *
 * @example
 * ```tsx
 * const { email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, error, isRegistering, handleSubmit } = useRegisterForm();
 * ```
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { AuthService } from '~/services/AuthService';

export default function useRegisterForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.signup(email, password),
    onSuccess: () => {
      navigate('/');
    },
    onError: (err: Error) => {
      setError(err.message || 'Erreur lors de la création du compte');
    },
  });

  const validateForm = (): boolean => {
    setError(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Adresse email invalide');
      return false;
    }

    // Password validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    register({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isRegistering,
    handleSubmit,
  };
}
