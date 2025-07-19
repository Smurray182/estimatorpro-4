import React, { useState, useMemo, useCallback } from "react";
import {
  Container,
  Heading,
  Text as ChakraText,
  Box,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
// Import all the new section components
import { GuestBathroomAccessoriesInstallSection } from "./sections/GuestBathroomAccessoriesInstallSection";
import { GuestBathroomConcreteSection } from "./sections/GuestBathroomConcreteSection";
import { GuestBathroomDemolitionSection } from "./sections/GuestBathroomDemolitionSection";
import { GuestBathroomDrywallSection } from "./sections/GuestBathroomDrywallSection";
import { GuestBathroomElectricalSection } from "./sections/GuestBathroomElectricalSection";
import { GuestBathroomFloorTileInstallSection } from "./sections/GuestBathroomFloorTileInstallSection";
import { GuestBathroomFramingSection } from "./sections/GuestBathroomFramingSection";
import { GuestBathroomGoBoardSection } from "./sections/GuestBathroomGoBoardSection";
import { GuestBathroomInteriorDoorsSection } from "./sections/GuestBathroomInteriorDoorsSection";
import { GuestBathroomPaintSection } from "./sections/GuestBathroomPaintSection";
import { GuestBathroomPermitSection } from "./sections/GuestBathroomPermitSection";
import { GuestBathroomPlumbingFixturesSection } from "./sections/GuestBathroomPlumbingFixturesSection";
import { GuestBathroomPlumbingSection } from "./sections/GuestBathroomPlumbingSection";
import { GuestBathroomShowerGlassSection } from "./sections/GuestBathroomShowerGlassSection";
import { GuestBathroomTermiteSection } from "./sections/GuestBathroomTermiteSection";
import { GuestBathroomTrimSection } from "./sections/GuestBathroomTrimSection";

interface PageProps {
  onNavigate: (page: string) => void;
  estimateData: { guestBathroom: any };
  setEstimateData: React.Dispatch<React.SetStateAction<any>>;
}

const sectionList = [
  {
    name: "Demolition",
    key: "demolition",
    Component: GuestBathroomDemolitionSection,
  },
  { name: "Permit", key: "permit", Component: GuestBathroomPermitSection },
  { name: "Framing", key: "framing", Component: GuestBathroomFramingSection },
  {
    name: "Plumbing",
    key: "plumbing",
    Component: GuestBathroomPlumbingSection,
  },
  {
    name: "Concrete",
    key: "concrete",
    Component: GuestBathroomConcreteSection,
  },
  { name: "Termite", key: "termite", Component: GuestBathroomTermiteSection },
  {
    name: "Electrical",
    key: "electrical",
    Component: GuestBathroomElectricalSection,
  },
  { name: "GoBoard", key: "goBoard", Component: GuestBathroomGoBoardSection },
  { name: "Drywall", key: "drywall", Component: GuestBathroomDrywallSection },
  { name: "Paint", key: "paint", Component: GuestBathroomPaintSection },
  {
    name: "Shower Glass",
    key: "showerGlass",
    Component: GuestBathroomShowerGlassSection,
  },
  {
    name: "Tile/Flooring Install",
    key: "floorTileInstall",
    Component: GuestBathroomFloorTileInstallSection,
  },
  { name: "Trim", key: "trim", Component: GuestBathroomTrimSection },
  {
    name: "Interior Doors",
    key: "interiorDoors",
    Component: GuestBathroomInteriorDoorsSection,
  },
  {
    name: "Plumbing Fixtures",
    key: "plumbingFixtures",
    Component: GuestBathroomPlumbingFixturesSection,
  },
  {
    name: "Accessories Install",
    key: "accessoriesInstall",
    Component: GuestBathroomAccessoriesInstallSection,
  },
];

const GuestBathroomPage: React.FC<PageProps> = ({
  onNavigate,
  estimateData,
  setEstimateData,
}) => {
  const [sectionCosts, setSectionCosts] = useState<{ [key: string]: number }>(
    () => {
      const initialCosts: { [key: string]: number } = {};
      sectionList.forEach((section) => {
        const costKey = `${section.key}Cost`;
        initialCosts[section.key] = estimateData.guestBathroom[costKey] || 0;
      });
      return initialCosts;
    }
  );

  const handleSectionUpdate = useCallback(
    (sectionKey: string, data: object, totalCost: number) => {
      const costKey = `${sectionKey}Cost`;
      setEstimateData((prev: any) => ({
        ...prev,
        guestBathroom: { ...prev.guestBathroom, ...data, [costKey]: totalCost },
      }));
      setSectionCosts((prev) => ({ ...prev, [sectionKey]: totalCost }));
    },
    [setEstimateData]
  );

  const totalEstimate = useMemo(() => {
    return Object.values(sectionCosts).reduce((sum, cost) => sum + cost, 0);
  }, [sectionCosts]);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Button
            onClick={() => onNavigate("home")}
            variant="ghost"
            colorScheme="gray"
            leftIcon={<ArrowLeft size={20} />}
          >
            Home
          </Button>
          <Heading as="h1" size="lg">
            Guest Bathroom
          </Heading>
        </Flex>

        <Accordion allowMultiple>
          {sectionList.map(({ name, key, Component }) => (
            <AccordionItem key={name}>
              <h2>
                <AccordionButton
                  bg={sectionCosts[key] > 0 ? "blue.100" : "transparent"}
                  _expanded={{ bg: "blue.500", color: "white" }}
                >
                  <Box flex="1" textAlign="left" fontWeight="bold">
                    {name}
                  </Box>
                  <ChakraText fontWeight="bold" mr={4}>
                    ${sectionCosts[key]?.toLocaleString() || 0}
                  </ChakraText>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="gray.50">
                <Component
                  initialData={estimateData.guestBathroom}
                  onUpdate={(data: object, total: number) =>
                    handleSectionUpdate(key, data, total)
                  }
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <Flex
          justify="flex-end"
          align="center"
          mt={8}
          p={4}
          bg="gray.100"
          borderRadius="md"
        >
          <Heading size="md" mr={4}>
            Total Estimate:
          </Heading>
          <Heading size="lg" color="blue.600">
            $
            {totalEstimate.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Heading>
        </Flex>
      </VStack>
    </Container>
  );
};

export default GuestBathroomPage;
