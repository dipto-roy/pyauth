/**
 * Hook to monitor token expiration and show warning
 */

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getTimeUntilExpiration } from "@/utils/jwt";
import Cookies from "js-cookie";

export function useTokenExpiration() {
  const { logout } = useAuthStore();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkExpiration = () => {
      const token = Cookies.get("access_token");
      
      if (!token) {
        setTimeRemaining(0);
        setShowWarning(false);
        return;
      }

      const remaining = getTimeUntilExpiration(token);
      setTimeRemaining(remaining);

      // Show warning when 1 minute remaining
      if (remaining > 0 && remaining <= 60) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }

      // Auto logout when expired
      if (remaining <= 0) {
        logout();
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 10 seconds
    const interval = setInterval(checkExpiration, 10000);

    return () => clearInterval(interval);
  }, [logout]);

  return {
    timeRemaining,
    showWarning,
    minutesRemaining: Math.floor(timeRemaining / 60),
    secondsRemaining: Math.floor(timeRemaining % 60),
  };
}
