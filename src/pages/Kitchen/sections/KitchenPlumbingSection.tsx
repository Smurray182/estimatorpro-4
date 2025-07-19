import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, Checkbox, Divider, Text } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface PlumbingDetails {
  toggles: { kitchen: boolean };
  checklist: { airSwitch: boolean };
  trenching: string | number;
  roughingIn: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenPlumbingSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<PlumbingDetails>(
    initialData?.plumbingDetails || {
      toggles: { kitchen: false },
      checklist: { airSwitch: false },
      trenching: "",
      roughingIn: "",
    }
  );

  const totalCost = useMemo(() => {
    let c = 0;
    if (details.toggles.kitchen) c += 1000;
    if (details.checklist.airSwitch) c += 250;
    c += Number(details.trenching) || 0;
    c += Number(details.roughingIn) || 0;
    return c;
  }, [details]);

  useEffect(() => {
    onUpdate({ plumbingDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={4} align="stretch">
        <CustomToggleButton
          label="Kitchen Rough-in"
          cost={1000}
          isSelected={details.toggles.kitchen}
          onClick={() =>
            setDetails((p) => ({
              ...p,
              toggles: { ...p.toggles, kitchen: !p.toggles.kitchen },
            }))
          }
        />
        <Divider />
        <Checkbox
          isChecked={details.checklist.airSwitch}
          onChange={(e) =>
            setDetails((p) => ({
              ...p,
              checklist: { ...p.checklist, airSwitch: e.target.checked },
            }))
          }
        >
          Install Air Switch ($250)
        </Checkbox>
        <CustomNumberInput
          label="Misc. Trenching"
          value={details.trenching}
          onChange={(e) =>
            setDetails((p) => ({ ...p, trenching: e.target.value }))
          }
          unit="$"
        />
        <CustomNumberInput
          label="Misc. Roughing In"
          value={details.roughingIn}
          onChange={(e) =>
            setDetails((p) => ({ ...p, roughingIn: e.target.value }))
          }
          unit="$"
        />
      </VStack>
    </Box>
  );
};
