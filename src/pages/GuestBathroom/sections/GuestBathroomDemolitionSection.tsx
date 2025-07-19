import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack, Input, Flex, FormLabel } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";

interface DemolitionDetails {
  days: number | string;
  disposal: "dumpster" | "trailer" | null;
  materials: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomDemolitionSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<DemolitionDetails>(
    initialData?.demolitionDetails || {
      days: 0,
      disposal: null,
      materials: false,
    }
  );

  const totalCost = useMemo(() => {
    const daysCost = (parseFloat(details.days as string) || 0) * 8 * 80;
    const disposalCost =
      details.disposal === "dumpster"
        ? 450
        : details.disposal === "trailer"
        ? 200
        : 0;
    const materialsCost = details.materials ? 150 : 0;
    return daysCost + disposalCost + materialsCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ demolitionDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
      setDetails((prev) => ({ ...prev, days: val }));
    }
  };

  const handleDisposalClick = (type: "dumpster" | "trailer") => {
    setDetails((prev) => ({
      ...prev,
      disposal: prev.disposal === type ? null : type,
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <FormLabel m={0}>Days</FormLabel>
          <HStack maxW="150px">
            <Input
              type="number"
              step={0.5}
              value={details.days}
              onChange={handleDaysChange}
              textAlign="center"
            />
          </HStack>
        </Flex>
        <HStack>
          <CustomToggleButton
            label="Dumpster"
            cost={450}
            isSelected={details.disposal === "dumpster"}
            onClick={() => handleDisposalClick("dumpster")}
          />
          <CustomToggleButton
            label="Dump Trailer"
            cost={200}
            isSelected={details.disposal === "trailer"}
            onClick={() => handleDisposalClick("trailer")}
          />
        </HStack>
        <CustomToggleButton
          label="Materials"
          cost={150}
          isSelected={details.materials}
          onClick={() =>
            setDetails((prev) => ({ ...prev, materials: !prev.materials }))
          }
        />
      </VStack>
    </Box>
  );
};
