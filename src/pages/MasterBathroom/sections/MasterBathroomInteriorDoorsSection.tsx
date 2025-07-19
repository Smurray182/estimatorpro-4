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
import { CustomNumberInput } from "components/CustomNumberInput";

interface Door {
  id: number;
  description: string;
  materialCost: number;
  laborCost: number;
}
interface InteriorDoorsDetails {
  doors: Door[];
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomInteriorDoorsSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<InteriorDoorsDetails>(
    initialData?.interiorDoorsDetails || { doors: [] }
  );

  const [doorType, setDoorType] = useState("hinged");
  const [wFt, setWFt] = useState("");
  const [wIn, setWIn] = useState("");
  const [hFt, setHFt] = useState("");
  const [hIn, setHIn] = useState("");
  const [hinge, setHinge] = useState("RH");
  const [casing, setCasing] = useState(false);

  const totalCost = useMemo(() => {
    return details.doors.reduce(
      (sum, door) => sum + door.materialCost + door.laborCost,
      0
    );
  }, [details.doors]);

  useEffect(() => {
    onUpdate({ interiorDoorsDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const resetForm = () => {
    setWFt("");
    setWIn("");
    setHFt("");
    setHIn("");
    setHinge("RH");
    setCasing(false);
  };

  const handleAddDoor = () => {
    let materialCost = 0;
    let laborCost = 0;
    let description = `${wFt || 0}'${wIn || 0}" x ${hFt || 0}'${hIn || 0}"`;

    switch (doorType) {
      case "hinged":
        materialCost = 250;
        laborCost = 115;
        description += `, ${hinge}, Hinged`;
        break;
      case "pocket":
        materialCost = 500;
        laborCost = 250;
        description += `, Pocket`;
        break;
    }
    if (casing) {
      laborCost += 125;
      description += ", Casing";
    }
    setDetails((prev) => ({
      ...prev,
      doors: [
        ...prev.doors,
        { id: Date.now(), description, materialCost, laborCost },
      ],
    }));
    resetForm();
  };

  const handleRemoveDoor = (id: number) => {
    setDetails((prev) => ({
      ...prev,
      doors: prev.doors.filter((door) => door.id !== id),
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <HStack>
          {["hinged", "pocket"].map((type) => (
            <Button
              key={type}
              onClick={() => setDoorType(type)}
              flex={1}
              size="sm"
              colorScheme={doorType === type ? "blue" : "gray"}
              textTransform="capitalize"
            >
              {type}
            </Button>
          ))}
        </HStack>
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
            {doorType === "hinged" && (
              <HStack w="100%">
                <Button
                  onClick={() => setHinge("RH")}
                  flex={1}
                  colorScheme={hinge === "RH" ? "blue" : "gray"}
                >
                  RH
                </Button>
                <Button
                  onClick={() => setHinge("LH")}
                  flex={1}
                  colorScheme={hinge === "LH" ? "blue" : "gray"}
                >
                  LH
                </Button>
              </HStack>
            )}
            <Checkbox
              isChecked={casing}
              onChange={(e) => setCasing(e.target.checked)}
            >
              Add Casing ($125)
            </Checkbox>
            <Button
              onClick={handleAddDoor}
              colorScheme="blue"
              leftIcon={<PlusCircle size={20} />}
              w="100%"
            >
              Add Door
            </Button>
          </VStack>
        </Box>
        <VStack align="stretch" spacing={2}>
          {details.doors.map((door) => (
            <HStack
              key={door.id}
              justify="space-between"
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontSize="sm" w="70%">
                {door.description}
              </Text>
              <Box textAlign="right">
                <Text fontWeight="bold">
                  ${(door.materialCost + door.laborCost).toFixed(2)}
                </Text>
              </Box>
              <IconButton
                aria-label="Remove door"
                icon={<X size={18} />}
                onClick={() => handleRemoveDoor(door.id)}
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
