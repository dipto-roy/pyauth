/**
 * Token expiration warning alert
 */

"use client";

import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box } from "@chakra-ui/react";
import { useTokenExpiration } from "@/hooks/useTokenExpiration";
import { useState } from "react";

export function TokenExpirationAlert() {
  const { showWarning, minutesRemaining, secondsRemaining } = useTokenExpiration();
  const [dismissed, setDismissed] = useState(false);

  if (!showWarning || dismissed) {
    return null;
  }

  return (
    <Alert status="warning" position="fixed" top={0} left={0} right={0} zIndex={9999}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Session Expiring Soon!</AlertTitle>
        <AlertDescription>
          Your session will expire in {minutesRemaining}:{secondsRemaining.toString().padStart(2, "0")}. 
          Please save your work.
        </AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={() => setDismissed(true)}
      />
    </Alert>
  );
}
