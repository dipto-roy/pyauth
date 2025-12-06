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
import { registerSchema, RegisterFormData } from "@/utils/validation";
import { AxiosError } from "axios";
import { ApiError, ValidationErrorResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register } = useAuthStore();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    full_name: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
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
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof RegisterFormData;
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Register will auto-login after successful registration
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || undefined,
      });
      
      toast({
        title: "Registration successful",
        description: "Welcome to PyAuth!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        
        if (status === 400) {
          const errorData = error.response?.data as ApiError;
          toast({
            title: "Registration failed",
            description: errorData.detail || "Email already registered",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else if (status === 422) {
          const errorData = error.response?.data as ValidationErrorResponse;
          const validationErrors: Partial<Record<keyof RegisterFormData, string>> = {};
          
          errorData.detail?.forEach((err) => {
            const field = err.loc[err.loc.length - 1] as keyof RegisterFormData;
            validationErrors[field] = err.msg;
          });
          
          setErrors(validationErrors);
          
          toast({
            title: "Validation error",
            description: "Please check your input",
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
              <Heading size="xl" mb={2}>Create Account</Heading>
              <Text color="gray.600">Sign up for PyAuth</Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email} isRequired>
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

                <FormControl isInvalid={!!errors.password} isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Must be at least 8 characters
                  </Text>
                </FormControl>

                <FormControl isInvalid={!!errors.full_name}>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <Input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  <FormErrorMessage>{errors.full_name}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Sign Up
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" color="gray.600">
              Already have an account?{" "}
              <Link href="/login">
                <Text as="span" color="blue.500" fontWeight="semibold">
                  Sign in
                </Text>
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
