import React, { useState, useEffect, useMemo } from "react";
import { Box, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  // FIX: Add remodelType to the props
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const planOptions = [
  { id: "survey", label: "Survey", cost: 600 },
  { id: "engineer", label: "Engineer", cost: 1100 },
  { id: "drafting", label: "Drafting", cost: 750 },
];

const PlansAndEngineeringSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  // FIX: Find the existing item from the correct slice of state
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "plansAndEngineering"
      ),
    [estimateData, remodelType]
  );

  const [activeOptions, setActiveOptions] = useState<string[]>(() => {
    if (existingItem && existingItem.description) {
      return planOptions
        .filter((opt) => existingItem.description!.includes(`- ${opt.label}`))
        .map((opt) => opt.id);
    }
    return [];
  });

  useEffect(() => {
    const selectedOptions = planOptions.filter((opt) =>
      activeOptions.includes(opt.id)
    );

    if (selectedOptions.length === 0) {
      // FIX: Ensure item is removed from the correct slice of state
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "plansAndEngineering"
          ),
        }));
      }
      return;
    }

    const totalCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
    const description =
      " - Plans and Engineering - \n" +
      selectedOptions.map((opt) => `- ${opt.label}`).join("\n");

    const newItem: EstimateItem = {
      id: "plansAndEngineering",
      title: "PLANS / ENGINEERING",
      category: "REMODEL",
      costCode: "R - Engineering",
      unitCost: totalCost,
      quantity: 1,
      markup: 70,
      margin: 41.18,
      description: description,
    };

    // FIX: Anti-loop check and update the correct slice of state
    if (newItem.description !== existingItem?.description) {
      setEstimateData((prev) => {
        const currentItems = (
          Array.isArray(prev[remodelType]) ? prev[remodelType] : []
        ) as EstimateItem[];
        const otherItems = currentItems.filter(
          (item) => item.id !== "plansAndEngineering"
        );
        return {
          ...prev,
          [remodelType]: [...otherItems, newItem],
        };
      });
    }
  }, [activeOptions, existingItem, setEstimateData, remodelType]);

  const handleButtonClick = (optionId: string) => {
    setActiveOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Plans & Engineering
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="2px"
        borderColor={activeOptions.length > 0 ? "blue.500" : "white"}
        transition="border-color 0.2s"
      >
        <VStack spacing={4} align="stretch">
          {planOptions.map((option) => (
            <Button
              key={option.id}
              colorScheme={activeOptions.includes(option.id) ? "blue" : "gray"}
              onClick={() => handleButtonClick(option.id)}
              size="lg"
              justifyContent="center"
            >
              <Text>{option.label}</Text>
            </Button>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default PlansAndEngineeringSection;
