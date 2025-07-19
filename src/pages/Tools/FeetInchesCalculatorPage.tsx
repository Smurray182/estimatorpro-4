import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Button,
  Text,
  Flex,
  Icon,
  Container,
  HStack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Minus, X, Divide } from "lucide-react";

// Interfaces
interface FeetInches {
  feet: string;
  inches: string;
}

interface FeetInchesCalculatorPageProps {
  onNavigate: (page: string) => void;
}

// Helper function to format inches to the nearest 1/4 inch fraction
const formatInchesToFraction = (totalInches: number): string => {
  if (totalInches === 0) return "0";
  const roundedQuarters = Math.round(totalInches * 4);
  const wholeInches = Math.floor(roundedQuarters / 4);
  const quarters = roundedQuarters % 4;

  if (quarters === 0) {
    return `${wholeInches}`;
  }
  if (quarters === 2) {
    return `${wholeInches} 1/2`;
  }
  return `${wholeInches} ${quarters}/4`;
};

// A dedicated Numpad for a single unit (feet or inches)
const UnitNumpad: React.FC<{
  title: string;
  value: string;
  onInput: (digit: string) => void;
  onBackspace: () => void;
  colorScheme: "blue" | "green";
}> = ({ title, value, onInput, onBackspace, colorScheme }) => {
  const keys = [
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "1",
    "2",
    "3",
    ".",
    "0",
    "backspace",
  ];

  return (
    <VStack spacing={3}>
      <Heading size="md" color={`${colorScheme}.600`}>
        {title}
      </Heading>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        fontFamily="mono"
        bg="white"
        p={2}
        borderRadius="md"
        w="150px"
        textAlign="center"
      >
        {value}
      </Text>
      <SimpleGrid columns={3} spacing={1} w="150px">
        {keys.map((key) => (
          <Button
            key={key}
            onClick={() => (key === "backspace" ? onBackspace() : onInput(key))}
            colorScheme={
              key === "." || key === "backspace" ? "gray" : colorScheme
            }
            h={12}
          >
            {key === "backspace" ? "⌫" : key}
          </Button>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

const FeetInchesCalculatorPage: React.FC<FeetInchesCalculatorPageProps> = ({
  onNavigate,
}) => {
  const [currentFeet, setCurrentFeet] = useState("0");
  const [currentInches, setCurrentInches] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [multiplier, setMultiplier] = useState("0");
  const [multiplierOperator, setMultiplierOperator] = useState<string | null>(
    null
  );

  const toInches = (feet: string, inches: string): number => {
    return (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
  };

  const fromInches = (totalInches: number): FeetInches => {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet: String(feet), inches: String(Math.round(inches)) };
  };

  const handleFeetInput = (digit: string) => {
    if (digit === "." && currentFeet.includes(".")) return;
    setCurrentFeet(currentFeet === "0" ? digit : currentFeet + digit);
  };

  const handleInchesInput = (digit: string) => {
    if (digit === "." && currentInches.includes(".")) return;
    setCurrentInches(currentInches === "0" ? digit : currentInches + digit);
  };

  const handleFeetBackspace = () => {
    let newFeet = currentFeet.slice(0, -1);
    if (newFeet === "") newFeet = "0";
    setCurrentFeet(newFeet);
  };

  const handleInchesBackspace = () => {
    let newInches = currentInches.slice(0, -1);
    if (newInches === "") newInches = "0";
    setCurrentInches(newInches);
  };

  const handleOperationClick = (op: string) => {
    if (op === "*" || op === "/") {
      setMultiplierOperator(op);
      onOpen();
      return;
    }
    setStoredValue(toInches(currentFeet, currentInches));
    setOperator(op);
    setResult(toInches(currentFeet, currentInches));
    setCurrentFeet("0");
    setCurrentInches("0");
  };

  const handleEqualsClick = () => {
    if (storedValue === null || operator === null) return;
    const currentValueInches = toInches(currentFeet, currentInches);
    let resultInches = 0;

    switch (operator) {
      case "+":
        resultInches = storedValue + currentValueInches;
        break;
      case "-":
        resultInches = storedValue - currentValueInches;
        break;
      default:
        return;
    }
    setResult(resultInches);
    setStoredValue(null);
    setOperator(null);
    const finalResult = fromInches(resultInches);
    setCurrentFeet(finalResult.feet);
    setCurrentInches(finalResult.inches);
  };

  const handleMultiplierConfirm = () => {
    const currentValueInches = toInches(currentFeet, currentInches);
    const multiplierValue = parseFloat(multiplier) || 0;
    let resultInches = 0;

    if (multiplierOperator === "*") {
      resultInches = currentValueInches * multiplierValue;
    } else if (multiplierOperator === "/") {
      if (multiplierValue === 0) {
        alert("Cannot divide by zero.");
        return;
      }
      resultInches = currentValueInches / multiplierValue;
    }
    setResult(resultInches);
    const finalResult = fromInches(resultInches);
    setCurrentFeet(finalResult.feet);
    setCurrentInches(finalResult.inches);
    setMultiplier("0");
    onClose();
  };

  const handleMultiplierInput = (digit: string) => {
    if (digit === "." && multiplier.includes(".")) return;
    setMultiplier(multiplier === "0" ? digit : multiplier + digit);
  };

  const handleMultiplierBackspace = () => {
    let newMultiplier = multiplier.slice(0, -1);
    if (newMultiplier === "") newMultiplier = "0";
    setMultiplier(newMultiplier);
  };

  const clearAll = () => {
    setCurrentFeet("0");
    setCurrentInches("0");
    setStoredValue(null);
    setOperator(null);
    setResult(null);
  };

  const displayResult = result !== null ? fromInches(result) : null;
  const multiplierKeys = [
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "1",
    "2",
    "3",
    ".",
    "0",
    "backspace",
  ];

  return (
    <>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Flex w="100%" justify="space-between" align="center">
            <Button
              onClick={() => onNavigate("tools")}
              variant="ghost"
              colorScheme="gray"
              leftIcon={<ArrowLeft size={20} />}
            >
              Tools
            </Button>
            <Heading as="h1" size="lg" textAlign="center">
              Feet & Inches Calculator
            </Heading>
            <Box w="80px" />
          </Flex>

          <VStack spacing={4} p={6} bg="gray.100" borderRadius="xl">
            <HStack spacing={4} align="start">
              <UnitNumpad
                title="Feet"
                value={currentFeet}
                onInput={handleFeetInput}
                onBackspace={handleFeetBackspace}
                colorScheme="blue"
              />
              <UnitNumpad
                title="Inches"
                value={currentInches}
                onInput={handleInchesInput}
                onBackspace={handleInchesBackspace}
                colorScheme="green"
              />
            </HStack>

            <SimpleGrid columns={5} spacing={2} w="full" pt={4}>
              <Button
                h={16}
                colorScheme="gray"
                onClick={() => handleOperationClick("+")}
              >
                <Icon as={Plus} />
              </Button>
              <Button
                h={16}
                colorScheme="gray"
                onClick={() => handleOperationClick("-")}
              >
                <Icon as={Minus} />
              </Button>
              <Button
                h={16}
                colorScheme="gray"
                onClick={() => handleOperationClick("*")}
              >
                <Icon as={X} />
              </Button>
              <Button
                h={16}
                colorScheme="gray"
                onClick={() => handleOperationClick("/")}
              >
                <Icon as={Divide} />
              </Button>
              <Button h={16} colorScheme="blue" onClick={handleEqualsClick}>
                =
              </Button>
            </SimpleGrid>
          </VStack>

          <VStack
            spacing={1}
            p={6}
            bg="gray.700"
            color="white"
            borderRadius="xl"
          >
            <HStack justify="space-between" w="full">
              <Heading size="md">Result</Heading>
              <Button
                size="xs"
                variant="outline"
                colorScheme="whiteAlpha"
                onClick={clearAll}
              >
                Clear
              </Button>
            </HStack>
            <Divider />
            <VStack spacing={1} align="stretch" w="full" pt={2}>
              <HStack
                spacing={3}
                align="baseline"
                justify="center"
                position="relative"
                w="full"
              >
                {displayResult ? (
                  <>
                    <Text fontSize="5xl" fontWeight="bold">
                      {displayResult.feet}
                    </Text>
                    <Text fontSize="2xl" pb={2}>
                      ft
                    </Text>
                    <Text fontSize="5xl" fontWeight="bold">
                      {displayResult.inches}
                    </Text>
                    <Text fontSize="2xl" pb={2}>
                      in
                    </Text>
                  </>
                ) : (
                  <Text fontSize="5xl" fontWeight="bold" color="gray.400">
                    0
                  </Text>
                )}
                {operator && storedValue !== null && (
                  <Text
                    fontSize="2xl"
                    color="gray.400"
                    position="absolute"
                    right="0"
                  >
                    {operator}
                  </Text>
                )}
              </HStack>
              {displayResult && result !== null && (
                <HStack w="full" justify="space-between" px={2} mt={-2}>
                  <Text fontSize="sm" color="gray.400">
                    ({(result / 12).toFixed(2)} ft)
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    ({formatInchesToFraction(result)} in)
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Multiplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Text
                fontSize="4xl"
                fontWeight="bold"
                fontFamily="mono"
                bg="gray.100"
                p={3}
                borderRadius="md"
                w="100%"
                textAlign="center"
              >
                {multiplier}
              </Text>
              <SimpleGrid columns={3} spacing={2} w="full">
                {multiplierKeys.map((key) => (
                  <Button
                    key={key}
                    onClick={() =>
                      key === "backspace"
                        ? handleMultiplierBackspace()
                        : handleMultiplierInput(key)
                    }
                    h={16}
                    fontSize="2xl"
                  >
                    {key === "backspace" ? "⌫" : key}
                  </Button>
                ))}
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleMultiplierConfirm}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FeetInchesCalculatorPage;
