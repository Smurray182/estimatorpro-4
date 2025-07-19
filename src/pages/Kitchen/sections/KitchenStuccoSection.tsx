import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface StuccoDetails {
  windowQty: string | number;
  stuccoAmount: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenStuccoSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<StuccoDetails>(
    initialData?.stuccoDetails || {
      windowQty: "",
      stuccoAmount: "",
    }
  );

  const totalCost = useMemo(() => {
    const windowCost = (Number(details.windowQty) || 0) * 250;
    const stuccoCost = Number(details.stuccoAmount) || 0;
    return windowCost + stuccoCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ stuccoDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleInputChange = (field: keyof StuccoDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Windows"
          unit="qty"
          subtext="$250/each"
          value={details.windowQty}
          onChange={(e) => handleInputChange("windowQty", e.target.value)}
        />
        <CustomNumberInput
          label="Stucco Amount"
          unit="$"
          value={details.stuccoAmount}
          onChange={(e) => handleInputChange("stuccoAmount", e.target.value)}
        />
      </VStack>
    </Box>
  );
};
