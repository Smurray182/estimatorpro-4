import React from "react";
import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Icon,
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import { ArrowLeft, Calculator, Ruler } from "lucide-react";

interface ActionButtonProps {
  name: string;
  icon: React.ElementType;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ name, icon, onClick }) => {
  return (
    <Box
      as="button"
      onClick={onClick}
      bg="gray.100"
      p={6}
      borderRadius="xl"
      boxShadow="md"
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        bg: "gray.200",
        boxShadow: "lg",
        transform: "scale(1.05)",
      }}
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={10} color="gray.600" />
        <Heading size="md" fontWeight="semibold" color="gray.700">
          {name}
        </Heading>
      </VStack>
    </Box>
  );
};

interface ToolsPageProps {
  onNavigate: (page: string) => void;
}

const ToolsPage: React.FC<ToolsPageProps> = ({ onNavigate }) => {
  return (
    <Container maxW="container.lg" py={12}>
      <VStack spacing={10}>
        <Flex w="100%" justify="space-between" align="center">
          <Button
            onClick={() => onNavigate("home")}
            variant="ghost"
            colorScheme="gray"
            leftIcon={<ArrowLeft size={20} />}
          >
            Home
          </Button>
          <Heading as="h1" size="xl" color="gray.800">
            Tools
          </Heading>
          <Box w="80px" /> {/* Spacer */}
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} w="100%">
          <ActionButton
            name="Calculator"
            icon={Calculator}
            onClick={() => onNavigate("calculator")}
          />
          {/* FIX: Add the new Feet & Inches Calculator button */}
          <ActionButton
            name="Feet & Inches"
            icon={Ruler}
            onClick={() => onNavigate("feet-inches-calculator")}
          />
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default ToolsPage;
