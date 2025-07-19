import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack, Button, Text } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface TrimDetails {
  lnft: string | number;
  laborType: "install" | "paint";
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomTrimSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<TrimDetails>(
    initialData?.trimDetails || {
      lnft: "",
      laborType: "install",
    }
  );

  const totalCost = useMemo(() => {
    const lnft = parseFloat(details.lnft as string) || 0;
    const materialCost = lnft * 1.5;
    const laborRate = details.laborType === "paint" ? 3 : 2;
    const laborCost = lnft * laborRate;
    return materialCost + laborCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ trimDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Baseboard"
          value={details.lnft}
          onChange={(e) => setDetails((p) => ({ ...p, lnft: e.target.value }))}
          unit="lnft"
          subtext="$1.50/lnft for material"
        />
        <VStack>
          <HStack w="full">
            <Button
              flex={1}
              colorScheme={details.laborType === "install" ? "blue" : "gray"}
              onClick={() =>
                setDetails((p) => ({ ...p, laborType: "install" }))
              }
            >
              Install Only
            </Button>
            <Button
              flex={1}
              colorScheme={details.laborType === "paint" ? "blue" : "gray"}
              onClick={() => setDetails((p) => ({ ...p, laborType: "paint" }))}
            >
              Install and Paint
            </Button>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Labor Rate: ${details.laborType === "paint" ? "3.00" : "2.00"}/lnft
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
