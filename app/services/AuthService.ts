/**
 * Authentication Service
 *
 * Handles all authentication operations using Supabase Auth.
 *
 * Responsibilities:
 * - User login/logout
 * - Session management
 * - Role verification (user/admin)
 * - User creation
 *
 * All methods throw AuthError on failure.
 */

import { supabase } from "~/config/supabase";
import { AuthError } from "~/errors/AuthError";

export interface UserProfile {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export class AuthService {
  /**
   * Login with email and password
   *
   * @param email - User email
   * @param password - User password
   * @returns User profile with role information
   * @throws {AuthError} If login fails or user not found
   */
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user) {
        if (authError?.message.includes("Invalid")) {
          throw AuthError.invalidCredentials();
        }
        throw AuthError.loginFailed(authError);
      }

      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        console.log(JSON.stringify({ profileError, profile }, null, 2));
        throw AuthError.userNotFound();
      }

      return profile as UserProfile;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.loginFailed(error);
    }
  }

  /**
   * Logout current user
   *
   * @throws {AuthError} If logout fails
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw AuthError.logoutFailed(error);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.logoutFailed(error);
    }
  }

  /**
   * Get current authenticated user session
   *
   * @returns User profile or null if not authenticated
   */
  static async getCurrentSession(): Promise<UserProfile | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        return null;
      }

      return profile as UserProfile;
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  /**
   * Check if current user is an admin
   *
   * @returns true if user is admin, false otherwise
   */
  static async checkAdminRole(): Promise<boolean> {
    try {
      const profile = await this.getCurrentSession();
      return profile?.role === "admin";
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new user (signup)
   *
   * @param email - User email
   * @param password - User password
   * @returns User profile
   * @throws {AuthError} If signup fails
   */
  static async signup(email: string, password: string): Promise<UserProfile> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        if (authError?.message.includes("already")) {
          throw AuthError.emailAlreadyExists();
        }
        throw AuthError.signupFailed(authError);
      }

      // User record is automatically created by database trigger
      // Fetch it to return
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        console.log(JSON.stringify({ profileError, profile }, null, 2));
        throw AuthError.userNotFound();
      }

      return profile as UserProfile;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw AuthError.signupFailed(error);
    }
  }

  /**
   * Get or create user for anonymous visitors
   *
   * Creates an anonymous session and user record for push subscriptions
   *
   * @returns User profile
   */
  static async getOrCreateAnonymousUser(): Promise<UserProfile> {
    try {
      // Check if user is already logged in
      const existingProfile = await this.getCurrentSession();
      if (existingProfile) {
        return existingProfile;
      }

      // For anonymous users, we'll create a session with a generated email
      // In production, you may want to use Supabase's anonymous sign-in feature
      const anonymousEmail = `user-${crypto.randomUUID()}@anonymous.local`;
      const anonymousPassword = crypto.randomUUID();

      return await this.signup(anonymousEmail, anonymousPassword);
    } catch (error) {
      console.error("Error creating anonymous user:", error);
      throw AuthError.signupFailed(error);
    }
  }
}
