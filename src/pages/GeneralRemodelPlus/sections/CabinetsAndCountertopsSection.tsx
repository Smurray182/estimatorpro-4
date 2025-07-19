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
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<EstimateState, 'savedRooms' | 'activeRoom' | 'savedNotes'>;
}

// --- Parser Functions ---
const parseCabinetLfItems = (desc: string | undefined): number[] => {
    if (!desc) return [];
    const items: number[] = [];
    const regex = /-\s*Cabinet Section:\s*(\d+\.?\d*)\s*LF/g;
    const matches = Array.from(desc.matchAll(regex));
    for (const match of matches) {
        items.push(parseFloat(match[1]));
    }
    return items;
};
const parseVanityCount = (desc: string | undefined): number => {
    if (!desc) return 0;
    const match = desc.match(/-\s*Economy Vanity\s*\(x(\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
};
const parseCountertopItems = (desc: string | undefined): number[] => {
    if (!desc) return [];
    const items: number[] = [];
    const regex = /-\s*Countertop Area:\s*(\d+\.?\d*)\s*SF/g;
    const matches = Array.from(desc.matchAll(regex));
    for (const match of matches) {
        items.push(parseFloat(match[1]));
    }
    return items;
};

// --- Sub-components with fixes ---
const CabinetsSubPage: React.FC<PageProps & { existingItem: EstimateItem | undefined }> = ({
  setEstimateData,
  existingItem,
  remodelType,
}) => {
  const toast = useToast();
  const [linearFeet, setLinearFeet] = useState("");

  const [cabinetLfItems, setCabinetLfItems] = useState<number[]>(() => parseCabinetLfItems(existingItem?.description));
  const [vanityCount, setVanityCount] = useState<number>(() => parseVanityCount(existingItem?.description));

  useEffect(() => {
    const lfCost = cabinetLfItems.reduce((sum, lf) => sum + lf * 800, 0);
    const vanityCost = vanityCount * 3200;
    const totalCost = lfCost + vanityCost;

    const buildDescription = () => {
        const parts = ["- Cabinets -"];
        if(cabinetLfItems.length > 0) parts.push(...cabinetLfItems.map(lf => `- Cabinet Section: ${lf} LF`));
        if(vanityCount > 0) parts.push(`- Economy Vanity (x${vanityCount})`);
        return parts.join('\n');
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "cabinets", title: "CABINETS", category: "REMODEL", costCode: "C - Cabinets",
        unitCost: totalCost, quantity: 1, markup: 70, margin: 41.18, description,
      };

      if (newItem.description !== existingItem?.description || newItem.unitCost !== existingItem?.unitCost) {
        setEstimateData((prev) => {
            const currentItems = (Array.isArray(prev[remodelType]) ? prev[remodelType] : []) as EstimateItem[];
            const otherItems = currentItems.filter((item) => item.id !== "cabinets");
            return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({...prev, [remodelType]: (prev[remodelType] as EstimateItem[]).filter((item) => item.id !== "cabinets")}));
      }
    }
  }, [cabinetLfItems, vanityCount, existingItem, setEstimateData, remodelType]);

  const handleAddLf = () => {
    const lf = parseFloat(linearFeet);
    if (!lf || lf <= 0) {
      toast({ title: "Invalid Linear Feet", status: "warning", duration: 2000 });
      return;
    }
    setCabinetLfItems((prev) => [...prev, lf]);
    setLinearFeet("");
  };

  const handleDeleteLf = (index: number) => {
    setCabinetLfItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVanityChange = (amount: number) => {
    setVanityCount((prev) => Math.max(0, prev + amount));
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" textAlign="center">Cabinets</Heading>
      <HStack>
        <Input type="number" placeholder="Linear Feet" value={linearFeet} onChange={(e) => setLinearFeet(e.target.value)} />
        <IconButton aria-label="Add Linear Feet" icon={<Icon as={Plus} />} colorScheme="green" onClick={handleAddLf}/>
      </HStack>
      {cabinetLfItems.map((lf, index) => (
        <Flex key={index} justify="space-between" align="center" bg="gray.50" p={2} borderRadius="md">
          <Text>Cabinet Section: {lf} LF</Text>
          <IconButton aria-label="Delete" icon={<Icon as={Trash2} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteLf(index)}/>
        </Flex>
      ))}
      <Divider />
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">Economy Vanity</Text>
        <HStack>
          <IconButton aria-label="Decrease" icon={<Minus />} onClick={() => handleVanityChange(-1)} isRound/>
          <Text fontSize="2xl" w="60px" textAlign="center">{vanityCount}</Text>
          <IconButton aria-label="Increase" icon={<Plus />} onClick={() => handleVanityChange(1)} isRound/>
        </HStack>
      </Flex>
    </VStack>
  );
};

const CountertopsSubPage: React.FC<PageProps & { existingItem: EstimateItem | undefined }> = ({
  setEstimateData,
  existingItem,
  remodelType,
}) => {
  const [sqft, setSqft] = useState("");
  const toast = useToast();
  
  const [countertopItems, setCountertopItems] = useState<number[]>(() => parseCountertopItems(existingItem?.description));

  useEffect(() => {
    const totalSqFt = countertopItems.reduce((sum, item) => sum + item, 0);
    const totalCost = totalSqFt * 120;

    if (totalCost > 0) {
      const description = "- Countertops -\n" + countertopItems.map(sf => `- Countertop Area: ${sf} SF`).join('\n');
      const newItem: EstimateItem = {
        id: "countertops", title: "COUNTERTOPS", category: "REMODEL", costCode: "C - Countertops",
        unitCost: totalCost, quantity: 1, markup: 70, margin: 41.18, description,
      };

      if (newItem.description !== existingItem?.description || newItem.unitCost !== existingItem?.unitCost) {
        setEstimateData((prev) => {
            const currentItems = (Array.isArray(prev[remodelType]) ? prev[remodelType] : []) as EstimateItem[];
            const otherItems = currentItems.filter((item) => item.id !== "countertops");
            return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
        if (existingItem) {
            setEstimateData((prev) => ({ ...prev, [remodelType]: (prev[remodelType] as EstimateItem[]).filter((item) => item.id !== "countertops") }));
        }
    }
  }, [countertopItems, existingItem, setEstimateData, remodelType]);

  const handleAddSqFt = () => {
    const val = parseFloat(sqft);
    if (!val || val <= 0) {
      toast({ title: "Invalid Square Footage", status: "warning", duration: 2000 });
      return;
    }
    setCountertopItems((prev) => [...prev, val]);
    setSqft("");
  };

  const handleDeleteSqFt = (index: number) => {
    setCountertopItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md" textAlign="center">Countertops</Heading>
      <HStack>
        <Input type="number" placeholder="Square Feet" value={sqft} onChange={(e) => setSqft(e.target.value)} />
        <IconButton aria-label="Add" icon={<Icon as={Plus} />} colorScheme="green" onClick={handleAddSqFt} />
      </HStack>
      {countertopItems.map((sf, index) => (
        <Flex key={index} justify="space-between" align="center" bg="gray.50" p={2} borderRadius="md">
          <Text>Countertop Area: {sf} SF</Text>
          <IconButton aria-label="Delete" icon={<Icon as={Trash2} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteSqFt(index)} />
        </Flex>
      ))}
    </VStack>
  );
};


const CabinetsAndCountertopsSection: React.FC<PageProps> = (props) => {
  const { estimateData, remodelType } = props;
  const [activeSubPage, setActiveSubPage] = useState<"cabinets" | "countertops" | null>(null);
  
  const remodelItems = useMemo(() => (estimateData[remodelType] as EstimateItem[]) || [], [estimateData, remodelType]);
  const cabinetsItem = useMemo(() => remodelItems.find(item => item.id === 'cabinets'), [remodelItems]);
  const countertopsItem = useMemo(() => remodelItems.find(item => item.id === 'countertops'), [remodelItems]);

  const isSectionActive = !!cabinetsItem || !!countertopsItem;

  if (activeSubPage) {
    return (
      <VStack w="full" spacing={6} align="stretch">
        <Flex w="full" justify="start">
          <Button onClick={() => setActiveSubPage(null)} leftIcon={<Icon as={ArrowLeft} />}>
            Back to Categories
          </Button>
        </Flex>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          {activeSubPage === "cabinets" && <CabinetsSubPage {...props} existingItem={cabinetsItem} />}
          {activeSubPage === "countertops" && <CountertopsSubPage {...props} existingItem={countertopsItem} />}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Cabinets & Countertops
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md" borderWidth="2px"
        borderColor={isSectionActive ? "blue.500" : "white"}
        transition="border-color 0.2s"
      >
        <HStack spacing={4}>
          <Button size="lg" h="100px" flex="1" onClick={() => setActiveSubPage("cabinets")}>
            Cabinets
          </Button>
          <Button size="lg" h="100px" flex="1" onClick={() => setActiveSubPage("countertops")}>
            Countertops
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
};

export default CabinetsAndCountertopsSection;