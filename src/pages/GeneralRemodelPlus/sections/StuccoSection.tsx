import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

interface StuccoArea {
  id: string;
  sqft: number;
}

const parseStuccoAreas = (desc: string | undefined): StuccoArea[] => {
  if (!desc) return [];
  const areas: StuccoArea[] = [];
  const regex = /-\s*Stucco Area:\s*(\d+\.?\d*)\s*sq ft/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    areas.push({ id: `restored-${match.index}`, sqft: parseFloat(match[1]) });
  }
  return areas;
};

const StuccoSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "stucco"
      ),
    [estimateData, remodelType]
  );

  const [areas, setAreas] = useState<StuccoArea[]>(() =>
    parseStuccoAreas(existingItem?.description)
  );
  const [sqft, setSqft] = useState("");

  useEffect(() => {
    const totalSqFt = areas.reduce((sum, area) => sum + area.sqft, 0);
    const totalCost = totalSqFt * 12;

    if (totalCost > 0) {
      const description =
        "- Stucco -\n" +
        areas.map((a) => `- Stucco Area: ${a.sqft} sq ft`).join("\n");
      const newItem: EstimateItem = {
        id: "stucco",
        title: "STUCCO",
        category: "REMODEL",
        costCode: "R - Stucco",
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
            (item) => item.id !== "stucco"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "stucco"
          ),
        }));
      }
    }
  }, [areas, existingItem, setEstimateData, remodelType]);

  const handleAddArea = () => {
    const value = parseFloat(sqft);
    if (!value || value <= 0) {
      toast({
        title: "Invalid Square Footage",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setAreas((prev) => [
      ...prev,
      { id: new Date().toISOString(), sqft: value },
    ]);
    setSqft("");
  };

  const handleDeleteArea = (id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Stucco
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} align="stretch">
          <HStack>
            <Input
              type="number"
              placeholder="Square Footage"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
            />
            <IconButton
              aria-label="Add Area"
              icon={<Plus />}
              colorScheme="green"
              onClick={handleAddArea}
            />
          </HStack>
          {areas.length > 0 && (
            <VStack spacing={3} align="stretch" pt={4}>
              <Heading size="sm">Added Areas</Heading>
              {areas.map((area) => (
                <Flex
                  key={area.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>Area: {area.sqft} sq ft</Text>
                  <IconButton
                    aria-label="Delete area"
                    icon={<Trash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteArea(area.id)}
                  />
                </Flex>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default StuccoSection;
