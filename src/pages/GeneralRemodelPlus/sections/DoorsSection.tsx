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
  InputGroup,
  InputRightAddon,
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface Dimension {
  feet: string;
  inches: string;
}
interface Door {
  id: string;
  width: Dimension;
  height: Dimension;
  handing: "RH" | "LH";
  swing?: "Inswing" | "Outswing";
}

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const parseDoorsFromDescription = (desc: string | undefined): Door[] => {
  if (!desc) return [];
  const doors: Door[] = [];
  const doorRegex =
    /-\s*(\d+)ft (\d+)in x (\d+)ft (\d+)in \((RH|LH)(, (Inswing|Outswing))?\)/g;
  const matches = Array.from(desc.matchAll(doorRegex));
  for (const match of matches) {
    doors.push({
      id: `restored-${match.index}`,
      width: { feet: match[1], inches: match[2] },
      height: { feet: match[3], inches: match[4] },
      handing: match[5] as "RH" | "LH",
      swing: match[7] as "Inswing" | "Outswing" | undefined,
    });
  }
  return doors;
};

const DoorInputForm: React.FC<{
  doorType: "Interior" | "Exterior";
  onAddDoor: (door: Door) => void;
}> = ({ doorType, onAddDoor }) => {
  const [width, setWidth] = useState<Dimension>({ feet: "", inches: "" });
  const [height, setHeight] = useState<Dimension>({ feet: "", inches: "" });
  const [handing, setHanding] = useState<"RH" | "LH">("RH");
  const [swing, setSwing] = useState<"Inswing" | "Outswing">("Inswing");
  const toast = useToast();
  const handleAdd = () => {
    if (!width.feet || !height.feet) {
      toast({
        title: "Invalid Dimensions",
        description: "Please enter at least feet for both width and height.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const doorData: Door = {
      id: new Date().toISOString(),
      width: { feet: width.feet || "0", inches: width.inches || "0" },
      height: { feet: height.feet || "0", inches: height.inches || "0" },
      handing,
    };
    if (doorType === "Exterior") doorData.swing = swing;
    onAddDoor(doorData);
    setWidth({ feet: "", inches: "" });
    setHeight({ feet: "", inches: "" });
  };
  return (
    <VStack spacing={4}>
      <Heading size="md">{doorType} Door Details</Heading>
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
              onChange={(e) => setWidth({ ...width, inches: e.target.value })}
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
              onChange={(e) => setHeight({ ...height, feet: e.target.value })}
              type="number"
            />
            <InputRightAddon>ft</InputRightAddon>
          </InputGroup>
          <InputGroup>
            <Input
              placeholder="in"
              value={height.inches}
              onChange={(e) => setHeight({ ...height, inches: e.target.value })}
              type="number"
            />
            <InputRightAddon>in</InputRightAddon>
          </InputGroup>
        </HStack>
      </VStack>
      <HStack>
        <Button
          colorScheme={handing === "RH" ? "blue" : "gray"}
          onClick={() => setHanding("RH")}
        >
          RH
        </Button>
        <Button
          colorScheme={handing === "LH" ? "blue" : "gray"}
          onClick={() => setHanding("LH")}
        >
          LH
        </Button>
      </HStack>
      {doorType === "Exterior" && (
        <HStack>
          <Button
            colorScheme={swing === "Inswing" ? "teal" : "gray"}
            onClick={() => setSwing("Inswing")}
          >
            Inswing
          </Button>
          <Button
            colorScheme={swing === "Outswing" ? "teal" : "gray"}
            onClick={() => setSwing("Outswing")}
          >
            Outswing
          </Button>
        </HStack>
      )}
      <Button
        colorScheme="green"
        onClick={handleAdd}
        leftIcon={<Icon as={Plus} />}
      >
        Add Door
      </Button>
    </VStack>
  );
};

const DoorsSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const [activeSubPage, setActiveSubPage] = useState<
    "interior" | "exterior" | null
  >(null);

  const remodelItems = useMemo(
    () => (estimateData[remodelType] as EstimateItem[]) || [],
    [estimateData, remodelType]
  );

  const interiorDoorsItem = useMemo(
    () => remodelItems.find((item) => item.id === "interiorDoors"),
    [remodelItems]
  );
  const exteriorDoorsItem = useMemo(
    () => remodelItems.find((item) => item.id === "exteriorDoors"),
    [remodelItems]
  );

  const [interiorDoors, setInteriorDoors] = useState<Door[]>(() =>
    parseDoorsFromDescription(interiorDoorsItem?.description)
  );
  const [exteriorDoors, setExteriorDoors] = useState<Door[]>(() =>
    parseDoorsFromDescription(exteriorDoorsItem?.description)
  );

  useEffect(() => {
    const buildDescription = (doors: Door[], header: string) => {
      const parts = [header];
      parts.push(
        ...doors.map(
          (door) =>
            `- ${door.width.feet}ft ${door.width.inches}in x ${
              door.height.feet
            }ft ${door.height.inches}in (${door.handing}${
              door.swing ? `, ${door.swing}` : ""
            })`
        )
      );
      return parts.join("\n");
    };

    const interiorDesc =
      interiorDoors.length > 0
        ? buildDescription(
            interiorDoors,
            "- Install new interior doors and hardware."
          )
        : "";
    const exteriorDesc =
      exteriorDoors.length > 0
        ? buildDescription(
            exteriorDoors,
            "- Install new exterior doors and hardware."
          )
        : "";

    if (
      interiorDesc !== (interiorDoorsItem?.description || "") ||
      exteriorDesc !== (exteriorDoorsItem?.description || "")
    ) {
      setEstimateData((prev: EstimateState) => {
        const currentItems = (prev[remodelType] as EstimateItem[]) || [];
        let nextItems = currentItems.filter(
          (item) => item.id !== "interiorDoors" && item.id !== "exteriorDoors"
        );

        if (interiorDoors.length > 0) {
          nextItems.push({
            id: "interiorDoors",
            title: "INTERIOR DOORS",
            category: "REMODEL",
            costCode: "R - Interior Doors & Trim",
            unitCost: 250.0,
            quantity: interiorDoors.length,
            markup: 70,
            margin: 41.18,
            description: interiorDesc,
          });
        }

        if (exteriorDoors.length > 0) {
          nextItems.push({
            id: "exteriorDoors",
            title: "EXTERIOR DOORS",
            category: "REMODEL",
            costCode: "R - Exterior Doors & Trim",
            unitCost: 600.0,
            quantity: exteriorDoors.length,
            markup: 70,
            margin: 41.18,
            description: exteriorDesc,
          });
        }

        return { ...prev, [remodelType]: nextItems };
      });
    }
  }, [
    interiorDoors,
    exteriorDoors,
    remodelType,
    setEstimateData,
    interiorDoorsItem,
    exteriorDoorsItem,
  ]);

  const handleAddDoor = (door: Door) => {
    if (activeSubPage === "interior")
      setInteriorDoors((prev) => [...prev, door]);
    else if (activeSubPage === "exterior")
      setExteriorDoors((prev) => [...prev, door]);
  };

  const handleDeleteDoor = (doorId: string, type: "interior" | "exterior") => {
    if (type === "interior")
      setInteriorDoors((prev) => prev.filter((d) => d.id !== doorId));
    else setExteriorDoors((prev) => prev.filter((d) => d.id !== doorId));
  };

  if (activeSubPage) {
    const doors = activeSubPage === "interior" ? interiorDoors : exteriorDoors;
    return (
      <VStack w="full" spacing={6} align="stretch">
        <Flex w="full" justify="start">
          <Button
            onClick={() => setActiveSubPage(null)}
            leftIcon={<Icon as={ArrowLeft} />}
          >
            Back to Door Types
          </Button>
        </Flex>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <DoorInputForm
            doorType={activeSubPage === "interior" ? "Interior" : "Exterior"}
            onAddDoor={handleAddDoor}
          />
        </Box>
        {doors.length > 0 && (
          <VStack spacing={3} align="stretch" pt={4}>
            <Heading size="sm">Added {activeSubPage} Doors</Heading>
            {doors.map((door) => (
              <Flex
                key={door.id}
                justify="space-between"
                align="center"
                bg="gray.50"
                p={2}
                borderRadius="md"
              >
                <Text>
                  {door.width.feet}ft {door.width.inches}in x {door.height.feet}
                  ft {door.height.inches}in ({door.handing}
                  {door.swing ? `, ${door.swing}` : ""})
                </Text>
                <IconButton
                  aria-label="Delete door"
                  icon={<Icon as={Trash2} />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDeleteDoor(door.id, activeSubPage!)}
                />
              </Flex>
            ))}
          </VStack>
        )}
      </VStack>
    );
  }

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Doors
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="2px"
        borderColor={
          interiorDoors.length > 0 || exteriorDoors.length > 0
            ? "blue.500"
            : "white"
        }
        transition="border-color 0.2s"
      >
        {/* FIX: This VStack now contains the buttons and the new combined list */}
        <VStack spacing={4}>
          <HStack spacing={4} justify="center" w="full">
            <Button
              size="lg"
              h="100px"
              flex="1"
              colorScheme={interiorDoors.length > 0 ? "blue" : "gray"}
              onClick={() => setActiveSubPage("interior")}
            >
              Interior Doors
            </Button>
            <Button
              size="lg"
              h="100px"
              flex="1"
              colorScheme={exteriorDoors.length > 0 ? "blue" : "gray"}
              onClick={() => setActiveSubPage("exterior")}
            >
              Exterior Doors
            </Button>
          </HStack>

          {/* FEATURE: Display a combined list of all added doors */}
          {(interiorDoors.length > 0 || exteriorDoors.length > 0) && (
            <VStack w="full" pt={6} spacing={2} align="stretch">
              <Divider />
              <Heading size="md" textAlign="center" pt={2}>
                Current Doors
              </Heading>
              {interiorDoors.map((door) => (
                <Flex
                  key={door.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    Interior: {door.width.feet}ft {door.width.inches}in x{" "}
                    {door.height.feet}ft {door.height.inches}in ({door.handing})
                  </Text>
                  <IconButton
                    aria-label="Delete interior door"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteDoor(door.id, "interior")}
                  />
                </Flex>
              ))}
              {exteriorDoors.map((door) => (
                <Flex
                  key={door.id}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    Exterior: {door.width.feet}ft {door.width.inches}in x{" "}
                    {door.height.feet}ft {door.height.inches}in ({door.handing},{" "}
                    {door.swing})
                  </Text>
                  <IconButton
                    aria-label="Delete exterior door"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteDoor(door.id, "exterior")}
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

export default DoorsSection;
