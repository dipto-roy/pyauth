"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, LoginFormData } from "@/utils/validation";
import { AxiosError } from "axios";
import { ApiError, ValidationErrorResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation with Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof LoginFormData;
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        
        if (status === 401) {
          const errorData = error.response?.data as ApiError;
          toast({
            title: "Login failed",
            description: errorData.detail || "Incorrect email or password",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (status === 422) {
          const errorData = error.response?.data as ValidationErrorResponse;
          toast({
            title: "Validation error",
            description: errorData.detail?.[0]?.msg || "Invalid input",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" mb={2}>Welcome Back</Heading>
              <Text color="gray.600">Sign in to your account</Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" color="gray.600">
              Don&apos;t have an account?{" "}
              <Link href="/register">
                <Text as="span" color="blue.500" fontWeight="semibold">
                  Sign up
                </Text>
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
