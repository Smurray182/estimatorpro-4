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
import { KitchenPermitSection } from "./sections/KitchenPermitSection";
import { KitchenDemolitionSection } from "./sections/KitchenDemolitionSection";
import { KitchenFramingSection } from "./sections/KitchenFramingSection";
import { KitchenPlumbingSection } from "./sections/KitchenPlumbingSection";
import { KitchenConcreteSection } from "./sections/KitchenConcreteSection";
import { KitchenTermiteSection } from "./sections/KitchenTermiteSection";
import { KitchenElectricalSection } from "./sections/KitchenElectricalSection";
import { KitchenHVACSection } from "./sections/KitchenHVACSection";
import { KitchenDrywallSection } from "./sections/KitchenDrywallSection";
import { KitchenInteriorDoorsSection } from "./sections/KitchenInteriorDoorsSection";
import { KitchenExteriorDoorsSection } from "./sections/KitchenExteriorDoorsSection";
import { KitchenWindowsSection } from "./sections/KitchenWindowsSection";
import { KitchenStuccoSection } from "./sections/KitchenStuccoSection";
import { KitchenFloorTileInstallSection } from "./sections/KitchenFloorTileInstallSection";
import { KitchenCabinetsSection } from "./sections/KitchenCabinetsSection";
import { KitchenCountertopsSection } from "./sections/KitchenCountertopsSection";
import { KitchenPlumbingFixturesSection } from "./sections/KitchenPlumbingFixturesSection";

interface PageProps {
  onNavigate: (page: string) => void;
  estimateData: { kitchen: any };
  setEstimateData: React.Dispatch<React.SetStateAction<any>>;
}

const sectionList = [
  { name: "Permit", key: "permit", Component: KitchenPermitSection },
  {
    name: "Demolition",
    key: "demolition",
    Component: KitchenDemolitionSection,
  },
  { name: "Framing", key: "framing", Component: KitchenFramingSection },
  { name: "Plumbing", key: "plumbing", Component: KitchenPlumbingSection },
  { name: "Concrete", key: "concrete", Component: KitchenConcreteSection },
  { name: "Termite", key: "termite", Component: KitchenTermiteSection },
  {
    name: "Electrical",
    key: "electrical",
    Component: KitchenElectricalSection,
  },
  { name: "HVAC", key: "hvac", Component: KitchenHVACSection },
  { name: "Drywall", key: "drywall", Component: KitchenDrywallSection },
  {
    name: "Interior Doors",
    key: "interiorDoors",
    Component: KitchenInteriorDoorsSection,
  },
  {
    name: "Exterior Doors",
    key: "exteriorDoors",
    Component: KitchenExteriorDoorsSection,
  },
  { name: "Windows", key: "windows", Component: KitchenWindowsSection },
  { name: "Stucco", key: "stucco", Component: KitchenStuccoSection },
  {
    name: "Floor/Tile Install",
    key: "floorTileInstall",
    Component: KitchenFloorTileInstallSection,
  },
  { name: "Cabinets", key: "cabinets", Component: KitchenCabinetsSection },
  {
    name: "Countertops",
    key: "countertops",
    Component: KitchenCountertopsSection,
  },
  {
    name: "Plumbing Fixtures",
    key: "plumbingFixtures",
    Component: KitchenPlumbingFixturesSection,
  },
];

const KitchenPage: React.FC<PageProps> = ({
  onNavigate,
  estimateData,
  setEstimateData,
}) => {
  const [sectionCosts, setSectionCosts] = useState<{ [key: string]: number }>(
    () => {
      const initialCosts: { [key: string]: number } = {};
      sectionList.forEach((section) => {
        const costKey = `${section.key}Cost`;
        initialCosts[section.key] = estimateData.kitchen[costKey] || 0;
      });
      return initialCosts;
    }
  );

  const handleSectionUpdate = useCallback(
    (sectionKey: string, data: object, totalCost: number) => {
      const costKey = `${sectionKey}Cost`;
      setEstimateData((prev: any) => ({
        ...prev,
        kitchen: { ...prev.kitchen, ...data, [costKey]: totalCost },
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
            Kitchen
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
                  initialData={estimateData.kitchen}
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

export default KitchenPage;
