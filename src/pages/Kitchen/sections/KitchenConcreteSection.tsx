import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { ConcreteDimensionInput } from "components/ConcreteDimensionInput";

interface ConcreteDetails {
  shower: boolean;
  slabWidth: string | number;
  slabLength: string | number;
  cmuLength: string | number;
  cmuHeight: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenConcreteSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<ConcreteDetails>(
    initialData?.concreteDetails || {
      shower: false,
      slabWidth: "",
      slabLength: "",
      cmuLength: "",
      cmuHeight: "",
    }
  );

  const totalCost = useMemo(() => {
    const showerCost = details.shower ? 250 : 0;
    const slabCost =
      (parseFloat(details.slabWidth as string) || 0) *
      (parseFloat(details.slabLength as string) || 0) *
      12;
    const cmuCost =
      (parseFloat(details.cmuLength as string) || 0) *
      (parseFloat(details.cmuHeight as string) || 0) *
      20;
    return showerCost + slabCost + cmuCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ concreteDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleToggleClick = (field: "shower") => {
    setDetails((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field: keyof ConcreteDetails, value: string) => {
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
      setDetails((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomToggleButton
          label="Shower"
          cost={250}
          isSelected={details.shower}
          onClick={() => handleToggleClick("shower")}
        />
        <ConcreteDimensionInput
          label="Slab"
          value1={details.slabWidth}
          onChange1={(e) => handleInputChange("slabWidth", e.target.value)}
          unit1="W (ft)"
          value2={details.slabLength}
          onChange2={(e) => handleInputChange("slabLength", e.target.value)}
          unit2="L (ft)"
        />
        <ConcreteDimensionInput
          label="CMU Wall"
          value1={details.cmuLength}
          onChange1={(e) => handleInputChange("cmuLength", e.target.value)}
          unit1="L (ft)"
          value2={details.cmuHeight}
          onChange2={(e) => handleInputChange("cmuHeight", e.target.value)}
          unit2="H (ft)"
        />
      </VStack>
    </Box>
  );
};
