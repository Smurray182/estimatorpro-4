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

interface Slab {
  id: string;
  width: number;
  length: number;
}
interface CmuWall {
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

const parseSlabsFromDescription = (desc: string | undefined): Slab[] => {
  if (!desc) return [];
  const slabs: Slab[] = [];
  const regex = /-\s*Slab:\s*([\d.]+)x([\d.]+)/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    slabs.push({
      id: `restored-slab-${match.index}`,
      width: parseFloat(match[1]),
      length: parseFloat(match[2]),
    });
  }
  return slabs;
};

const parseCmuWallsFromDescription = (desc: string | undefined): CmuWall[] => {
  if (!desc) return [];
  const walls: CmuWall[] = [];
  const regex = /-\s*CMU Wall:\s*([\d.]+)x([\d.]+)/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    walls.push({
      id: `restored-cmu-${match.index}`,
      width: parseFloat(match[1]),
      height: parseFloat(match[2]),
    });
  }
  return walls;
};

const ConcreteSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "concrete"
      ),
    [estimateData, remodelType]
  );

  const [hasShowerPan, setHasShowerPan] = useState(
    () => existingItem?.description?.includes("- Shower Pan") || false
  );
  const [hasTermite, setHasTermite] = useState(
    () => existingItem?.description?.includes("- Termite Treatment") || false
  );
  const [slabs, setSlabs] = useState<Slab[]>(() =>
    parseSlabsFromDescription(existingItem?.description)
  );
  const [cmuWalls, setCmuWalls] = useState<CmuWall[]>(() =>
    parseCmuWallsFromDescription(existingItem?.description)
  );
  const [slabWidth, setSlabWidth] = useState("");
  const [slabLength, setSlabLength] = useState("");
  const [cmuWidth, setCmuWidth] = useState("");
  const [cmuHeight, setCmuHeight] = useState("");

  useEffect(() => {
    const showerPanCost = hasShowerPan ? 250 : 0;
    const termiteCost = hasTermite ? 150 : 0;
    const slabsCost = slabs.reduce(
      (sum, s) => sum + s.width * s.length * 12,
      0
    );
    const cmuWallsCost = cmuWalls.reduce(
      (sum, w) => sum + w.width * w.height * 20,
      0
    );
    const totalCost = showerPanCost + termiteCost + slabsCost + cmuWallsCost;

    const buildDescription = () => {
      const parts = [
        "- Concrete work for new rough plumbing locations to include slab prep, and concrete materials and labor.",
      ];
      if (hasShowerPan) parts.push("- Shower Pan");
      if (hasTermite) parts.push("- Termite Treatment");
      parts.push(...slabs.map((s) => `- Slab: ${s.width}x${s.length}`));
      parts.push(...cmuWalls.map((w) => `- CMU Wall: ${w.width}x${w.height}`));
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "concrete",
        title: "CONCRETE",
        category: "REMODEL",
        costCode: "R - Concrete",
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
            (item) => item.id !== "concrete"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "concrete"
          ),
        }));
      }
    }
  }, [
    hasShowerPan,
    hasTermite,
    slabs,
    cmuWalls,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const handleAddSlab = () => {
    const width = parseFloat(slabWidth);
    const length = parseFloat(slabLength);
    if (!width || !length || width <= 0 || length <= 0) {
      toast({
        title: "Invalid Slab Dimensions",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setSlabs((prev) => [
      ...prev,
      { id: new Date().toISOString(), width, length },
    ]);
    setSlabWidth("");
    setSlabLength("");
  };

  const handleDeleteSlab = (slabId: string) => {
    setSlabs((prev) => prev.filter((s) => s.id !== slabId));
  };

  const handleAddCmuWall = () => {
    const width = parseFloat(cmuWidth);
    const height = parseFloat(cmuHeight);
    if (!width || !height || width <= 0 || height <= 0) {
      toast({
        title: "Invalid CMU Wall Dimensions",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setCmuWalls((prev) => [
      ...prev,
      { id: new Date().toISOString(), width, height },
    ]);
    setCmuWidth("");
    setCmuHeight("");
  };

  const handleDeleteCmuWall = (wallId: string) => {
    setCmuWalls((prev) => prev.filter((w) => w.id !== wallId));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Concrete
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-around">
            <Button
              colorScheme={hasShowerPan ? "blue" : "gray"}
              onClick={() => setHasShowerPan((p) => !p)}
            >
              Shower Pan
            </Button>
            <Button
              colorScheme={hasTermite ? "blue" : "gray"}
              onClick={() => setHasTermite((p) => !p)}
            >
              Termite
            </Button>
          </HStack>
          <Divider />
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Slab
            </Text>
            <HStack>
              <Input
                type="number"
                placeholder="Width (ft)"
                value={slabWidth}
                onChange={(e) => setSlabWidth(e.target.value)}
              />
              <Icon as={X} color="gray.400" />
              <Input
                type="number"
                placeholder="Length (ft)"
                value={slabLength}
                onChange={(e) => setSlabLength(e.target.value)}
              />
              <IconButton
                aria-label="Add slab"
                icon={<Icon as={Plus} />}
                colorScheme="green"
                onClick={handleAddSlab}
              />
            </HStack>
          </VStack>
          <Divider />
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold">
              CMU Wall
            </Text>
            <HStack>
              <Input
                type="number"
                placeholder="Width (ft)"
                value={cmuWidth}
                onChange={(e) => setCmuWidth(e.target.value)}
              />
              <Icon as={X} color="gray.400" />
              <Input
                type="number"
                placeholder="Height (ft)"
                value={cmuHeight}
                onChange={(e) => setCmuHeight(e.target.value)}
              />
              <IconButton
                aria-label="Add CMU wall"
                icon={<Icon as={Plus} />}
                colorScheme="green"
                onClick={handleAddCmuWall}
              />
            </HStack>
          </VStack>
          {(slabs.length > 0 || cmuWalls.length > 0) && (
            <>
              <Divider />
              <VStack spacing={3} align="stretch" pt={2}>
                <Heading size="sm" textAlign="center">
                  Added Concrete Work
                </Heading>
                {slabs.map((slab) => (
                  <Flex
                    key={slab.id}
                    justify="space-between"
                    align="center"
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                  >
                    <Text>
                      Slab: {slab.width} ft x {slab.length} ft
                    </Text>
                    <IconButton
                      aria-label="Delete slab"
                      icon={<Icon as={Trash2} />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteSlab(slab.id)}
                    />
                  </Flex>
                ))}
                {cmuWalls.map((wall) => (
                  <Flex
                    key={wall.id}
                    justify="space-between"
                    align="center"
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                  >
                    <Text>
                      CMU Wall: {wall.width} ft x {wall.height} ft
                    </Text>
                    <IconButton
                      aria-label="Delete CMU wall"
                      icon={<Icon as={Trash2} />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteCmuWall(wall.id)}
                    />
                  </Flex>
                ))}
              </VStack>
            </>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default ConcreteSection;
