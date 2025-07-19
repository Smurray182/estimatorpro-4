import React, { useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, FileCheck } from "lucide-react";
// FIX: Corrected the import path from ../../App to ../App
import { EstimateState, EstimateItem } from "../App";

interface PageProps {
  estimateData: EstimateState;
  onNavigate: (page: string) => void;
}

const ReviewPage: React.FC<PageProps> = ({ estimateData, onNavigate }) => {
  // Combine all items from all categories into a single list
  const allItems = useMemo(() => {
    return [
      ...estimateData.generalRemodel,
      ...estimateData.masterBathroom,
      ...estimateData.guestBathroom,
      ...estimateData.kitchen,
    ];
  }, [estimateData]);

  // FIX: Calculate the grand total with a 65% markup
  const grandTotalWithMarkup = useMemo(() => {
    const subtotal = allItems.reduce(
      (sum, item) => sum + item.unitCost * (item.quantity || 1),
      0
    );
    return subtotal * 1.65; // Apply 65% markup
  }, [allItems]);

  return (
    <VStack w="full" p={4} spacing={6} align="stretch">
      <Flex w="full" justify="space-between" align="center">
        <Button
          onClick={() => onNavigate("home")}
          leftIcon={<Icon as={ArrowLeft} />}
        >
          Back to Home
        </Button>
        <Heading as="h3" size="lg">
          Review Estimate
        </Heading>
        <Box w="110px" /> {/* Spacer */}
      </Flex>

      <VStack
        spacing={4}
        p={8}
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        align="stretch"
      >
        <HStack w="full" justify="center" spacing={4} pb={4}>
          <Icon as={FileCheck} boxSize={10} color="blue.500" />
          <Heading size="lg">Estimate Summary</Heading>
        </HStack>

        {allItems.length > 0 ? (
          <VStack divider={<Divider />} spacing={4} w="full">
            {allItems.map((item) => (
              <Box key={`${item.id}-${item.title}`} w="full">
                <Heading size="md" mb={2}>
                  {item.title}
                </Heading>
                <Text
                  whiteSpace="pre-wrap"
                  fontFamily="monospace"
                  fontSize="sm"
                  color="gray.600"
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                >
                  {item.description}
                </Text>
                {/* FIX: Removed the individual cost display */}
              </Box>
            ))}
          </VStack>
        ) : (
          <Text color="gray.500" fontStyle="italic">
            There are no items in the estimate yet.
          </Text>
        )}

        <Divider my={6} />

        <Flex w="full" justify="flex-end" align="center">
          <Heading size="xl">Grand Total:</Heading>
          {/* FIX: Display the grand total with markup */}
          <Heading size="xl" color="blue.600" ml={4}>
            ${grandTotalWithMarkup.toFixed(2)}
          </Heading>
        </Flex>
      </VStack>
    </VStack>
  );
};

export default ReviewPage;
