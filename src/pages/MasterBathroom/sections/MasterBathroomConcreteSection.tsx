import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { ConcreteDimensionInput } from "components/ConcreteDimensionInput";

interface ConcreteDetails {
  showerPan: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomConcreteSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<ConcreteDetails>(
    initialData?.concreteDetails || { showerPan: false }
  );
  const totalCost = useMemo(() => (details.showerPan ? 250 : 0), [details]);

  useEffect(() => {
    onUpdate({ concreteDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomToggleButton
          label="Shower Pan"
          cost={250}
          isSelected={details.showerPan}
          onClick={() => setDetails((p) => ({ ...p, showerPan: !p.showerPan }))}
        />
      </VStack>
    </Box>
  );
};
