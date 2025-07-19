import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface CabinetsDetails {
  lnft: string | number;
  economyVanity: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenCabinetsSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<CabinetsDetails>(
    initialData?.cabinetsDetails || {
      lnft: "",
      economyVanity: false,
    }
  );

  const totalCost = useMemo(() => {
    const cabinetCost = (Number(details.lnft) || 0) * 800;
    const vanityCost = details.economyVanity ? 3200 : 0;
    return cabinetCost + vanityCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ cabinetsDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Cabinets"
          unit="lnft"
          subtext="$800/lnft"
          value={details.lnft}
          onChange={(e) => setDetails((p) => ({ ...p, lnft: e.target.value }))}
        />
        <CustomToggleButton
          label="Economy Vanity"
          cost={3200}
          isSelected={details.economyVanity}
          onClick={() =>
            setDetails((p) => ({ ...p, economyVanity: !p.economyVanity }))
          }
        />
      </VStack>
    </Box>
  );
};
