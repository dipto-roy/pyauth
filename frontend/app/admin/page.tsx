"use client";

import { useEffect, useState } from "react";
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TokenExpirationAlert } from "@/components/TokenExpirationAlert";
import { apiClient } from "@/lib/axios";
import { AxiosError } from "axios";

function AdminContent() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await apiClient.get("/protected/admin");
        setAdminData(response.data);
        setError(null);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 403) {
            setError("Access Denied: You don't have admin privileges");
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setTimeout(() => router.push("/dashboard"), 2000);
          } else {
            setError("Failed to load admin data");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router, toast]);

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

  if (loading) {
    return (
      <Container maxW="4xl" py={10}>
        <Text>Loading admin panel...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={10}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <TokenExpirationAlert />
      <Container maxW="4xl" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="xl">Admin Panel</Heading>
              <HStack>
                <Button onClick={() => router.push("/dashboard")}>
                  Back to Dashboard
                </Button>
                <Button colorScheme="red" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </HStack>
            </HStack>
            <Text color="gray.600">Administrator control panel</Text>
          </Box>

          {/* Admin Status Alert */}
          <Alert status="success">
            <AlertIcon />
            <Box>
              <AlertTitle>Admin Access Granted</AlertTitle>
              <AlertDescription>
                {adminData?.message || "You have successfully accessed the admin panel"}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Admin Info Card */}
          <Card>
            <CardHeader>
              <Heading size="md">Admin Information</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Text fontWeight="bold" width="120px">Admin ID:</Text>
                  <Text>{adminData?.user_id || user?.id}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Email:</Text>
                  <Text>{adminData?.user_email || user?.email}</Text>
                </HStack>
                <HStack>
                  <Text fontWeight="bold" width="120px">Role:</Text>
                  <Badge colorScheme="purple">
                    {adminData?.user_role?.toUpperCase() || user?.role?.toUpperCase()}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Admin Features Card */}
          <Card>
            <CardHeader>
              <Heading size="md">Admin Features</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Button
                  colorScheme="purple"
                  onClick={() => toast({
                    title: "Feature",
                    description: "User management feature (demo)",
                    status: "info",
                    duration: 3000,
                  })}
                >
                  Manage Users
                </Button>
                
                <Button
                  colorScheme="orange"
                  onClick={() => toast({
                    title: "Feature",
                    description: "System settings feature (demo)",
                    status: "info",
                    duration: 3000,
                  })}
                >
                  System Settings
                </Button>

                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={() => toast({
                    title: "Feature",
                    description: "View logs feature (demo)",
                    status: "info",
                    duration: 3000,
                  })}
                >
                  View System Logs
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Info Card */}
          <Card bg="purple.50">
            <CardBody>
              <VStack align="start" spacing={2}>
                <Heading size="sm" color="purple.800">👑 Admin Privileges</Heading>
                <Text fontSize="sm" color="purple.700">
                  • Full access to protected admin endpoints
                </Text>
                <Text fontSize="sm" color="purple.700">
                  • Can manage users and system settings
                </Text>
                <Text fontSize="sm" color="purple.700">
                  • Backed by role-based authorization (JWT)
                </Text>
                <Text fontSize="sm" color="purple.700">
                  • 403 Forbidden returned for non-admin users
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
}
