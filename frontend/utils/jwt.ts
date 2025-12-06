/**
 * JWT token utilities
 */

import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/types";

/**
 * Decode JWT token
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiration(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded) return 0;
  
  const currentTime = Date.now() / 1000;
  return Math.max(0, decoded.exp - currentTime);
}

/**
 * Get user role from token
 */
export function getRoleFromToken(token: string): "user" | "admin" | null {
  const decoded = decodeToken(token);
  return decoded?.role || null;
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
  const decoded = decodeToken(token);
  return decoded?.sub || null;
}
