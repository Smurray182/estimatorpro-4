import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Text,
  Icon,
  HStack,
  IconButton,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const mainScopeOptions = [
  { id: "masterBath", label: "Master Bath", cost: 3200 },
  { id: "guestBath", label: "Guest Bath", cost: 1900 },
  { id: "kitchen", label: "Kitchen", cost: 1000 },
];

const additionalOptions = [
  { id: "vanitySink", label: "Vanity Sink", cost: 250 },
  { id: "kitchenSink", label: "Kitchen Sink", cost: 350 },
  { id: "toiletInstall", label: "Toilet Install", cost: 175 },
  { id: "floorMountedTubFiller", label: "Floor Mounted Tub Filler", cost: 400 },
  { id: "fridgeLine", label: "Fridge Line", cost: 200 },
  { id: "dishWasher", label: "Dish Washer", cost: 150 },
  { id: "washingMachine", label: "Washing Machine", cost: 400 },
];

interface AddonState {
  id: string;
  quantity: number;
}

const parseMainScopes = (desc: string | undefined): string[] => {
  if (!desc) return [];
  return mainScopeOptions
    .filter((opt) => desc.includes(opt.label))
    .map((opt) => opt.id);
};

const parseGuestBathQuantity = (desc: string | undefined): number => {
  if (!desc) return 1;
  const match = desc.match(/- Guest Bath \(x(\d+)\)/);
  return match ? parseInt(match[1], 10) : 1;
};

const parseAddons = (desc: string | undefined): AddonState[] => {
  if (!desc) return [];
  const addons: AddonState[] = [];
  additionalOptions.forEach((opt) => {
    const regex = new RegExp(`- ${opt.label} \\(x(\\d+)\\)`);
    const match = desc.match(regex);
    if (match) {
      addons.push({ id: opt.id, quantity: parseInt(match[1], 10) });
    }
  });
  return addons;
};

const PlumbingSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "plumbing"
      ),
    [estimateData, remodelType]
  );

  const [activeMainScopes, setActiveMainScopes] = useState<string[]>(() =>
    parseMainScopes(existingItem?.description)
  );
  const [guestBathQuantity, setGuestBathQuantity] = useState<number>(() =>
    parseGuestBathQuantity(existingItem?.description)
  );
  const [activeAddons, setActiveAddons] = useState<AddonState[]>(() =>
    parseAddons(existingItem?.description)
  );

  useEffect(() => {
    const mainCost = mainScopeOptions
      .filter((opt) => activeMainScopes.includes(opt.id))
      .reduce((sum, opt) => {
        if (opt.id === "guestBath") {
          return sum + opt.cost * guestBathQuantity;
        }
        return sum + opt.cost;
      }, 0);

    const addonsCost = activeAddons.reduce((sum, addon) => {
      const option = additionalOptions.find((opt) => opt.id === addon.id);
      return sum + (option?.cost || 0) * addon.quantity;
    }, 0);

    const totalCost = mainCost + addonsCost;

    const buildDescription = () => {
      const parts: string[] = ["Plumbing services as per scope."];
      mainScopeOptions
        .filter((opt) => activeMainScopes.includes(opt.id))
        .forEach((opt) => {
          if (opt.id === "guestBath") {
            parts.push(`- ${opt.label} (x${guestBathQuantity})`);
          } else {
            parts.push(`- ${opt.label}`);
          }
        });
      activeAddons.forEach((addon) => {
        const option = additionalOptions.find((o) => o.id === addon.id);
        if (option) {
          parts.push(`- ${option.label} (x${addon.quantity})`);
        }
      });
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "plumbing",
        title: "PLUMBING",
        category: "REMODEL",
        costCode: "R - Plumbing",
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
            (item) => item.id !== "plumbing"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "plumbing"
          ),
        }));
      }
    }
  }, [
    activeMainScopes,
    guestBathQuantity,
    activeAddons,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const handleMainScopeClick = (optionId: string) => {
    setActiveMainScopes((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleGuestBathQuantityChange = (amount: number) => {
    setGuestBathQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddonQuantityChange = (addonId: string, amount: number) => {
    setActiveAddons((prev) => {
      const existing = prev.find((a) => a.id === addonId);
      if (existing) {
        const newQuantity = Math.max(0, existing.quantity + amount);
        if (newQuantity === 0) {
          return prev.filter((a) => a.id !== addonId);
        }
        return prev.map((a) =>
          a.id === addonId ? { ...a, quantity: newQuantity } : a
        );
      } else if (amount > 0) {
        return [...prev, { id: addonId, quantity: 1 }];
      }
      return prev;
    });
  };

  return (
    <>
      <VStack w="full" spacing={6} align="stretch">
        <Heading as="h3" size="lg" textAlign="center">
          Plumbing
        </Heading>
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="2px"
          borderColor={
            activeMainScopes.length > 0 || activeAddons.length > 0
              ? "blue.500"
              : "white"
          }
          transition="border-color 0.2s"
        >
          <VStack spacing={4} align="stretch">
            {mainScopeOptions.map((option) => (
              <Flex key={option.id} direction="column">
                <Button
                  colorScheme={
                    activeMainScopes.includes(option.id) ? "blue" : "gray"
                  }
                  onClick={() => handleMainScopeClick(option.id)}
                  size="lg"
                  w="full"
                >
                  {option.label}
                </Button>
                {option.id === "guestBath" &&
                  activeMainScopes.includes("guestBath") && (
                    <HStack
                      justify="center"
                      bg="gray.100"
                      p={2}
                      borderRadius="md"
                      mt={2}
                    >
                      <Text fontWeight="semibold">Quantity:</Text>
                      <IconButton
                        aria-label="Decrease"
                        icon={<Minus size="16px" />}
                        size="sm"
                        onClick={() => handleGuestBathQuantityChange(-1)}
                      />
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        w="40px"
                        textAlign="center"
                      >
                        {guestBathQuantity}
                      </Text>
                      <IconButton
                        aria-label="Increase"
                        icon={<Plus size="16px" />}
                        size="sm"
                        onClick={() => handleGuestBathQuantityChange(1)}
                      />
                    </HStack>
                  )}
              </Flex>
            ))}
            <Button
              rightIcon={<ChevronDown />}
              w="full"
              size="lg"
              colorScheme="gray"
              onClick={onOpen}
            >
              Additional Items (
              {activeAddons.reduce((sum, a) => sum + a.quantity, 0)})
            </Button>
          </VStack>
        </Box>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Additional Plumbing Items</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {additionalOptions.map((option) => {
                const currentQuantity =
                  activeAddons.find((a) => a.id === option.id)?.quantity || 0;
                return (
                  <Flex
                    key={option.id}
                    justify="space-between"
                    align="center"
                    w="full"
                    p={2}
                    bg={currentQuantity > 0 ? "blue.50" : "gray.50"}
                    borderRadius="md"
                  >
                    <Text fontWeight="medium">{option.label}</Text>
                    <HStack>
                      <IconButton
                        aria-label="Decrease"
                        icon={<Minus size="16px" />}
                        size="sm"
                        onClick={() => handleAddonQuantityChange(option.id, -1)}
                        isDisabled={currentQuantity === 0}
                      />
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        w="40px"
                        textAlign="center"
                      >
                        {currentQuantity}
                      </Text>
                      <IconButton
                        aria-label="Increase"
                        icon={<Plus size="16px" />}
                        size="sm"
                        onClick={() => handleAddonQuantityChange(option.id, 1)}
                      />
                    </HStack>
                  </Flex>
                );
              })}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlumbingSection;
