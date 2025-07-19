import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface FramingDetails {
  wallsSqft: string | number;
  framerHrs: string | number;
  niche: boolean;
  bench: boolean;
  curb: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenFramingSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<FramingDetails>(
    initialData?.framingDetails || {
      wallsSqft: "",
      framerHrs: "",
      niche: false,
      bench: false,
      curb: false,
    }
  );

  const totalCost = useMemo(() => {
    const wallsCost = (parseFloat(details.wallsSqft as string) || 0) * 12;
    const framerCost = (parseFloat(details.framerHrs as string) || 0) * 60;
    const nicheCost = details.niche ? 250 : 0;
    const benchCost = details.bench ? 250 : 0;
    const curbCost = details.curb ? 150 : 0;
    return wallsCost + framerCost + nicheCost + benchCost + curbCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ framingDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleInputChange = (field: keyof FramingDetails, value: string) => {
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setDetails((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleToggleClick = (field: "niche" | "bench" | "curb") => {
    setDetails((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Walls"
          unit="sqft"
          subtext="$12/sqft"
          value={details.wallsSqft}
          onChange={(e) => handleInputChange("wallsSqft", e.target.value)}
        />
        <CustomNumberInput
          label="Framer"
          unit="hrs"
          subtext="$60/hr"
          value={details.framerHrs}
          onChange={(e) => handleInputChange("framerHrs", e.target.value)}
        />
        <HStack>
          <CustomToggleButton
            label="Niche"
            cost={250}
            isSelected={details.niche}
            onClick={() => handleToggleClick("niche")}
          />
          <CustomToggleButton
            label="Bench"
            cost={250}
            isSelected={details.bench}
            onClick={() => handleToggleClick("bench")}
          />
          <CustomToggleButton
            label="Curb"
            cost={150}
            isSelected={details.curb}
            onClick={() => handleToggleClick("curb")}
          />
        </HStack>
      </VStack>
    </Box>
  );
};
