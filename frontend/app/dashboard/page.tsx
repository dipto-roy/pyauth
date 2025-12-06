"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TokenExpirationAlert } from "@/components/TokenExpirationAlert";

function DashboardContent() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    router.push("/login");
  };

  const handleAdminPanel = () => {
    if (user?.role === "admin") {
      router.push("/admin");
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <TokenExpirationAlert />
      <Container maxW="4xl" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="xl">Dashboard</Heading>
              <Button colorScheme="red" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </HStack>
            <Text color="gray.600">Welcome to your PyAuth dashboard</Text>
          </Box>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <Heading size="md">Your Profile</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Text fontWeight="bold" width="120px">User ID:</Text>
                  <Text>{user?.id}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Email:</Text>
                  <Text>{user?.email}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Full Name:</Text>
                  <Text>{user?.full_name || "Not provided"}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Role:</Text>
                  <Badge colorScheme={user?.role === "admin" ? "purple" : "green"}>
                    {user?.role?.toUpperCase()}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Status:</Text>
                  <Badge colorScheme={user?.is_active ? "green" : "red"}>
                    {user?.is_active ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Member Since:</Text>
                  <Text>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "Unknown"}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Button
                  colorScheme="blue"
                  onClick={() => toast({
                    title: "Feature",
                    description: "This is a protected user endpoint",
                    status: "info",
                    duration: 3000,
                  })}
                >
                  User Action (All Users)
                </Button>
                
                <Button
                  colorScheme="purple"
                  onClick={handleAdminPanel}
                  isDisabled={user?.role !== "admin"}
                >
                  Admin Panel {user?.role !== "admin" && "(Admin Only)"}
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Info Card */}
          <Card bg="blue.50">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Heading size="sm" color="blue.800">🔐 Authentication Info</Heading>
                <Text fontSize="sm" color="blue.700">
                  • You are authenticated with JWT token
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Token expires in 15 minutes
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • You&apos;ll see a warning when 1 minute remains
                </Text>
                <Text fontSize="sm" color="blue.700">
                  • Your role is: <strong>{user?.role}</strong>
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
