import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack, Button, SimpleGrid } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface FloorTileInstallDetails {
  type: "tile" | "lvp" | "carpet" | "engineered";
  tile: { [key: string]: string | number };
  lvp: { [key: string]: string | number };
  carpet: { sqft: string | number };
  engineered: { [key: string]: string | number };
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenFloorTileInstallSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<FloorTileInstallDetails>(
    initialData?.floorTileInstallDetails || {
      type: "tile",
      tile: { floor: "", backsplash: "" },
      lvp: { sqft: "", t_mold_qty: "", end_mold_qty: "" },
      carpet: { sqft: "" },
      engineered: { sqft: "", t_mold_qty: "", end_mold_qty: "" },
    }
  );

  const totalCost = useMemo(() => {
    let cost = 0;
    const { type, tile, lvp, carpet, engineered } = details;
    switch (type) {
      case "tile":
        cost += (Number(tile.floor) || 0) * 5;
        cost += (Number(tile.backsplash) || 0) * 15;
        break;
      case "lvp":
        cost += (Number(lvp.sqft) || 0) * 3;
        cost += (Number(lvp.t_mold_qty) || 0) * 45;
        cost += (Number(lvp.end_mold_qty) || 0) * 45;
        break;
      case "carpet":
        cost += ((Number(carpet.sqft) || 0) / 9) * 8;
        break;
      case "engineered":
        cost += (Number(engineered.sqft) || 0) * 7;
        cost += (Number(engineered.t_mold_qty) || 0) * 45;
        cost += (Number(engineered.end_mold_qty) || 0) * 45;
        break;
    }
    return cost;
  }, [details]);

  useEffect(() => {
    onUpdate({ floorTileInstallDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleTypeChange = (type: FloorTileInstallDetails["type"]) => {
    setDetails((prev) => ({ ...prev, type }));
  };

  const handleInputChange = (subField: string, value: string) => {
    const currentType = details.type;
    setDetails((prev) => ({
      ...prev,
      [currentType]: { ...(prev[currentType] as object), [subField]: value },
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
          {(["tile", "lvp", "carpet", "engineered"] as const).map((type) => (
            <Button
              key={type}
              onClick={() => handleTypeChange(type)}
              size="sm"
              colorScheme={details.type === type ? "blue" : "gray"}
              textTransform="capitalize"
            >
              {type}
            </Button>
          ))}
        </SimpleGrid>

        {details.type === "tile" && (
          <VStack spacing={4} align="stretch">
            <CustomNumberInput
              label="Floor Tile"
              value={details.tile.floor}
              onChange={(e) => handleInputChange("floor", e.target.value)}
              unit="sqft"
              subtext="$5/sqft"
            />
            <CustomNumberInput
              label="Backsplash"
              value={details.tile.backsplash}
              onChange={(e) => handleInputChange("backsplash", e.target.value)}
              unit="sqft"
              subtext="$15/sqft"
            />
          </VStack>
        )}

        {(details.type === "lvp" || details.type === "engineered") && (
          <VStack spacing={4} align="stretch">
            <CustomNumberInput
              label={`${details.type.toUpperCase()} Labor`}
              value={details[details.type].sqft}
              onChange={(e) => handleInputChange("sqft", e.target.value)}
              unit="sqft"
              subtext={details.type === "lvp" ? "$3/sqft" : "$7/sqft"}
            />
            <CustomNumberInput
              label="T-Mold"
              value={details[details.type].t_mold_qty}
              onChange={(e) => handleInputChange("t_mold_qty", e.target.value)}
              unit="qty"
              subtext="$45/each"
            />
            <CustomNumberInput
              label="End Mold"
              value={details[details.type].end_mold_qty}
              onChange={(e) =>
                handleInputChange("end_mold_qty", e.target.value)
              }
              unit="qty"
              subtext="$45/each"
            />
          </VStack>
        )}

        {details.type === "carpet" && (
          <CustomNumberInput
            label="Carpet"
            value={details.carpet.sqft}
            onChange={(e) => handleInputChange("sqft", e.target.value)}
            unit="sqft"
            subtext="$8/sqyd"
          />
        )}
      </VStack>
    </Box>
  );
};
