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

export const KitchenInteriorDoorsSection: React.FC<SectionProps> = ({
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
  const [hardware, setHardware] = useState(false);
  const [allowance, setAllowance] = useState("");

  const totalCost = useMemo(
    () =>
      details.doors.reduce(
        (sum, door) => sum + door.materialCost + door.laborCost,
        0
      ),
    [details.doors]
  );

  useEffect(() => {
    onUpdate({ interiorDoorsDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const resetForm = () => {
    setWFt("");
    setWIn("");
    setHFt("");
    setHIn("");
    setHinge("RH");
    setHardware(false);
    setAllowance("");
  };

  const handleAddDoor = () => {
    const widthInches = (parseFloat(wFt) || 0) * 12 + (parseFloat(wIn) || 0);
    let materialCost = 0;
    let laborCost = 0;
    let description = `${wFt || 0}'${wIn || 0}" x ${hFt || 0}'${hIn || 0}"`;

    switch (doorType) {
      case "hinged":
        materialCost = 250;
        laborCost = 115;
        description += `, ${hinge}, Hinged door`;
        break;
      case "pocket":
        materialCost = 500;
        laborCost = 250;
        description += `, Pocket door`;
        break;
      case "bypass":
        materialCost = widthInches > 72 ? 325 : 225;
        laborCost = 115;
        description += ", Bypass door";
        break;
      case "bifold":
        materialCost = 125;
        laborCost = 115;
        description += ", Bifold door";
        break;
      case "barn":
        materialCost = (parseFloat(allowance) || 0) + (hardware ? 150 : 0);
        laborCost = 300;
        description += `, Barn Door, ${hardware ? "Hdw, " : ""}Allow $${
          allowance || 0
        }`;
        break;
      default:
        break;
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
        <SimpleGrid columns={5} spacing={2}>
          {["hinged", "pocket", "bypass", "bifold", "barn"].map((type) => (
            <Button
              key={type}
              onClick={() => setDoorType(type)}
              size="sm"
              colorScheme={doorType === type ? "blue" : "gray"}
              textTransform="capitalize"
            >
              {type}
            </Button>
          ))}
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
            {doorType === "barn" && (
              <VStack w="100%" align="stretch">
                <Checkbox
                  isChecked={hardware}
                  onChange={(e) => setHardware(e.target.checked)}
                >
                  Hardware ($150)
                </Checkbox>
                <CustomNumberInput
                  label="Allowance"
                  value={allowance}
                  onChange={(e) => setAllowance(e.target.value)}
                  unit="$"
                />
              </VStack>
            )}
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
                <Text fontSize="xs" color="gray.500">
                  M:${door.materialCost.toFixed(2)}, L:$
                  {door.laborCost.toFixed(2)}
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
