/**
 * Custom hook for user login form logic
 *
 * Similar to useLoginForm but for regular users (not admins).
 * Redirects to home page instead of admin dashboard.
 *
 * Responsibilities:
 * - Manage form state (email, password, error)
 * - Validate form inputs
 * - Handle form submission
 * - Navigate to home on successful login
 *
 * Returns:
 * - email: Current email input value
 * - setEmail: Function to update email
 * - password: Current password input value
 * - setPassword: Function to update password
 * - error: Error message if any
 * - isLoggingIn: Boolean indicating login in progress
 * - handleSubmit: Form submission handler
 *
 * @example
 * ```tsx
 * const { email, setEmail, password, setPassword, error, isLoggingIn, handleSubmit } = useUserLoginForm();
 * ```
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '~/hooks/useAuth';

export default function useUserLoginForm() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Submit
    login(
      email,
      password,
      (user) => {
        // Success callback - redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/notifications');
        }
      },
      (err) => {
        // Error callback
        setError(err.message || 'Erreur lors de la connexion');
      }
    );
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoggingIn,
    handleSubmit,
  };
}
