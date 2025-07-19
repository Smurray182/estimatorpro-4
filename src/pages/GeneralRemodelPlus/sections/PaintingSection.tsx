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
  useToast,
  Divider,
} from "@chakra-ui/react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

interface CustomArea {
  id: string;
  sqft: number;
  cost: number;
}

// FIX: Updated parser functions to handle quantities
const parseQuantity = (desc: string | undefined, label: string): number => {
  if (!desc) return 0;
  const regex = new RegExp(`- ${label} \\(x(\\d+)\\)`);
  const match = desc.match(regex);
  return match ? parseInt(match[1], 10) : 0;
};

const parseCustomAreas = (desc: string | undefined): CustomArea[] => {
  if (!desc) return [];
  const areas: CustomArea[] = [];
  const regex = /-\s*Custom Area:\s*(\d+\.?\d*)\s*sq ft/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    const sqft = parseFloat(match[1]);
    areas.push({
      id: `restored-${match.index}`,
      sqft,
      cost: sqft * 3.25,
    });
  }
  return areas;
};

const PaintingSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();

  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "painting"
      ),
    [estimateData, remodelType]
  );

  // FIX: State updated to handle quantities for each bath size
  const [smBathQuantity, setSmBathQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "SmBath")
  );
  const [lgBathQuantity, setLgBathQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "LgBath")
  );
  const [customAreas, setCustomAreas] = useState<CustomArea[]>(() =>
    parseCustomAreas(existingItem?.description)
  );
  const [customSqFt, setCustomSqFt] = useState("");

  useEffect(() => {
    // FIX: Cost calculation updated for quantities
    const smBathCost = smBathQuantity * 650;
    const lgBathCost = lgBathQuantity * 750;
    const customAreasCost = customAreas.reduce(
      (sum, area) => sum + area.cost,
      0
    );
    const totalCost = smBathCost + lgBathCost + customAreasCost;

    const buildDescription = () => {
      const details = [];
      if (smBathQuantity > 0) details.push(`- SmBath (x${smBathQuantity})`);
      if (lgBathQuantity > 0) details.push(`- LgBath (x${lgBathQuantity})`);
      customAreas.forEach((area) =>
        details.push(`- Custom Area: ${area.sqft} sq ft`)
      );
      if (details.length === 0) return "- Painting -";
      return "- Painting -\n" + details.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "painting",
        title: "PAINTING",
        category: "REMODEL",
        costCode: "R - Painting",
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
            (item) => item.id !== "painting"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "painting"
          ),
        }));
      }
    }
  }, [
    smBathQuantity,
    lgBathQuantity,
    customAreas,
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

  const handleAddCustomArea = () => {
    const sqft = parseFloat(customSqFt);
    if (!sqft || sqft <= 0) {
      toast({
        title: "Invalid Square Footage",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    const newArea: CustomArea = {
      id: new Date().toISOString(),
      sqft,
      cost: sqft * 3.25,
    };
    setCustomAreas((prev) => [...prev, newArea]);
    setCustomSqFt("");
  };

  const handleDeleteCustomArea = (id: string) => {
    setCustomAreas((prev) => prev.filter((area) => area.id !== id));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Painting
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="2px"
        borderColor={
          smBathQuantity > 0 || lgBathQuantity > 0 || customAreas.length > 0
            ? "blue.500"
            : "white"
        }
        transition="border-color 0.2s"
      >
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          {/* FIX: Replaced buttons with quantity steppers */}
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              SmBath
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setSmBathQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {smBathQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setSmBathQuantity, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              LgBath
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setLgBathQuantity, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {lgBathQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setLgBathQuantity, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>

          <Divider />

          <HStack>
            <Input
              type="number"
              placeholder="Custom Sq Ft"
              value={customSqFt}
              onChange={(e) => setCustomSqFt(e.target.value)}
            />
            <IconButton
              aria-label="Add custom area"
              icon={<Icon as={Plus} />}
              colorScheme="green"
              onClick={handleAddCustomArea}
            />
          </HStack>

          {customAreas.length > 0 && (
            <VStack spacing={3} align="stretch" pt={4}>
              <Heading size="sm">Custom Areas</Heading>
              {customAreas.map((area) => (
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
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteCustomArea(area.id)}
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

export default PaintingSection;
