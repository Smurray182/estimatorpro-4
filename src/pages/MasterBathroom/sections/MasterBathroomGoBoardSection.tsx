import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface GoBoardDetails {
  sm_sh: boolean;
  lg_sh: boolean;
  laborSqft: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomGoBoardSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<GoBoardDetails>(
    initialData?.goBoardDetails || {
      sm_sh: false,
      lg_sh: false,
      laborSqft: "",
    }
  );

  const totalCost = useMemo(() => {
    const smCost = details.sm_sh ? 600 : 0;
    const lgCost = details.lg_sh ? 800 : 0;
    const laborCost = (parseFloat(details.laborSqft as string) || 0) * 9;
    return smCost + lgCost + laborCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ goBoardDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleToggleClick = (field: "sm_sh" | "lg_sh") => {
    setDetails((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <CustomToggleButton
            label="Sm SH"
            cost={600}
            isSelected={details.sm_sh}
            onClick={() => handleToggleClick("sm_sh")}
          />
          <CustomToggleButton
            label="Lg SH"
            cost={800}
            isSelected={details.lg_sh}
            onClick={() => handleToggleClick("lg_sh")}
          />
        </HStack>
        <CustomNumberInput
          label="Labor"
          unit="sqft"
          subtext="$9/sqft"
          value={details.laborSqft}
          onChange={(e) =>
            setDetails((p) => ({ ...p, laborSqft: e.target.value }))
          }
        />
      </VStack>
    </Box>
  );
};
