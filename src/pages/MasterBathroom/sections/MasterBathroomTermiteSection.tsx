import React, { useState, useMemo, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";

interface TermiteDetails {
  termiteSelected: boolean;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomTermiteSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<TermiteDetails>(
    initialData?.termiteDetails || { termiteSelected: false }
  );
  const totalCost = useMemo(
    () => (details.termiteSelected ? 150 : 0),
    [details]
  );

  useEffect(() => {
    onUpdate({ termiteSelected: details.termiteSelected }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <CustomToggleButton
        label="Termite Treatment"
        cost={150}
        isSelected={details.termiteSelected}
        onClick={() =>
          setDetails((prev) => ({
            ...prev,
            termiteSelected: !prev.termiteSelected,
          }))
        }
      />
    </Box>
  );
};
