import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  FormControl,
  Checkbox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text as ChakraText,
  Divider,
} from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface ElectricalDetails {
  decoraSwitches: { count: string | number };
  ledLights: { count: string | number };
  exhaustHood: { totalCount: string | number; vtrCount: string | number };
  lightInstallation: { count: string | number };
  newFan: { cost: number; checked: boolean };
  outletRelocate: { count: string | number };
  outletRoughIn: { count: string | number };
  underCabinetLighting: { lnft: string | number };
  upgradePanel: { checked: boolean };
  miscCost: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenElectricalSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<ElectricalDetails>(
    initialData?.electricalDetails || {
      decoraSwitches: { count: "" },
      ledLights: { count: "" },
      exhaustHood: { totalCount: "", vtrCount: "" },
      lightInstallation: { count: "" },
      newFan: { cost: 350, checked: false },
      outletRelocate: { count: "" },
      outletRoughIn: { count: "" },
      underCabinetLighting: { lnft: "" },
      upgradePanel: { checked: false },
      miscCost: "",
    }
  );

  const totalCost = useMemo(() => {
    let cost = 0;
    cost += (Number(details.decoraSwitches.count) || 0) * 15;
    cost += (Number(details.ledLights.count) || 0) * 150;
    cost += (Number(details.exhaustHood.totalCount) || 0) * 350;
    cost += (Number(details.exhaustHood.vtrCount) || 0) * 500;
    cost += (Number(details.lightInstallation.count) || 0) * 100;
    if (details.newFan.checked) cost += details.newFan.cost;
    cost += (Number(details.outletRelocate.count) || 0) * 350;
    cost += (Number(details.outletRoughIn.count) || 0) * 400;
    cost += (Number(details.underCabinetLighting.lnft) || 0) * 125;
    if (details.upgradePanel.checked) cost += 1800;
    cost += Number(details.miscCost) || 0;
    return cost;
  }, [details]);

  useEffect(() => {
    onUpdate({ electricalDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleNestedInputChange = (
    field: keyof ElectricalDetails,
    subField: string,
    value: string | number
  ) => {
    setDetails((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as object), [subField]: value },
    }));
  };

  const handleToggle = (
    field: keyof ElectricalDetails,
    subField: "checked"
  ) => {
    const currentVal = details[field] as { checked: boolean };
    setDetails((prev) => ({
      ...prev,
      [field]: { ...currentVal, [subField]: !currentVal[subField] },
    }));
  };

  const handleSimpleInputChange = (
    field: keyof ElectricalDetails,
    value: string | number
  ) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Decora Switches"
          subtext="$15/each"
          value={details.decoraSwitches.count}
          onChange={(e) =>
            handleNestedInputChange("decoraSwitches", "count", e.target.value)
          }
        />
        <CustomNumberInput
          label="LED Lights"
          subtext="$150/each"
          value={details.ledLights.count}
          onChange={(e) =>
            handleNestedInputChange("ledLights", "count", e.target.value)
          }
        />
        <Box p={4} bg="gray.100" borderRadius="md">
          <VStack spacing={4}>
            <ChakraText fontWeight="bold" alignSelf="flex-start">
              Exhaust Hood
            </ChakraText>
            <CustomNumberInput
              label="Hood Install"
              subtext="$350/each"
              value={details.exhaustHood.totalCount}
              onChange={(e) =>
                handleNestedInputChange(
                  "exhaustHood",
                  "totalCount",
                  e.target.value
                )
              }
            />
            <CustomNumberInput
              label="w/ VTR"
              subtext="+$500/each"
              value={details.exhaustHood.vtrCount}
              onChange={(e) =>
                handleNestedInputChange(
                  "exhaustHood",
                  "vtrCount",
                  e.target.value
                )
              }
            />
          </VStack>
        </Box>
        <CustomNumberInput
          label="Light Installation"
          subtext="$100/each"
          value={details.lightInstallation.count}
          onChange={(e) =>
            handleNestedInputChange(
              "lightInstallation",
              "count",
              e.target.value
            )
          }
        />
        <CustomNumberInput
          label="Outlet Relocate"
          subtext="$350/each"
          value={details.outletRelocate.count}
          onChange={(e) =>
            handleNestedInputChange("outletRelocate", "count", e.target.value)
          }
        />
        <CustomNumberInput
          label="Outlet Rough-in"
          subtext="$400/each"
          value={details.outletRoughIn.count}
          onChange={(e) =>
            handleNestedInputChange("outletRoughIn", "count", e.target.value)
          }
        />
        <CustomNumberInput
          label="Under Cabinet"
          subtext="$125/lnft"
          value={details.underCabinetLighting.lnft}
          onChange={(e) =>
            handleNestedInputChange(
              "underCabinetLighting",
              "lnft",
              e.target.value
            )
          }
          unit="lnft"
        />
        <Checkbox
          isChecked={details.upgradePanel.checked}
          onChange={() => handleToggle("upgradePanel", "checked")}
        >
          Upgrade Main Panel 150A/200A ($1800)
        </Checkbox>
        <Divider />
        <CustomNumberInput
          label="Misc. Cost"
          value={details.miscCost}
          onChange={(e) => handleSimpleInputChange("miscCost", e.target.value)}
          unit="$"
        />
      </VStack>
    </Box>
  );
};
