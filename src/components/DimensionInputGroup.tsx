import React from "react";
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Box,
} from "@chakra-ui/react";

// Define the props for this component
// It receives the state values and the functions to update them from its parent
interface DimensionInputGroupProps {
  wFt: string | number;
  setWFt: (val: string) => void;
  wIn: string | number;
  setWIn: (val: string) => void;
  hFt: string | number;
  setHFt: (val: string) => void;
  hIn: string | number;
  setHIn: (val: string) => void;
}

export const DimensionInputGroup: React.FC<DimensionInputGroupProps> = ({
  wFt,
  setWFt,
  wIn,
  setWIn,
  hFt,
  setHFt,
  hIn,
  setHIn,
}) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      <FormControl>
        <FormLabel textAlign="center" mb={1} fontSize="sm">
          Width
        </FormLabel>
        <HStack>
          <Input
            type="number"
            placeholder="ft"
            value={wFt}
            onChange={(e) => setWFt(e.target.value)}
          />
          <Input
            type="number"
            placeholder="in"
            value={wIn}
            onChange={(e) => setWIn(e.target.value)}
          />
        </HStack>
      </FormControl>
      <FormControl>
        <FormLabel textAlign="center" mb={1} fontSize="sm">
          Height
        </FormLabel>
        <HStack>
          <Input
            type="number"
            placeholder="ft"
            value={hFt}
            onChange={(e) => setHFt(e.target.value)}
          />
          <Input
            type="number"
            placeholder="in"
            value={hIn}
            onChange={(e) => setHIn(e.target.value)}
          />
        </HStack>
      </FormControl>
    </SimpleGrid>
  );
};
