import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Flex,
  HStack,
  IconButton,
  Icon,
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

const parseQuantity = (desc: string | undefined, label: string): number => {
  if (!desc) return 0;
  const regex = new RegExp(`- ${label} \\(x(\\d+)\\)`);
  const match = desc.match(regex);
  return match ? parseInt(match[1], 10) : 0;
};

const GoBoardSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "goBoard"
      ),
    [estimateData, remodelType]
  );

  const [smShowerQuantity, setSmShowerQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "Sm Shower")
  );
  const [lgShowerQuantity, setLgShowerQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "Lg Shower")
  );

  useEffect(() => {
    const smShowerCost = smShowerQuantity * 600;
    const lgShowerCost = lgShowerQuantity * 800;
    const totalCost = smShowerCost + lgShowerCost;

    const buildDescription = () => {
      const parts = ["Install and seal Goboard in all wet areas."];
      if (smShowerQuantity > 0)
        parts.push(`- Sm Shower (x${smShowerQuantity})`);
      if (lgShowerQuantity > 0)
        parts.push(`- Lg Shower (x${lgShowerQuantity})`);
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "goBoard",
        title: "GOBOARD",
        category: "REMODEL",
        costCode: "R - GoBoard",
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
          const otherItems = currentItems.filter(
            (item) => item.id !== "goBoard"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "goBoard"
          ),
        }));
      }
    }
  }, [
    smShowerQuantity,
    lgShowerQuantity,
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
        GoBoard
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="2px"
        borderColor={
          smShowerQuantity > 0 || lgShowerQuantity > 0 ? "blue.500" : "white"
        }
        transition="border-color 0.2s"
      >
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Sm Shower
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setSmShowerQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {smShowerQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setSmShowerQuantity, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Lg Shower
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setLgShowerQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {lgShowerQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setLgShowerQuantity, 1)}
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

export default GoBoardSection;
