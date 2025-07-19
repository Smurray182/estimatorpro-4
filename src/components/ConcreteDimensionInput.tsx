import React from "react";
import {
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";

interface ConcreteDimensionInputProps {
  label: string;
  value1: string | number;
  onChange1: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value2: string | number;
  onChange2: (event: React.ChangeEvent<HTMLInputElement>) => void;
  unit1: string;
  unit2: string;
}

export const ConcreteDimensionInput: React.FC<ConcreteDimensionInputProps> = ({
  label,
  value1,
  onChange1,
  value2,
  onChange2,
  unit1,
  unit2,
}) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <HStack spacing={4}>
        <InputGroup>
          <Input
            type="number"
            step="0.1"
            value={value1}
            onChange={onChange1}
            placeholder="0"
            textAlign="center"
          />
          <InputRightAddon>{unit1}</InputRightAddon>
        </InputGroup>
        <InputGroup>
          <Input
            type="number"
            step="0.1"
            value={value2}
            onChange={onChange2}
            placeholder="0"
            textAlign="center"
          />
          <InputRightAddon>{unit2}</InputRightAddon>
        </InputGroup>
      </HStack>
    </FormControl>
  );
};
