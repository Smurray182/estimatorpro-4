import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  IconButton,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { Plus, Minus } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

// Parser functions to read saved data from the description string
const parseQuantity = (desc: string | undefined, label: string): number => {
  if (!desc) return 0;
  const regex = new RegExp(`- ${label} \\(x(\\d+)\\)`);
  const match = desc.match(regex);
  return match ? parseInt(match[1], 10) : 0;
};

const parseToggle = (desc: string | undefined, label: string): boolean => {
  if (!desc) return false;
  return desc.includes(`- ${label}`);
};

const HVACSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "hvac"
      ),
    [estimateData, remodelType]
  );

  // State for all HVAC options
  const [hasMiniSplit, setHasMiniSplit] = useState(() =>
    parseToggle(existingItem?.description, "Mini-Split")
  );
  const [registerQuantity, setRegisterQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "HVAC Registers (New)")
  );
  const [ventQuantity, setVentQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "Vent Replacements")
  );

  useEffect(() => {
    const miniSplitCost = hasMiniSplit ? 6000 : 0;
    const registerCost = registerQuantity * 600;
    const ventCost = ventQuantity * 30;

    const totalCost = miniSplitCost + registerCost + ventCost;

    const buildDescription = () => {
      const parts = [];
      if (hasMiniSplit) parts.push("- Mini-Split");
      if (registerQuantity > 0)
        parts.push(`- HVAC Registers (New) (x${registerQuantity})`);
      if (ventQuantity > 0)
        parts.push(`- Vent Replacements (x${ventQuantity})`);
      if (parts.length === 0) return "HVAC scope of work.";
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "hvac",
        title: "HVAC",
        category: "REMODEL",
        costCode: "R - HVAC",
        unitCost: totalCost,
        quantity: 1,
        markup: 70,
        margin: 41.18,
        description,
      };
      if (
        newItem.description !== existingItem?.description ||
        newItem.unitCost !== existingItem?.unitCost
      ) {
        setEstimateData((prev) => {
          const currentItems = (
            Array.isArray(prev[remodelType]) ? prev[remodelType] : []
          ) as EstimateItem[];
          const otherItems = currentItems.filter((item) => item.id !== "hvac");
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "hvac"
          ),
        }));
      }
    }
  }, [
    hasMiniSplit,
    registerQuantity,
    ventQuantity,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const handleQuantityChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    amount: number
  ) => {
    setter((prev) => Math.max(0, prev + amount));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        HVAC
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          <Button
            colorScheme={hasMiniSplit ? "blue" : "gray"}
            onClick={() => setHasMiniSplit((p) => !p)}
            size="lg"
          >
            Mini-Split ($6000)
          </Button>

          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              HVAC Registers (New)
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setRegisterQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {registerQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setRegisterQuantity, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Vent Replacements
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setVentQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {ventQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setVentQuantity, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
};

export default HVACSection;
