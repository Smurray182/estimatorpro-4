import React from "react";
import {
  HStack,
  Button,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Flex,
  Box, // <-- This was the missing import
} from "@chakra-ui/react";
import { Minus, Plus } from "lucide-react";

interface CustomNumberInputProps {
  label: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  subtext?: string;
  unit?: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  label,
  value,
  onChange,
  subtext,
  unit,
}) => {
  const handleStep = (direction: "up" | "down") => {
    const currentValue = parseFloat(value as string) || 0;
    let newValue;
    if (direction === "up") {
      newValue = currentValue + 1;
    } else {
      newValue = currentValue - 1;
    }
    if (newValue < 0) newValue = 0;

    const event = {
      target: { value: String(newValue) },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <FormControl>
      <Flex justify="space-between" align="center">
        <Box>
          <FormLabel>{label}</FormLabel>
          {subtext && <FormHelperText>{subtext}</FormHelperText>}
        </Box>
        <HStack
          maxW="150px"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Button onClick={() => handleStep("down")} size="sm">
            <Minus size={16} />
          </Button>
          <Input
            type="number"
            value={value}
            onChange={onChange}
            textAlign="center"
            variant="unstyled"
            p={0}
          />
          {unit && (
            <Text pr={2} color="gray.500">
              {unit}
            </Text>
          )}
          <Button onClick={() => handleStep("up")} size="sm">
            <Plus size={16} />
          </Button>
        </HStack>
      </Flex>
    </FormControl>
  );
};
