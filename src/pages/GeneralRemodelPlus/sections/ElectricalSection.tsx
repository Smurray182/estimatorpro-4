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
  SimpleGrid,
} from "@chakra-ui/react";
import { Plus, Minus } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const parseQuantity = (desc: string | undefined, label: string): number => {
  if (!desc) return 0;
  const regex = new RegExp(`- ${label} \\(x(\\d+)\\)`);
  const match = desc.match(regex);
  return match ? parseInt(match[1], 10) : 0;
};

const parseMiscCost = (desc: string | undefined): string => {
  if (!desc) return "";
  const match = desc.match(/- Misc Cost: \$([\d.]+)/);
  return match ? match[1] : "";
};

const ElectricalSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "electrical"
      ),
    [estimateData, remodelType]
  );

  const [leds, setLeds] = useState(() =>
    parseQuantity(existingItem?.description, "LEDs")
  );
  const [exhaustFans, setExhaustFans] = useState(() =>
    parseQuantity(existingItem?.description, "Exhaust Fan")
  );
  const [exhaustFanLights, setExhaustFanLights] = useState(() =>
    parseQuantity(existingItem?.description, "Exhaust Fan Light")
  );
  const [exhaustFanVTRs, setExhaustFanVTRs] = useState(() =>
    parseQuantity(existingItem?.description, "Exhaust Fan VTR")
  );
  const [switches, setSwitches] = useState(() =>
    parseQuantity(existingItem?.description, "Switches")
  );
  const [outlets, setOutlets] = useState(() =>
    parseQuantity(existingItem?.description, "Outlets")
  );
  const [decoras, setDecoras] = useState(() =>
    parseQuantity(existingItem?.description, "Decora")
  );
  // FIX: Added state for vanity light quantity
  const [vanityLightQuantity, setVanityLightQuantity] = useState(() =>
    parseQuantity(existingItem?.description, "Vanity Light Install")
  );
  const [miscCost, setMiscCost] = useState(() =>
    parseMiscCost(existingItem?.description)
  );
  const [toggles, setToggles] = useState<{ [key: string]: boolean }>(() => {
    const desc = existingItem?.description || "";
    return {
      undercabinetLighting: desc.includes("- Undercabinet Lighting"),
      newMeter: desc.includes("- New Meter"),
      hvacHookup: desc.includes("- HVAC Hook up"),
      installOnly: desc.includes("- Install Only"),
    };
  });

  useEffect(() => {
    const ledCost = leds * 150;
    const exhaustFanCost = exhaustFans * 350;
    const exhaustFanLightCost = exhaustFanLights * 100;
    const exhaustFanVTRCost = exhaustFanVTRs * 500;
    const decoraCost = decoras * 15;
    const switchCost = switches > 5 ? switches * 300 : switches * 400;
    const outletCost = outlets > 5 ? outlets * 300 : outlets * 400;
    // FIX: Calculate cost based on quantity
    const vanityLightInstallCost = vanityLightQuantity * 100;
    const undercabinetLightingCost = toggles.undercabinetLighting ? 1000 : 0;
    const newMeterCost = toggles.newMeter ? 1000 : 0;
    const hvacHookupCost = toggles.hvacHookup ? 850 : 0;
    const installOnlyCost = toggles.installOnly ? 100 : 0;
    const miscellaneousCost = parseFloat(miscCost) || 0;
    const totalCost =
      ledCost +
      exhaustFanCost +
      exhaustFanLightCost +
      exhaustFanVTRCost +
      switchCost +
      outletCost +
      decoraCost +
      vanityLightInstallCost +
      undercabinetLightingCost +
      newMeterCost +
      hvacHookupCost +
      installOnlyCost +
      miscellaneousCost;

    const buildDescription = () => {
      const parts = ["All electrical work and materials to complete scope."];
      if (leds > 0) parts.push(`- LEDs (x${leds})`);
      if (exhaustFans > 0) parts.push(`- Exhaust Fan (x${exhaustFans})`);
      if (exhaustFanLights > 0)
        parts.push(`- Exhaust Fan Light (x${exhaustFanLights})`);
      if (exhaustFanVTRs > 0)
        parts.push(`- Exhaust Fan VTR (x${exhaustFanVTRs})`);
      if (switches > 0) parts.push(`- Switches (x${switches})`);
      if (outlets > 0) parts.push(`- Outlets (x${outlets})`);
      if (decoras > 0) parts.push(`- Decora (x${decoras})`);
      // FIX: Add quantity to description
      if (vanityLightQuantity > 0)
        parts.push(`- Vanity Light Install (x${vanityLightQuantity})`);
      if (toggles.undercabinetLighting) parts.push("- Undercabinet Lighting");
      if (toggles.newMeter) parts.push("- New Meter");
      if (toggles.hvacHookup) parts.push("- HVAC Hook up");
      if (toggles.installOnly) parts.push("- Install Only");
      if (miscellaneousCost > 0)
        parts.push(`- Misc Cost: $${miscellaneousCost}`);
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "electrical",
        title: "ELECTRICAL",
        category: "REMODEL",
        costCode: "R - Electrical",
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
            (item) => item.id !== "electrical"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "electrical"
          ),
        }));
      }
    }
  }, [
    leds,
    exhaustFans,
    exhaustFanLights,
    exhaustFanVTRs,
    switches,
    outlets,
    decoras,
    vanityLightQuantity, // FIX: Add to dependency array
    miscCost,
    toggles,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const handleQuantityChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    currentValue: number,
    amount: number
  ) => {
    setter(Math.max(0, currentValue + amount));
  };

  const handleToggleClick = (field: string) => {
    setToggles((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Electrical
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} align="stretch" divider={<Divider />}>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              LED Lights
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setLeds, leds, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {leds}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setLeds, leds, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Exhaust Fan
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() =>
                  handleQuantityChange(setExhaustFans, exhaustFans, -1)
                }
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {exhaustFans}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() =>
                  handleQuantityChange(setExhaustFans, exhaustFans, 1)
                }
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Exhaust Fan Light
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() =>
                  handleQuantityChange(
                    setExhaustFanLights,
                    exhaustFanLights,
                    -1
                  )
                }
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {exhaustFanLights}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() =>
                  handleQuantityChange(setExhaustFanLights, exhaustFanLights, 1)
                }
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Exhaust Fan VTR
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() =>
                  handleQuantityChange(setExhaustFanVTRs, exhaustFanVTRs, -1)
                }
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {exhaustFanVTRs}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() =>
                  handleQuantityChange(setExhaustFanVTRs, exhaustFanVTRs, 1)
                }
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Switches
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setSwitches, switches, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {switches}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setSwitches, switches, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Outlets
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setOutlets, outlets, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {outlets}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setOutlets, outlets, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Decora
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() => handleQuantityChange(setDecoras, decoras, -1)}
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {decoras}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() => handleQuantityChange(setDecoras, decoras, 1)}
                isRound
                size="sm"
              />
            </HStack>
          </Flex>

          {/* FIX: Replaced toggle button with quantity stepper */}
          <Flex justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Vanity Light Install
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease"
                icon={<Minus />}
                onClick={() =>
                  handleQuantityChange(
                    setVanityLightQuantity,
                    vanityLightQuantity,
                    -1
                  )
                }
                isRound
                size="sm"
              />
              <Text fontSize="xl" w="40px" textAlign="center">
                {vanityLightQuantity}
              </Text>
              <IconButton
                aria-label="Increase"
                icon={<Plus />}
                onClick={() =>
                  handleQuantityChange(
                    setVanityLightQuantity,
                    vanityLightQuantity,
                    1
                  )
                }
                isRound
                size="sm"
              />
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} pt={4}>
            <Button
              colorScheme={toggles.undercabinetLighting ? "blue" : "gray"}
              onClick={() => handleToggleClick("undercabinetLighting")}
            >
              Undercabinet Lighting
            </Button>
            <Button
              colorScheme={toggles.newMeter ? "blue" : "gray"}
              onClick={() => handleToggleClick("newMeter")}
            >
              New Meter
            </Button>
            <Button
              colorScheme={toggles.hvacHookup ? "blue" : "gray"}
              onClick={() => handleToggleClick("hvacHookup")}
            >
              HVAC Hook up
            </Button>
            <Button
              colorScheme={toggles.installOnly ? "blue" : "gray"}
              onClick={() => handleToggleClick("installOnly")}
            >
              Install Only
            </Button>
          </SimpleGrid>
          <Flex justify="space-between" align="center" pt={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Misc
            </Text>
            <Input
              w="120px"
              type="number"
              placeholder="$0"
              value={miscCost}
              onChange={(e) => setMiscCost(e.target.value)}
              textAlign="right"
            />
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ElectricalSection;
