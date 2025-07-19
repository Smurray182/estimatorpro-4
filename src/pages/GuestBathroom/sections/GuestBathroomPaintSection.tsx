import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface PaintDetails {
  smBath: boolean;
  lgBath: boolean;
  sqft: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomPaintSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<PaintDetails>(
    initialData?.paintDetails || {
      smBath: false,
      lgBath: false,
      sqft: "",
    }
  );

  const totalCost = useMemo(() => {
    let cost = 0;
    if (details.smBath) cost += 750;
    if (details.lgBath) cost += 950;
    cost += (Number(details.sqft) || 0) * 2.75;
    return cost;
  }, [details]);

  useEffect(() => {
    onUpdate({ paintDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleToggleClick = (field: keyof PaintDetails) => {
    setDetails((prev) => ({
      ...prev,
      [field]: !prev[field as "smBath" | "lgBath"],
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <CustomToggleButton
            label="Sm Bath"
            cost={750}
            isSelected={details.smBath}
            onClick={() => handleToggleClick("smBath")}
          />
          <CustomToggleButton
            label="Lg Bath"
            cost={950}
            isSelected={details.lgBath}
            onClick={() => handleToggleClick("lgBath")}
          />
        </HStack>
        <CustomNumberInput
          label="Custom Area"
          value={details.sqft}
          onChange={(e) => setDetails((p) => ({ ...p, sqft: e.target.value }))}
          unit="sqft"
          subtext="$2.75/sqft"
        />
      </VStack>
    </Box>
  );
};
