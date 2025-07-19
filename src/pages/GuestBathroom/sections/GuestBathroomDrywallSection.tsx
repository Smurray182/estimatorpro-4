import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { PlusCircle, X } from "lucide-react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface Dimension {
  id: number;
  l: string | number;
  h: string | number;
}
interface DrywallDetails {
  dimensions: Dimension[];
  scrapeAndTexture: { toggled: boolean; sqft: string | number };
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomDrywallSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<DrywallDetails>(
    initialData?.drywallDetails || {
      dimensions: [],
      scrapeAndTexture: { toggled: false, sqft: "" },
    }
  );

  const [currentL, setCurrentL] = useState("");
  const [currentH, setCurrentH] = useState("");

  const totalSheetSqft = useMemo(() => {
    return details.dimensions.reduce(
      (sum, dim) => sum + (Number(dim.l) || 0) * (Number(dim.h) || 0),
      0
    );
  }, [details.dimensions]);

  const totalCost = useMemo(() => {
    const sheetCost = (totalSheetSqft / 32) * 200;
    const scrapeCost = details.scrapeAndTexture.toggled
      ? (Number(details.scrapeAndTexture.sqft) || 0) * 4
      : 0;
    return sheetCost + scrapeCost;
  }, [details, totalSheetSqft]);

  useEffect(() => {
    onUpdate({ drywallDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleAddDimension = () => {
    if (parseFloat(currentL) > 0 && parseFloat(currentH) > 0) {
      setDetails((prev) => ({
        ...prev,
        dimensions: [
          ...prev.dimensions,
          { l: currentL, h: currentH, id: Date.now() },
        ],
      }));
      setCurrentL("");
      setCurrentH("");
    }
  };

  const handleRemoveDimension = (id: number) => {
    setDetails((prev) => ({
      ...prev,
      dimensions: prev.dimensions.filter((dim) => dim.id !== id),
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <VStack
          p={4}
          bg="gray.100"
          borderRadius="md"
          align="stretch"
          spacing={4}
        >
          <Text fontWeight="bold">
            Sheetrock Calculator ($200 per 4x8 sheet)
          </Text>
          <HStack>
            <Input
              type="number"
              placeholder="L (ft)"
              value={currentL}
              onChange={(e) => setCurrentL(e.target.value)}
            />
            <Text fontWeight="bold">x</Text>
            <Input
              type="number"
              placeholder="H (ft)"
              value={currentH}
              onChange={(e) => setCurrentH(e.target.value)}
            />
            <IconButton
              aria-label="Add dimension"
              icon={<PlusCircle size={24} />}
              onClick={handleAddDimension}
              colorScheme="blue"
              isDisabled={!currentL || !currentH}
            />
          </HStack>
          {details.dimensions.length > 0 && (
            <VStack align="stretch" spacing={2}>
              {details.dimensions.map((dim) => (
                <HStack
                  key={dim.id}
                  justify="space-between"
                  bg="white"
                  p={2}
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Text>
                    {dim.l} ft x {dim.h} ft ={" "}
                    <b>{(Number(dim.l) * Number(dim.h)).toFixed(2)} sqft</b>
                  </Text>
                  <IconButton
                    aria-label="Remove dimension"
                    icon={<X size={18} />}
                    onClick={() => handleRemoveDimension(dim.id)}
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                  />
                </HStack>
              ))}
              <Text align="right" fontWeight="bold" pt={2}>
                Total: {totalSheetSqft.toFixed(2)} sqft
              </Text>
            </VStack>
          )}
        </VStack>
        <VStack
          p={4}
          bg="gray.100"
          borderRadius="md"
          align="stretch"
          spacing={4}
        >
          <Text fontWeight="bold">Scrape and Texture</Text>
          <CustomToggleButton
            label="Scrape and Texture"
            isSelected={details.scrapeAndTexture.toggled}
            onClick={() =>
              setDetails((p) => ({
                ...p,
                scrapeAndTexture: {
                  ...p.scrapeAndTexture,
                  toggled: !p.scrapeAndTexture.toggled,
                },
              }))
            }
          />
          <CustomNumberInput
            label="Area"
            value={details.scrapeAndTexture.sqft}
            onChange={(e) =>
              setDetails((p) => ({
                ...p,
                scrapeAndTexture: {
                  ...p.scrapeAndTexture,
                  sqft: e.target.value,
                },
              }))
            }
            unit="sqft"
            subtext="$4/sqft"
          />
        </VStack>
      </VStack>
    </Box>
  );
};
