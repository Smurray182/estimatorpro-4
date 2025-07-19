import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  SimpleGrid,
  Checkbox,
} from "@chakra-ui/react";
import { PlusCircle, X } from "lucide-react";
import { DimensionInputGroup } from "components/DimensionInputGroup";

interface Window {
  id: number;
  description: string;
  materialCost: number;
  laborCost: number;
}
interface WindowsDetails {
  windows: Window[];
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenWindowsSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<WindowsDetails>(
    initialData?.windowsDetails || { windows: [] }
  );

  const [windowType, setWindowType] = useState("single_hung");
  const [wFt, setWFt] = useState("");
  const [wIn, setWIn] = useState("");
  const [hFt, setHFt] = useState("");
  const [hIn, setHIn] = useState("");
  const [isImpact, setIsImpact] = useState(false);

  const totalCost = useMemo(
    () =>
      details.windows.reduce(
        (sum, win) => sum + win.materialCost + win.laborCost,
        0
      ),
    [details.windows]
  );
  useEffect(() => {
    onUpdate({ windowsDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const resetForm = () => {
    setWFt("");
    setWIn("");
    setHFt("");
    setHIn("");
    setIsImpact(false);
  };

  const handleAddWindow = () => {
    let materialCost = 0;
    const laborCost = 250;
    switch (windowType) {
      case "single_hung":
        materialCost = 650;
        break;
      case "slider":
        materialCost = 650;
        break;
      case "casement":
        materialCost = 750;
        break;
      case "fixed":
        materialCost = 800;
        break;
      case "other":
        materialCost = 1000;
        break;
      default:
        break;
    }
    if (isImpact) {
      materialCost += 600;
    }
    const description = `${wFt || 0}'${wIn || 0}" x ${hFt || 0}'${
      hIn || 0
    }" ${windowType.replace("_", " ")}, ${isImpact ? "impact" : "non-impact"}`;
    setDetails((prev) => ({
      ...prev,
      windows: [
        ...prev.windows,
        { id: Date.now(), description, materialCost, laborCost },
      ],
    }));
    resetForm();
  };

  const handleRemoveWindow = (id: number) => {
    setDetails((prev) => ({
      ...prev,
      windows: prev.windows.filter((win) => win.id !== id),
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={2}>
          {["single_hung", "slider", "casement", "fixed", "other"].map(
            (type) => (
              <Button
                key={type}
                onClick={() => setWindowType(type)}
                size="sm"
                colorScheme={windowType === type ? "blue" : "gray"}
                textTransform="capitalize"
              >
                {type.replace("_", " ")}
              </Button>
            )
          )}
        </SimpleGrid>
        <Box p={4} bg="gray.100" borderRadius="md">
          <VStack spacing={4}>
            <DimensionInputGroup
              wFt={wFt}
              setWFt={setWFt}
              wIn={wIn}
              setWIn={setWIn}
              hFt={hFt}
              setHFt={setHFt}
              hIn={hIn}
              setHIn={setHIn}
            />
            <Checkbox
              isChecked={isImpact}
              onChange={(e) => setIsImpact(e.target.checked)}
            >
              Impact Glass (+$600)
            </Checkbox>
            <Button
              onClick={handleAddWindow}
              colorScheme="blue"
              leftIcon={<PlusCircle size={20} />}
              w="100%"
            >
              Add Window
            </Button>
          </VStack>
        </Box>
        <VStack align="stretch" spacing={2}>
          {details.windows.map((win) => (
            <HStack
              key={win.id}
              justify="space-between"
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontSize="sm" w="70%">
                {win.description}
              </Text>
              <Box textAlign="right">
                <Text fontWeight="bold">
                  ${(win.materialCost + win.laborCost).toFixed(2)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  M:${win.materialCost.toFixed(2)}, L:$
                  {win.laborCost.toFixed(2)}
                </Text>
              </Box>
              <IconButton
                aria-label="Remove window"
                icon={<X size={18} />}
                onClick={() => handleRemoveWindow(win.id)}
                size="xs"
                colorScheme="red"
                variant="ghost"
              />
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};
