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
} from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

interface ElectricalDetails {
  decoraSwitches: { count: string | number };
  ledLights: { count: string | number };
  exhaustFan: {
    totalCount: string | number;
    lightCount: string | number;
    vtrCount: string | number;
  };
  lightInstallation: { count: string | number };
  newFan: { cost: number; checked: boolean };
  outletRelocate: { count: string | number };
  outletRoughIn: { count: string | number };
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomElectricalSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<ElectricalDetails>(
    initialData?.electricalDetails || {
      decoraSwitches: { count: "" },
      ledLights: { count: "" },
      exhaustFan: { totalCount: "", lightCount: "", vtrCount: "" },
      lightInstallation: { count: "" },
      newFan: { cost: 350, checked: false },
      outletRelocate: { count: "" },
      outletRoughIn: { count: "" },
    }
  );

  const totalCost = useMemo(() => {
    let cost = 0;
    cost += (Number(details.decoraSwitches.count) || 0) * 15;
    cost += (Number(details.ledLights.count) || 0) * 150;
    cost += (Number(details.exhaustFan.totalCount) || 0) * 350;
    cost += (Number(details.exhaustFan.lightCount) || 0) * 100;
    cost += (Number(details.exhaustFan.vtrCount) || 0) * 500;
    cost += (Number(details.lightInstallation.count) || 0) * 100;
    if (details.newFan.checked) cost += details.newFan.cost;
    cost += (Number(details.outletRelocate.count) || 0) * 350;
    cost += (Number(details.outletRoughIn.count) || 0) * 400;
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

  const handleToggle = (field: "newFan", subField: "checked") => {
    const currentVal = details[field];
    setDetails((prev) => ({
      ...prev,
      [field]: { ...currentVal, [subField]: !currentVal[subField] },
    }));
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
              Exhaust Fans
            </ChakraText>
            <CustomNumberInput
              label="Fan Install"
              subtext="$350/each"
              value={details.exhaustFan.totalCount}
              onChange={(e) =>
                handleNestedInputChange(
                  "exhaustFan",
                  "totalCount",
                  e.target.value
                )
              }
            />
            <CustomNumberInput
              label="w/ Light"
              subtext="+$100/each"
              value={details.exhaustFan.lightCount}
              onChange={(e) =>
                handleNestedInputChange(
                  "exhaustFan",
                  "lightCount",
                  e.target.value
                )
              }
            />
            <CustomNumberInput
              label="w/ VTR"
              subtext="+$500/each"
              value={details.exhaustFan.vtrCount}
              onChange={(e) =>
                handleNestedInputChange(
                  "exhaustFan",
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
        <Box p={4} bg="gray.100" borderRadius="md">
          <Checkbox
            isChecked={details.newFan.checked}
            onChange={() => handleToggle("newFan", "checked")}
          >
            New Fan Install (${details.newFan.cost})
          </Checkbox>
          {details.newFan.checked && (
            <Slider
              mt={2}
              aria-label="new-fan-slider"
              value={details.newFan.cost}
              onChange={(val) => handleNestedInputChange("newFan", "cost", val)}
              min={350}
              max={650}
              step={25}
              colorScheme="blue"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          )}
        </Box>
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
      </VStack>
    </Box>
  );
};
