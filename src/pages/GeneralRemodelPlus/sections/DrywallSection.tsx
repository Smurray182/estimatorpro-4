import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
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

// FIX: Added interface for scrape areas
interface ScrapeArea {
  id: string;
  sqft: number;
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
  const regex = /-\s*Sheetrock Wall:\s*([\d.]+)x([\d.]+)/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    walls.push({
      id: `restored-${match.index}`,
      width: parseFloat(match[1]),
      height: parseFloat(match[2]),
    });
  }
  return walls;
};

// FIX: New parser for scrape areas
const parseScrapeAreasFromDescription = (
  desc: string | undefined
): ScrapeArea[] => {
  if (!desc) return [];
  const areas: ScrapeArea[] = [];
  const regex = /-\s*Scrape and Texture:\s*(\d+\.?\d*)\s*sq ft/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    areas.push({
      id: `restored-scrape-${match.index}`,
      sqft: parseFloat(match[1]),
    });
  }
  return areas;
};

const DrywallSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "drywall"
      ),
    [estimateData, remodelType]
  );

  const [walls, setWalls] = useState<Wall[]>(() =>
    parseWallsFromDescription(existingItem?.description)
  );
  // FIX: State updated to handle multiple scrape areas
  const [scrapeAreas, setScrapeAreas] = useState<ScrapeArea[]>(() =>
    parseScrapeAreasFromDescription(existingItem?.description)
  );
  const [wallWidth, setWallWidth] = useState("");
  const [wallHeight, setWallHeight] = useState("");
  const [scrapeSqFtInput, setScrapeSqFtInput] = useState("");

  useEffect(() => {
    const sheetrockSqFt = walls.reduce(
      (sum, wall) => sum + wall.width * wall.height,
      0
    );
    const sheetrockCost = (sheetrockSqFt / 32) * 200;
    // FIX: Cost now calculated from the array of scrape areas
    const scrapeTotalSqFt = scrapeAreas.reduce(
      (sum, area) => sum + area.sqft,
      0
    );
    const scrapeCost = scrapeTotalSqFt * 4;

    const totalCost = sheetrockCost + scrapeCost;

    const buildDescription = () => {
      const parts: string[] = ["- DRYWALL -"];
      if (walls.length > 0) {
        parts.push(
          ...walls.map((w) => `- Sheetrock Wall: ${w.width}x${w.height}`)
        );
      }
      // FIX: Description built from the array of scrape areas
      if (scrapeAreas.length > 0) {
        parts.push(
          ...scrapeAreas.map((a) => `- Scrape and Texture: ${a.sqft} sq ft`)
        );
      }
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "drywall",
        title: "DRYWALL",
        category: "REMODEL",
        costCode: "R - Drywall Hang/Finishing/Texture",
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
            (item) => item.id !== "drywall"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "drywall"
          ),
        }));
      }
    }
  }, [walls, scrapeAreas, existingItem, setEstimateData, remodelType]);

  const handleAddWall = () => {
    const width = parseFloat(wallWidth);
    const height = parseFloat(wallHeight);
    if (!width || !height || width <= 0 || height <= 0) {
      toast({
        title: "Invalid Wall Dimensions",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setWalls((prev) => [
      ...prev,
      { id: new Date().toISOString(), width, height },
    ]);
    setWallWidth("");
    setWallHeight("");
  };

  const handleDeleteWall = (id: string) => {
    setWalls((prev) => prev.filter((wall) => wall.id !== id));
  };

  // FIX: New handlers for adding and deleting scrape areas
  const handleAddScrapeArea = () => {
    const value = parseFloat(scrapeSqFtInput);
    if (!value || value <= 0) {
      toast({
        title: "Invalid Square Footage",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setScrapeAreas((prev) => [
      ...prev,
      { id: new Date().toISOString(), sqft: value },
    ]);
    setScrapeSqFtInput("");
  };

  const handleDeleteScrapeArea = (id: string) => {
    setScrapeAreas((prev) => prev.filter((area) => area.id !== id));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Drywall
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="2px"
        borderColor={
          walls.length > 0 || scrapeAreas.length > 0 ? "blue.500" : "white"
        }
        transition="border-color 0.2s"
      >
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Sheetrock
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
                icon={<Plus />}
                colorScheme="green"
                onClick={handleAddWall}
              />
            </HStack>
          </VStack>
          {walls.length > 0 && (
            <VStack spacing={3} align="stretch" pt={2}>
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
                    {wall.width} ft x {wall.height} ft ={" "}
                    {wall.width * wall.height} sq ft
                  </Text>
                  <IconButton
                    aria-label="Delete wall"
                    icon={<Trash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteWall(wall.id)}
                  />
                </Flex>
              ))}
            </VStack>
          )}

          {/* FIX: Updated UI for Scrape and Texture */}
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Scrape and Texture
            </Text>
            <HStack>
              <Input
                type="number"
                placeholder="Enter Square Footage"
                value={scrapeSqFtInput}
                onChange={(e) => setScrapeSqFtInput(e.target.value)}
              />
              <IconButton
                aria-label="Add Scrape Area"
                icon={<Plus />}
                colorScheme="green"
                onClick={handleAddScrapeArea}
              />
            </HStack>
          </VStack>
          {scrapeAreas.length > 0 && (
            <VStack spacing={3} align="stretch" pt={2}>
              {scrapeAreas.map((area) => (
                <Flex
                  key={area.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>Scrape/Texture Area: {area.sqft} sq ft</Text>
                  <IconButton
                    aria-label="Delete scrape area"
                    icon={<Trash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteScrapeArea(area.id)}
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

export default DrywallSection;
