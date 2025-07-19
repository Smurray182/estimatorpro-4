import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface ShowerGlassDetails {
  bypass: boolean;
  panels: string | number;
  door: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomShowerGlassSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<ShowerGlassDetails>(
    initialData?.showerGlassDetails || {
      bypass: false,
      panels: "",
      door: false,
    }
  );

  const totalCost = useMemo(() => {
    let cost = 0;
    if (details.bypass) cost += 2800;
    cost += (Number(details.panels) || 0) * 1100;
    if (details.door) cost += 1000;
    return cost;
  }, [details]);

  useEffect(() => {
    onUpdate({ showerGlassDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <CustomToggleButton
            label="Bypass Glass"
            cost={2800}
            isSelected={details.bypass}
            onClick={() => setDetails((p) => ({ ...p, bypass: !p.bypass }))}
          />
          <CustomToggleButton
            label="Door"
            cost={1000}
            isSelected={details.door}
            onClick={() => setDetails((p) => ({ ...p, door: !p.door }))}
          />
        </HStack>
        <CustomNumberInput
          label="Panels"
          value={details.panels}
          onChange={(e) =>
            setDetails((p) => ({ ...p, panels: e.target.value }))
          }
          subtext="$1100/each"
        />
      </VStack>
    </Box>
  );
};
