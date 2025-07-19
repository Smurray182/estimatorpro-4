import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface CountertopsDetails {
  sqft: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenCountertopsSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<CountertopsDetails>(
    initialData?.countertopsDetails || {
      sqft: "",
    }
  );

  const totalCost = useMemo(() => (Number(details.sqft) || 0) * 120, [details]);

  useEffect(() => {
    onUpdate({ countertopsDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Countertops"
          unit="sqft"
          subtext="$120/sqft"
          value={details.sqft}
          onChange={(e) => setDetails({ sqft: e.target.value })}
        />
      </VStack>
    </Box>
  );
};
