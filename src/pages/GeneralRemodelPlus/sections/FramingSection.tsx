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
  Divider,
  useToast,
} from "@chakra-ui/react";
import { Plus, Trash2, X } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface Wall {
  id: string;
  width: number;
  height: number;
}

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const parseWallsFromDescription = (desc: string | undefined): Wall[] => {
  if (!desc) return [];
  const walls: Wall[] = [];
  const wallRegex = /-\s*Wall:\s*([\d.]+)x([\d.]+)/g;
  const matches = Array.from(desc.matchAll(wallRegex));
  for (const match of matches) {
    walls.push({
      id: `restored-${match.index}`,
      width: parseFloat(match[1]),
      height: parseFloat(match[2]),
    });
  }
  return walls;
};

const FramingSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "framing"
      ),
    [estimateData, remodelType]
  );

  const [hasNiche, setHasNiche] = useState(
    () => existingItem?.description?.includes("niche") || false
  );
  const [hasCurb, setHasCurb] = useState(
    () => existingItem?.description?.includes("curb") || false
  );
  const [walls, setWalls] = useState<Wall[]>(() =>
    parseWallsFromDescription(existingItem?.description)
  );
  const [wallWidth, setWallWidth] = useState("");
  const [wallHeight, setWallHeight] = useState("");

  useEffect(() => {
    const nicheCost = hasNiche ? 250 : 0;
    const curbCost = hasCurb ? 150 : 0;
    const wallsCost = walls.reduce(
      (sum, wall) => sum + wall.width * wall.height * 12,
      0
    );
    const totalCost = nicheCost + curbCost + wallsCost;

    const buildDescription = () => {
      let description =
        "Provide labor and materials for framing according to scope.";
      if (hasNiche) description += "\n- Frame in niche (size TBD)";
      if (hasCurb) description += "\n- Frame in shower curb with (3) 2x4";
      if (walls.length > 0)
        description +=
          "\n" + walls.map((w) => `- Wall: ${w.width}x${w.height}`).join("\n");
      return description;
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "framing",
        title: "FRAMING",
        category: "REMODEL",
        costCode: "R - Framing",
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
            (item) => item.id !== "framing"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "framing"
          ),
        }));
      }
    }
  }, [hasNiche, hasCurb, walls, existingItem, setEstimateData, remodelType]);

  const handleAddWall = () => {
    const width = parseFloat(wallWidth);
    const height = parseFloat(wallHeight);
    if (!width || !height || width <= 0 || height <= 0) {
      toast({
        title: "Invalid Dimensions",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const newWall: Wall = { id: new Date().toISOString(), width, height };
    setWalls((prev) => [...prev, newWall]);
    setWallWidth("");
    setWallHeight("");
  };

  const handleDeleteWall = (wallId: string) => {
    setWalls((prev) => prev.filter((wall) => wall.id !== wallId));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Framing
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-around">
            <Button
              colorScheme={hasNiche ? "blue" : "gray"}
              onClick={() => setHasNiche((prev) => !prev)}
            >
              Niche
            </Button>
            <Button
              colorScheme={hasCurb ? "blue" : "gray"}
              onClick={() => setHasCurb((prev) => !prev)}
            >
              Curb
            </Button>
          </HStack>
          <Divider />
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Add a Wall
            </Text>
            <HStack>
              <Input
                type="number"
                placeholder="Width (ft)"
                value={wallWidth}
                onChange={(e) => setWallWidth(e.target.value)}
              />
              <Icon as={X} color="gray.400" />
              <Input
                type="number"
                placeholder="Height (ft)"
                value={wallHeight}
                onChange={(e) => setWallHeight(e.target.value)}
              />
              <IconButton
                aria-label="Add wall"
                icon={<Icon as={Plus} />}
                colorScheme="green"
                onClick={handleAddWall}
              />
            </HStack>
          </VStack>
          {walls.length > 0 && (
            <VStack spacing={3} align="stretch" pt={4}>
              <Heading size="sm">Added Walls</Heading>
              {walls.map((wall) => (
                <Flex
                  key={wall.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    {wall.width} ft x {wall.height} ft
                  </Text>
                  <IconButton
                    aria-label="Delete wall"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteWall(wall.id)}
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

export default FramingSection;
