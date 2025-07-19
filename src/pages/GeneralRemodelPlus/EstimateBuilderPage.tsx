import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Flex,
  SimpleGrid,
  Icon,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Trash2,
  Construction,
  Paintbrush,
  Plug,
  Pipette,
  Hammer,
  DoorOpen,
  LayoutGrid,
  Layers,
  Wind,
  Waves,
  CheckSquare,
  Brush,
  Scissors,
  Library,
  PanelTop,
  DraftingCompass,
  FileText,
} from "lucide-react";
import { EstimateState, EstimateItem } from "../../App";
import PlansAndEngineeringSection from "./sections/PlansAndEngineeringSection";
import DemolitionSection from "./sections/DemolitionSection";
import FramingSection from "./sections/FramingSection";
import ConcreteSection from "./sections/ConcreteSection";
import PlumbingSection from "./sections/PlumbingSection";
import ElectricalSection from "./sections/ElectricalSection";
import HVACSection from "./sections/HVACSection";
import InsulationSection from "./sections/InsulationSection";
import GoBoardSection from "./sections/GoBoardSection";
import DrywallSection from "./sections/DrywallSection";
import TrimSection from "./sections/TrimSection";
import DoorsSection from "./sections/DoorsSection";
import WindowsSection from "./sections/WindowsSection";
import StuccoSection from "./sections/StuccoSection";
import FlooringSection from "./sections/FlooringSection";
import CabinetsAndCountertopsSection from "./sections/CabinetsAndCountertopsSection";
import PaintingSection from "./sections/PaintingSection";

// FIX: The PageProps interface now correctly defines the props for this component.
interface PageProps {
  onNavigate: (page: string) => void;
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
  title: string;
}

const categories = [
  {
    name: "Permit Fee",
    icon: FileText,
    type: "toggle",
    dataKey: "permitFee",
    item: {
      id: "permitFee",
      title: "PERMIT FEE",
      category: "REMODEL",
      costCode: "R - Permit Fee",
      unitCost: 350.0,
      quantity: 1,
      markup: 70,
      margin: 41.18,
      description: "Permit Fees and administrative costs",
    },
  },
  {
    name: "Plans & Engineering",
    icon: DraftingCompass,
    type: "navigate",
    component: PlansAndEngineeringSection,
    dataKey: "plansAndEngineering",
  },
  {
    name: "Demolition",
    icon: Trash2,
    type: "navigate",
    component: DemolitionSection,
    dataKey: "demolition",
  },
  {
    name: "Framing",
    icon: Construction,
    type: "navigate",
    component: FramingSection,
    dataKey: "framing",
  },
  {
    name: "Concrete",
    icon: Layers,
    type: "navigate",
    component: ConcreteSection,
    dataKey: "concrete",
  },
  {
    name: "Plumbing",
    icon: Pipette,
    type: "navigate",
    component: PlumbingSection,
    dataKey: "plumbing",
  },
  {
    name: "Electrical",
    icon: Plug,
    type: "navigate",
    component: ElectricalSection,
    dataKey: "electrical",
  },
  {
    name: "HVAC",
    icon: Wind,
    type: "navigate",
    component: HVACSection,
    dataKey: "hvac",
  },
  {
    name: "Insulation",
    icon: Waves,
    type: "navigate",
    component: InsulationSection,
    dataKey: "insulation",
  },
  {
    name: "GoBoard",
    icon: CheckSquare,
    type: "navigate",
    component: GoBoardSection,
    dataKey: "goBoard",
  },
  {
    name: "Drywall",
    icon: Hammer,
    type: "navigate",
    component: DrywallSection,
    dataKey: "drywall",
  },
  {
    name: "Trim",
    icon: Scissors,
    type: "navigate",
    component: TrimSection,
    dataKey: "trim",
  },
  {
    name: "Doors",
    icon: DoorOpen,
    type: "navigate",
    component: DoorsSection,
    dataKey: "doors",
  },
  {
    name: "Windows",
    icon: PanelTop,
    type: "navigate",
    component: WindowsSection,
    dataKey: "windows",
  },
  {
    name: "Stucco",
    icon: Brush,
    type: "navigate",
    component: StuccoSection,
    dataKey: "stucco",
  },
  {
    name: "Floor/Tile Install",
    icon: LayoutGrid,
    type: "navigate",
    component: FlooringSection,
    dataKey: "flooring",
  },
  {
    name: "Cabinets & Countertops",
    icon: Library,
    type: "navigate",
    component: CabinetsAndCountertopsSection,
    dataKey: "cabinets",
  },
  {
    name: "Painting",
    icon: Paintbrush,
    type: "navigate",
    component: PaintingSection,
    dataKey: "painting",
  },
];

const CategoryButton: React.FC<{
  name: string;
  icon: React.ElementType;
  onClick: () => void;
  isActive: boolean;
  subtitle?: string;
}> = ({ name, icon, onClick, isActive, subtitle }) => (
  <VStack
    as="button"
    onClick={onClick}
    spacing={2}
    p={6}
    bg={isActive ? "blue.500" : "white"}
    color={isActive ? "white" : "inherit"}
    borderRadius="xl"
    boxShadow="md"
    transition="all 0.2s"
    _hover={{
      transform: "translateY(-4px)",
      boxShadow: "lg",
      bg: isActive ? "blue.600" : "gray.50",
    }}
  >
    <Icon as={icon} boxSize={10} color={isActive ? "white" : "blue.500"} />
    <VStack spacing={0}>
      <Text fontSize="lg" fontWeight="semibold" textAlign="center">
        {name}
      </Text>
      {isActive && subtitle && (
        <Text fontSize="xs" fontWeight="bold">
          {subtitle}
        </Text>
      )}
    </VStack>
  </VStack>
);

const EstimateBuilderPage: React.FC<PageProps> = (props) => {
  const { estimateData, setEstimateData, remodelType, title } = props;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const toast = useToast();

  const sectionTotal = useMemo(() => {
    const items = estimateData[remodelType] as EstimateItem[];
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (sum, item) => sum + item.unitCost * (item.quantity || 1),
      0
    );
  }, [estimateData, remodelType]);

  const handleSelectCategory = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    if (category && !category.component) {
      toast({
        title: "Coming Soon!",
        description: "This section has not been built yet.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setSelectedCategory(categoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const isCategoryActive = (dataKey: string) => {
    const items = estimateData[remodelType] as EstimateItem[];
    if (!Array.isArray(items)) return false;

    if (dataKey === "doors") {
      return items.some(
        (item) => item.id === "interiorDoors" || item.id === "exteriorDoors"
      );
    }
    if (dataKey === "cabinets") {
      return items.some(
        (item) => item.id === "cabinets" || item.id === "countertops"
      );
    }
    return items.some((item) => item.id === dataKey);
  };

  const handleToggleItem = (item: EstimateItem) => {
    const currentItems = (
      Array.isArray(estimateData[remodelType]) ? estimateData[remodelType] : []
    ) as EstimateItem[];
    const itemExists = currentItems.some((i) => i.id === item.id);
    let newItems: EstimateItem[];

    const itemWithDynamicTitle = {
      ...item,
      title: `${item.title} - ${title.toUpperCase()}`,
    };

    if (itemExists) {
      newItems = currentItems.filter((i) => i.id !== item.id);
    } else {
      newItems = [...currentItems, itemWithDynamicTitle];
    }

    // FIX: This correctly uses the remodelType prop to update the right slice of state.
    setEstimateData((prev) => ({
      ...prev,
      [remodelType]: newItems,
    }));
  };

  const renderContent = () => {
    if (selectedCategory) {
      const category = categories.find((c) => c.name === selectedCategory);
      if (category && category.component) {
        const SectionComponent = category.component;
        // FIX: All props, including remodelType, are passed down to the section component.
        // The section components must be updated to USE this prop.
        return (
          <VStack w="full" spacing={6}>
            <Flex w="full" justify="start">
              <Button
                onClick={handleBackToCategories}
                leftIcon={<Icon as={ArrowLeft} />}
                variant="ghost"
              >
                Back to Categories
              </Button>
            </Flex>
            <SectionComponent {...props} />
          </VStack>
        );
      }
      return (
        <VStack>
          <Text>This section is not yet available.</Text>
          <Button onClick={handleBackToCategories}>Back</Button>
        </VStack>
      );
    }

    return (
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6} w="full">
        {categories.map((category) => {
          const isActive = isCategoryActive(category.dataKey);
          const onClick =
            category.type === "toggle"
              ? () => handleToggleItem(category.item!)
              : () => handleSelectCategory(category.name);

          return (
            <CategoryButton
              key={category.name}
              name={category.name}
              icon={category.icon}
              isActive={isActive}
              onClick={onClick}
              subtitle={
                category.type === "toggle" && isActive ? "Included" : undefined
              }
            />
          );
        })}
      </SimpleGrid>
    );
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <VStack spacing={8} maxW="container.lg" mx="auto">
        <Flex w="full" justify="space-between" align="center">
          <Button
            onClick={() => props.onNavigate("home")}
            variant="ghost"
            colorScheme="gray"
            leftIcon={<ArrowLeft />}
          >
            Home
          </Button>
          <Heading as="h1" size="xl">
            {title}
          </Heading>
          <Box w="80px" /> {/* Spacer */}
        </Flex>
        {renderContent()}

        {!selectedCategory && (
          <VStack pt={8} spacing={1}>
            <Text fontSize="md" color="gray.500" fontWeight="semibold">
              Total Cost
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="gray.700">
              ${sectionTotal.toFixed(2)}
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default EstimateBuilderPage;
