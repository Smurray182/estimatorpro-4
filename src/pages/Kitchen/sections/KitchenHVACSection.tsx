import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface HVACDetails {
  relocateRegister: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenHVACSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<HVACDetails>(
    initialData?.hvacDetails || {
      relocateRegister: "",
    }
  );

  const totalCost = useMemo(() => {
    return Number(details.relocateRegister) || 0;
  }, [details]);

  useEffect(() => {
    onUpdate({ hvacDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleInputChange = (field: keyof HVACDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Relocate Register"
          unit="$"
          value={details.relocateRegister}
          onChange={(e) =>
            handleInputChange("relocateRegister", e.target.value)
          }
        />
      </VStack>
    </Box>
  );
};
