import React, { useState, useMemo, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
// Import all the sections for the Master Bathroom
import { MasterBathroomDemolitionSection } from './sections/MasterBathroomDemolitionSection';
import { MasterBathroomPermitSection } from './sections/MasterBathroomPermitSection';
import { MasterBathroomFramingSection } from './sections/MasterBathroomFramingSection';
import { MasterBathroomPlumbingSection } from './sections/MasterBathroomPlumbingSection';
import { MasterBathroomConcreteSection } from './sections/MasterBathroomConcreteSection';
import { MasterBathroomTermiteSection } from './sections/MasterBathroomTermiteSection';
import { MasterBathroomElectricalSection } from './sections/MasterBathroomElectricalSection';
import { MasterBathroomGoBoardSection } from './sections/MasterBathroomGoBoardSection';
import { MasterBathroomDrywallSection } from './sections/MasterBathroomDrywallSection';
import { MasterBathroomPaintSection } from './sections/MasterBathroomPaintSection';
import { MasterBathroomShowerGlassSection } from './sections/MasterBathroomShowerGlassSection';
import { MasterBathroomFloorTileInstallSection } from './sections/MasterBathroomFloorTileInstallSection';
import { MasterBathroomTrimSection } from './sections/MasterBathroomTrimSection';
import { MasterBathroomInteriorDoorsSection } from './sections/MasterBathroomInteriorDoorsSection';
import { MasterBathroomPlumbingFixturesSection } from './sections/MasterBathroomPlumbingFixturesSection';
import { MasterBathroomAccessoriesInstallSection } from './sections/MasterBathroomAccessoriesInstallSection';

interface PageProps {
  onNavigate: (page: string) => void;
  estimateData: { masterBathroom: any };
  setEstimateData: React.Dispatch<React.SetStateAction<any>>;
}

const sectionList = [
    { name: 'Demolition', Component: MasterBathroomDemolitionSection },
    { name: 'Permit', Component: MasterBathroomPermitSection },
    { name: 'Framing', Component: MasterBathroomFramingSection },
    { name: 'Plumbing', Component: MasterBathroomPlumbingSection },
    { name: 'Concrete', Component: MasterBathroomConcreteSection },
    { name: 'Termite', Component: MasterBathroomTermiteSection },
    { name: 'Electrical', Component: MasterBathroomElectricalSection },
    { name: 'GoBoard', Component: MasterBathroomGoBoardSection },
    { name: 'Drywall', Component: MasterBathroomDrywallSection },
    { name: 'Paint', Component: MasterBathroomPaintSection },
    { name: 'Shower Glass', Component: MasterBathroomShowerGlassSection },
    { name: 'Tile/Flooring Install', Component: MasterBathroomFloorTileInstallSection },
    { name: 'Trim', Component: MasterBathroomTrimSection },
    { name: 'Interior Doors', Component: MasterBathroomInteriorDoorsSection },
    { name: 'Plumbing Fixtures', Component: MasterBathroomPlumbingFixturesSection },
    { name: 'Accessories Install', Component: MasterBathroomAccessoriesInstallSection },
];

const MasterBathroomPage: React.FC<PageProps> = ({ onNavigate, estimateData, setEstimateData }) => {
    const [sectionCosts, setSectionCosts] = useState<{ [key: string]: number }>(() => {
        const initialCosts: { [key: string]: number } = {};
        sectionList.forEach(section => {
            const costKey = `${section.name.toLowerCase().replace(/ /g, '')}Cost`;
            initialCosts[section.name] = estimateData.masterBathroom[costKey] || 0;
        });
        return initialCosts;
    });

    const handleSectionUpdate = useCallback((sectionName: string, data: object, totalCost: number) => {
        const costKey = `${sectionName.toLowerCase().replace(/ /g, '')}Cost`;
        setEstimateData((prev: any) => ({
            ...prev,
            masterBathroom: { ...prev.masterBathroom, ...data, [costKey]: totalCost },
        }));
        setSectionCosts(prev => ({...prev, [sectionName]: totalCost }));
    }, [setEstimateData]);

    const totalEstimate = useMemo(() => {
        return Object.values(sectionCosts).reduce((sum, cost) => sum + cost, 0);
    }, [sectionCosts]);

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                    <Button onClick={() => onNavigate('home')} variant="ghost" colorScheme="gray" leftIcon={<ArrowLeft size={20} />}>Home</Button>
                    <Heading as="h1" size="lg">Master Bathroom</Heading>
                </Flex>

                <Accordion allowMultiple>
                    {sectionList.map(({ name, Component }) => (
                        <AccordionItem key={name}>
                            <h2>
                                <AccordionButton bg={sectionCosts[name] > 0 ? 'blue.100' : 'transparent'} _expanded={{ bg: 'blue.500', color: 'white' }}>
                                    <Box flex="1" textAlign="left" fontWeight="bold">{name}</Box>
                                    <ChakraText fontWeight="bold" mr={4}>${sectionCosts[name]?.toLocaleString() || 0}</ChakraText>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4} bg="gray.50">
                                <Component
                                    initialData={estimateData.masterBathroom}
                                    onUpdate={(data, total) => handleSectionUpdate(name, data, total)}
                                />
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Flex justify="flex-end" align="center" mt={8} p={4} bg="gray.100" borderRadius="md">
                    <Heading size="md" mr={4}>Total Estimate:</Heading>
                    <Heading size="lg" color="blue.600">${totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Heading>
                </Flex>
            </VStack>
        </Container>
    );
};

export default MasterBathroomPage;