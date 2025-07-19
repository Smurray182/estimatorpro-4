import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Input,
  IconButton,
  Flex,
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

const getTileSqFtFromDescription = (
  description: string | undefined
): string => {
  if (!description) return "0";
  const match = description.match(/- Tile Demo: ([\d.]+) sq ft/);
  return match ? match[1] : "0";
};

const getHalfDaysFromDescription = (
  description: string | undefined
): number => {
  if (!description) return 0;
  const match = description.match(/- Labor: ([\d.]+) Days/);
  return match ? parseFloat(match[1]) * 2 : 0;
};

const DemolitionSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "demolition"
      ),
    [estimateData, remodelType]
  );

  const [halfDays, setHalfDays] = useState(() =>
    getHalfDaysFromDescription(existingItem?.description)
  );
  const [tileSqFt, setTileSqFt] = useState(() =>
    getTileSqFtFromDescription(existingItem?.description)
  );
  const [hasDumpster, setHasDumpster] = useState(
    () => existingItem?.description?.includes("Dumpster") || false
  );
  const [hasDumpTrailer, setHasDumpTrailer] = useState(
    () => existingItem?.description?.includes("Dump Trailer") || false
  );
  const [hasMaterials, setHasMaterials] = useState(
    () => existingItem?.description?.includes("Construction Materials") || false
  );

  useEffect(() => {
    const laborCost = halfDays * 320;
    const tileCost = (parseFloat(tileSqFt) || 0) * 3.25;
    const dumpsterCost = hasDumpster ? 450 : 0;
    const dumpTrailerCost = hasDumpTrailer ? 200 : 0;
    const materialsCost = hasMaterials ? 150 : 0;

    const totalCost =
      laborCost + tileCost + dumpsterCost + dumpTrailerCost + materialsCost;

    const buildDescription = () => {
      const parts: string[] = [];
      if (halfDays > 0) parts.push(`- Labor: ${halfDays / 2} Days`);
      if (parseFloat(tileSqFt) > 0)
        parts.push(`- Tile Demo: ${tileSqFt} sq ft`);
      if (hasDumpster) parts.push("- Dumpster");
      if (hasDumpTrailer) parts.push("- Dump Trailer");
      if (hasMaterials) parts.push("- Construction Materials");
      if (parts.length === 0) return "Demolition services.";
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "demolition",
        title: "DEMOLITION",
        category: "REMODEL",
        costCode: "R - Demo",
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
            (item) => item.id !== "demolition"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "demolition"
          ),
        }));
      }
    }
  }, [
    halfDays,
    tileSqFt,
    hasDumpster,
    hasDumpTrailer,
    hasMaterials,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const handleHalfDayChange = (amount: number) => {
    setHalfDays((prev) => Math.max(0, prev + amount));
  };

  const handleTileSqFtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTileSqFt(e.target.value);
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Demolition
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Labor (Days)
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease days"
                icon={<Icon as={Minus} />}
                onClick={() => handleHalfDayChange(-1)}
                isRound
              />
              <Text
                fontSize="2xl"
                fontWeight="bold"
                w="60px"
                textAlign="center"
              >
                {halfDays / 2}
              </Text>
              <IconButton
                aria-label="Increase days"
                icon={<Icon as={Plus} />}
                onClick={() => handleHalfDayChange(1)}
                isRound
              />
            </HStack>
          </Flex>
          <HStack justify="space-around">
            <Button
              colorScheme={hasDumpster ? "blue" : "gray"}
              onClick={() => setHasDumpster((prev) => !prev)}
            >
              Dumpster
            </Button>
            <Button
              colorScheme={hasDumpTrailer ? "blue" : "gray"}
              onClick={() => setHasDumpTrailer((prev) => !prev)}
            >
              Dump Trailer
            </Button>
            <Button
              colorScheme={hasMaterials ? "blue" : "gray"}
              onClick={() => setHasMaterials((prev) => !prev)}
            >
              Materials
            </Button>
          </HStack>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Tile Demo (sq ft)
            </Text>
            <Input
              w="120px"
              type="number"
              placeholder="0"
              value={tileSqFt}
              onChange={handleTileSqFtChange}
              textAlign="right"
            />
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
};

export default DemolitionSection;
