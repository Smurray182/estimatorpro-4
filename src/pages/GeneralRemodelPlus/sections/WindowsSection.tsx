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
  SimpleGrid,
  useToast,
  Checkbox,
  InputGroup,
  InputRightAddon,
  Divider, // FIX: Added the missing Divider import
} from "@chakra-ui/react";
import { Trash2, Plus, Minus } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface Dimension {
  feet: string;
  inches: string;
}
interface Window {
  id: string;
  type: string;
  width: Dimension;
  height: Dimension;
  isImpact: boolean;
  cost: number;
  quantity: number;
}

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const windowTypes = ["Single Hung", "Slider", "Casement", "Fixed", "Other"];

const parseWindowsFromDescription = (desc: string | undefined): Window[] => {
  if (!desc) return [];
  const windows: Window[] = [];
  const lines = desc.split("\n");
  for (const line of lines) {
    const regex =
      /-\s*(.*?):\s*(\d+)'(\d+)"\s*x\s*(\d+)'(\d+)"\s*\(x(\d+)\)(\s*\(Impact\))?/;
    const match = line.match(regex);
    if (match) {
      const [
        ,
        type,
        widthFt,
        widthIn,
        heightFt,
        heightIn,
        quantityStr,
        impactStr,
      ] = match;
      const totalWidthInches =
        parseInt(widthFt, 10) * 12 + parseInt(widthIn, 10);
      const totalHeightInches =
        parseInt(heightFt, 10) * 12 + parseInt(heightIn, 10);
      const isImpact = !!impactStr;
      let cost = 650;
      if (totalWidthInches > 48 || totalHeightInches > 60) cost += 400;
      if (isImpact) cost += 600;
      windows.push({
        id: `restored-${type.trim()}-${windows.length}`,
        type: type.trim(),
        width: { feet: widthFt, inches: widthIn },
        height: { feet: heightFt, inches: heightIn },
        isImpact,
        cost,
        quantity: parseInt(quantityStr, 10) || 1,
      });
    }
  }
  return windows;
};

const WindowsSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const toast = useToast();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "windows"
      ),
    [estimateData, remodelType]
  );

  const [selectedType, setSelectedType] = useState<string>(windowTypes[0]);
  const [width, setWidth] = useState<Dimension>({ feet: "", inches: "" });
  const [height, setHeight] = useState<Dimension>({ feet: "", inches: "" });
  const [isImpact, setIsImpact] = useState(false);
  const [windows, setWindows] = useState<Window[]>(() =>
    parseWindowsFromDescription(existingItem?.description)
  );

  useEffect(() => {
    const totalCost = windows.reduce(
      (sum, win) => sum + win.cost * win.quantity,
      0
    );

    if (totalCost > 0) {
      const description =
        "- Windows -\n" +
        windows
          .map(
            (w) =>
              `- ${w.type}: ${w.width.feet}'${w.width.inches}" x ${
                w.height.feet
              }'${w.height.inches}" (x${w.quantity})${
                w.isImpact ? " (Impact)" : ""
              }`
          )
          .join("\n");
      const newItem: EstimateItem = {
        id: "windows",
        title: "WINDOWS",
        category: "REMODEL",
        costCode: "R - Windows",
        unitCost: totalCost,
        quantity: 1,
        markup: 70,
        margin: 41.18,
        description,
      };

      if (newItem.description !== existingItem?.description) {
        setEstimateData((prev) => {
          const currentItems = (
            Array.isArray(prev[remodelType]) ? prev[remodelType] : []
          ) as EstimateItem[];
          const otherItems = currentItems.filter(
            (item) => item.id !== "windows"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "windows"
          ),
        }));
      }
    }
  }, [windows, existingItem, setEstimateData, remodelType]);

  const handleAddWindow = () => {
    const widthFt = parseFloat(width.feet) || 0;
    const widthIn = parseFloat(width.inches) || 0;
    const heightFt = parseFloat(height.feet) || 0;
    const heightIn = parseFloat(height.inches) || 0;
    const totalWidthInches = widthFt * 12 + widthIn;
    const totalHeightInches = heightFt * 12 + heightIn;
    if (totalWidthInches <= 0 || totalHeightInches <= 0) {
      toast({ title: "Invalid Dimensions", status: "warning", duration: 2000 });
      return;
    }
    let cost = 650;
    if (totalWidthInches > 48 || totalHeightInches > 60) cost += 400;
    if (isImpact) cost += 600;
    const newWindow: Window = {
      id: new Date().toISOString(),
      type: selectedType,
      width: { feet: String(widthFt), inches: String(widthIn) },
      height: { feet: String(heightFt), inches: String(heightIn) },
      isImpact,
      cost,
      quantity: 1,
    };
    setWindows((prev) => [...prev, newWindow]);
    setWidth({ feet: "", inches: "" });
    setHeight({ feet: "", inches: "" });
    setIsImpact(false);
  };

  const handleQuantityChange = (windowId: string, amount: number) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === windowId
          ? { ...win, quantity: Math.max(1, win.quantity + amount) }
          : win
      )
    );
  };

  const handleDeleteWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Windows
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Window Type
          </Text>
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
            {windowTypes.map((type) => (
              <Button
                key={type}
                colorScheme={selectedType === type ? "blue" : "gray"}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </SimpleGrid>
          <Divider />
          <VStack align="stretch" spacing={3}>
            <Text fontWeight="semibold">Width</Text>
            <HStack>
              <InputGroup>
                <Input
                  placeholder="ft"
                  value={width.feet}
                  onChange={(e) => setWidth({ ...width, feet: e.target.value })}
                  type="number"
                />
                <InputRightAddon>ft</InputRightAddon>
              </InputGroup>
              <InputGroup>
                <Input
                  placeholder="in"
                  value={width.inches}
                  onChange={(e) =>
                    setWidth({ ...width, inches: e.target.value })
                  }
                  type="number"
                />
                <InputRightAddon>in</InputRightAddon>
              </InputGroup>
            </HStack>
            <Text fontWeight="semibold">Height</Text>
            <HStack>
              <InputGroup>
                <Input
                  placeholder="ft"
                  value={height.feet}
                  onChange={(e) =>
                    setHeight({ ...height, feet: e.target.value })
                  }
                  type="number"
                />
                <InputRightAddon>ft</InputRightAddon>
              </InputGroup>
              <InputGroup>
                <Input
                  placeholder="in"
                  value={height.inches}
                  onChange={(e) =>
                    setHeight({ ...height, inches: e.target.value })
                  }
                  type="number"
                />
                <InputRightAddon>in</InputRightAddon>
              </InputGroup>
            </HStack>
          </VStack>
          <Checkbox
            isChecked={isImpact}
            onChange={(e) => setIsImpact(e.target.checked)}
            colorScheme="blue"
          >
            Impact Glass
          </Checkbox>
          <Button
            colorScheme="green"
            onClick={handleAddWindow}
            leftIcon={<Icon as={Plus} />}
          >
            Add Window
          </Button>
          {windows.length > 0 && (
            <VStack spacing={3} align="stretch" pt={4}>
              <Heading size="sm">Added Windows</Heading>
              {windows.map((win) => (
                <Flex
                  key={win.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">
                      {win.type}: {win.width.feet}'{win.width.inches}" x{" "}
                      {win.height.feet}'{win.height.inches}"
                      {win.isImpact ? " (Impact)" : ""}
                    </Text>
                    <HStack>
                      <Text fontSize="sm">Qty:</Text>
                      <IconButton
                        aria-label="Decrease quantity"
                        icon={<Minus size="12px" />}
                        size="xs"
                        onClick={() => handleQuantityChange(win.id, -1)}
                        isDisabled={win.quantity <= 1}
                      />
                      <Text fontSize="sm" fontWeight="bold">
                        {win.quantity}
                      </Text>
                      <IconButton
                        aria-label="Increase quantity"
                        icon={<Plus size="12px" />}
                        size="xs"
                        onClick={() => handleQuantityChange(win.id, 1)}
                      />
                    </HStack>
                  </VStack>
                  <IconButton
                    aria-label="Delete window"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteWindow(win.id)}
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

export default WindowsSection;
