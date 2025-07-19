import React, { useState, useMemo, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";

interface PermitDetails {
  permitSelected: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenPermitSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<PermitDetails>(
    initialData?.permitDetails || { permitSelected: false }
  );

  const totalCost = useMemo(
    () => (details.permitSelected ? 350 : 0),
    [details]
  );

  useEffect(() => {
    onUpdate({ permitSelected: details.permitSelected }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <CustomToggleButton
        label="Include Permit Fee"
        cost={350}
        isSelected={details.permitSelected}
        onClick={() =>
          setDetails((prev) => ({
            ...prev,
            permitSelected: !prev.permitSelected,
          }))
        }
      />
    </Box>
  );
};
