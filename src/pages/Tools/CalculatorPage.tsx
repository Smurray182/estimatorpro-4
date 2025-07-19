import React, { useState, useEffect } from "react";
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
  GridItem,
  useToast,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Divide,
  X,
  Minus,
  Plus,
  Percent,
  Delete,
  Sun,
  Moon,
} from "lucide-react";

interface CalculatorPageProps {
  onNavigate: (page: string) => void;
}

interface CalcButtonProps {
  value: string;
  onClick: () => void;
  colorScheme?: "light-gray" | "orange" | "gray";
  icon?: React.ElementType;
  span?: number;
}

const CalcButton: React.FC<CalcButtonProps> = ({
  value,
  onClick,
  colorScheme = "gray",
  icon,
  span = 1,
}) => {
  const buttonContent = icon ? <Icon as={icon} /> : value;
  const bg =
    colorScheme === "orange"
      ? "orange.400"
      : colorScheme === "light-gray"
      ? "gray.300"
      : "gray.100";
  const hoverBg =
    colorScheme === "orange"
      ? "orange.500"
      : colorScheme === "light-gray"
      ? "gray.400"
      : "gray.200";
  const color = colorScheme === "orange" ? "white" : "black";

  return (
    <GridItem colSpan={span}>
      <Button
        w="full"
        h="20"
        fontSize="3xl"
        onClick={onClick}
        bg={bg}
        color={color}
        _hover={{ bg: hoverBg }}
        transition="all 0.2s"
      >
        {buttonContent}
      </Button>
    </GridItem>
  );
};

const CalculatorPage: React.FC<CalculatorPageProps> = ({ onNavigate }) => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [errorFlash, setErrorFlash] = useState(false);

  const appendToExpression = (value: string) => {
    if (result !== null) {
      setExpression(result + value);
      setResult(null);
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const clearAll = () => {
    setExpression("");
    setResult(null);
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const triggerErrorFeedback = () => {
    setErrorFlash(true);
    setTimeout(() => setErrorFlash(false), 300);
    toast({
      title: "Invalid Expression",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  const evaluateExpression = () => {
    try {
      if (!/^[0-9+\-*/%.()\s]+$/.test(expression)) throw new Error();
      const calculated = Function(`return (${expression})`)();
      const resultStr = String(calculated);
      setResult(resultStr);
      setHistory((prev) => [
        expression + " = " + resultStr,
        ...prev.slice(0, 5),
      ]);
    } catch {
      triggerErrorFeedback();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const validKeys = "0123456789+-*/%.()";
      if (validKeys.includes(e.key)) appendToExpression(e.key);
      if (e.key === "Enter") evaluateExpression();
      if (e.key === "Backspace") backspace();
      if (e.key === "Escape") clearAll();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [expression]);

  return (
    <Container maxW="sm" py={8}>
      <VStack spacing={4}>
        <Flex w="100%" justify="space-between" align="center">
          <Button
            onClick={() => onNavigate("tools")}
            variant="ghost"
            colorScheme="gray"
            leftIcon={<ArrowLeft size={20} />}
          >
            Tools
          </Button>
          <Heading as="h1" size="lg">
            Advanced Calculator
          </Heading>
          <IconButton
            aria-label="Toggle Theme"
            icon={colorMode === "light" ? <Moon /> : <Sun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>

        <Box
          w="full"
          bg={errorFlash ? "red.600" : "gray.800"}
          color="white"
          p={4}
          borderRadius="xl"
          textAlign="right"
          minH="120px"
          transition="background 0.3s"
        >
          <Text fontSize="2xl" color="gray.400">
            {expression || "0"}
          </Text>
          <Text fontSize="5xl" fontFamily="mono">
            {result ?? ""}
          </Text>
        </Box>

        <SimpleGrid columns={4} spacing={2} w="full">
          <CalcButton value="AC" onClick={clearAll} colorScheme="light-gray" />
          <CalcButton
            value="←"
            onClick={backspace}
            colorScheme="light-gray"
            icon={Delete}
          />
          <CalcButton
            value="%"
            onClick={() => appendToExpression("%")}
            colorScheme="light-gray"
            icon={Percent}
          />
          <CalcButton
            value="÷"
            onClick={() => appendToExpression("/")}
            colorScheme="orange"
            icon={Divide}
          />

          <CalcButton value="7" onClick={() => appendToExpression("7")} />
          <CalcButton value="8" onClick={() => appendToExpression("8")} />
          <CalcButton value="9" onClick={() => appendToExpression("9")} />
          <CalcButton
            value="×"
            onClick={() => appendToExpression("*")}
            colorScheme="orange"
            icon={X}
          />

          <CalcButton value="4" onClick={() => appendToExpression("4")} />
          <CalcButton value="5" onClick={() => appendToExpression("5")} />
          <CalcButton value="6" onClick={() => appendToExpression("6")} />
          <CalcButton
            value="-"
            onClick={() => appendToExpression("-")}
            colorScheme="orange"
            icon={Minus}
          />

          <CalcButton value="1" onClick={() => appendToExpression("1")} />
          <CalcButton value="2" onClick={() => appendToExpression("2")} />
          <CalcButton value="3" onClick={() => appendToExpression("3")} />
          <CalcButton
            value="+"
            onClick={() => appendToExpression("+")}
            colorScheme="orange"
            icon={Plus}
          />

          <CalcButton value="(" onClick={() => appendToExpression("(")} />
          <CalcButton value="0" onClick={() => appendToExpression("0")} />
          <CalcButton value=")" onClick={() => appendToExpression(")")} />
          <CalcButton
            value="="
            onClick={evaluateExpression}
            colorScheme="orange"
          />
        </SimpleGrid>

        {history.length > 0 && (
          <Box w="full" pt={4}>
            <Heading size="md" mb={2}>
              History
            </Heading>
            <Box maxH="150px" overflowY="auto">
              <VStack align="start" spacing={2}>
                {history.map((entry, i) => (
                  <Text key={i} fontFamily="mono" fontSize="md">
                    {entry}
                  </Text>
                ))}
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default CalculatorPage;
