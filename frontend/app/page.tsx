"use client";

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
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { LockIcon, CheckCircleIcon, StarIcon } from "@chakra-ui/icons";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero Section */}
      <Box bg="blue.600" color="white" py={20}>
        <Container maxW="4xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl">PyAuth Frontend</Heading>
            <Text fontSize="xl" maxW="2xl">
              Modern authentication system with JWT tokens, role-based authorization,
              and seamless integration with FastAPI backend
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="white"
                variant="solid"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={() => router.push("/register")}
              >
                Sign Up
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="6xl" py={16}>
        <VStack spacing={12}>
          <Box textAlign="center">
            <Heading size="xl" mb={4}>Features</Heading>
            <Text color="gray.600" fontSize="lg">
              Everything you need for secure authentication
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={LockIcon} boxSize={10} color="blue.500" />
                  <Heading size="md">JWT Authentication</Heading>
                  <Text color="gray.600">
                    Secure token-based authentication with 15-minute expiration
                    and automatic session management
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={CheckCircleIcon} boxSize={10} color="green.500" />
                  <Heading size="md">Role-Based Access</Heading>
                  <Text color="gray.600">
                    User and admin roles with protected routes and granular
                    permission controls
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4} align="start">
                  <Icon as={StarIcon} boxSize={10} color="purple.500" />
                  <Heading size="md">Modern Stack</Heading>
                  <Text color="gray.600">
                    Built with Next.js 14, TypeScript, Chakra UI, Zustand,
                    and Zod validation
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tech Stack */}
          <Card w="full" bg="blue.50">
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" color="blue.800">Tech Stack</Heading>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                  <Box textAlign="center">
                    <Text fontWeight="bold">Frontend</Text>
                    <Text fontSize="sm" color="gray.600">Next.js 14</Text>
                    <Text fontSize="sm" color="gray.600">TypeScript</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold">UI</Text>
                    <Text fontSize="sm" color="gray.600">Chakra UI</Text>
                    <Text fontSize="sm" color="gray.600">Tailwind CSS</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold">State</Text>
                    <Text fontSize="sm" color="gray.600">Zustand</Text>
                    <Text fontSize="sm" color="gray.600">Cookies</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontWeight="bold">Backend</Text>
                    <Text fontSize="sm" color="gray.600">FastAPI</Text>
                    <Text fontSize="sm" color="gray.600">PostgreSQL</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* CTA */}
          <Box textAlign="center" pt={8}>
            <Heading size="lg" mb={4}>Ready to get started?</Heading>
            <Text color="gray.600" mb={6}>
              Create your account in seconds
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => router.push("/register")}
            >
              Create Account
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
