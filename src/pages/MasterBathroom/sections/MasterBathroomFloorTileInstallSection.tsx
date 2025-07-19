import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, HStack, Button, SimpleGrid } from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";
import { CustomNumberInput } from "components/CustomNumberInput";

interface FloorTileInstallDetails {
  type: "tile" | "lvp";
  tile: { [key: string]: string | number };
  lvp: { [key: string]: string | number };
  toggles: { [key: string]: boolean };
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomFloorTileInstallSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<FloorTileInstallDetails>(
    initialData?.floorTileInstallDetails || {
      type: "tile",
      tile: {
        floor: "",
        backsplash: "",
        wainscot: "",
        showerFloor: "",
        showerWall: "",
      },
      lvp: { sqft: "", t_mold_qty: "", end_mold_qty: "", stair_nose_qty: "" },
      toggles: { niche: false, cornerShelf: false, bench: false },
    }
  );

  // --- FIX: The total cost calculation is now updated ---
  const totalCost = useMemo(() => {
    // We will calculate the cost of each type independently and add them together.
    let tileCost = 0;
    let lvpCost = 0;
    const { tile, lvp, toggles } = details;

    // Calculate tile cost regardless of which tab is open
    tileCost += (Number(tile.floor) || 0) * 5;
    tileCost += (Number(tile.backsplash) || 0) * 15;
    tileCost += (Number(tile.wainscot) || 0) * 15;
    tileCost += (Number(tile.showerFloor) || 0) * 45;
    tileCost += (Number(tile.showerWall) || 0) * 15;
    if (toggles.niche) tileCost += 150;
    if (toggles.cornerShelf) tileCost += 50;
    if (toggles.bench) tileCost += 100;

    // Calculate LVP cost regardless of which tab is open
    lvpCost += (Number(lvp.sqft) || 0) * 3;
    lvpCost += (Number(lvp.t_mold_qty) || 0) * 45;
    lvpCost += (Number(lvp.end_mold_qty) || 0) * 45;
    lvpCost += (Number(lvp.stair_nose_qty) || 0) * 75;

    // The final total is the sum of all types
    return tileCost + lvpCost;
  }, [details]);

  useEffect(() => {
    onUpdate({ floorTileInstallDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleTypeChange = (type: "tile" | "lvp") => {
    setDetails((prev) => ({ ...prev, type }));
  };

  const handleInputChange = (subField: string, value: string) => {
    const currentType = details.type;
    setDetails((prev) => ({
      ...prev,
      [currentType]: { ...(prev[currentType] as object), [subField]: value },
    }));
  };

  const handleToggleClick = (field: string) => {
    setDetails((prev) => ({
      ...prev,
      toggles: { ...prev.toggles, [field]: !prev.toggles[field] },
    }));
  };

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <Button
            flex={1}
            onClick={() => handleTypeChange("tile")}
            colorScheme={details.type === "tile" ? "blue" : "gray"}
          >
            Tile
          </Button>
          <Button
            flex={1}
            onClick={() => handleTypeChange("lvp")}
            colorScheme={details.type === "lvp" ? "blue" : "gray"}
          >
            LVP
          </Button>
        </HStack>

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
            <CustomNumberInput
              label="Wainscot"
              value={details.tile.wainscot}
              onChange={(e) => handleInputChange("wainscot", e.target.value)}
              unit="sqft"
              subtext="$15/sqft"
            />
            <CustomNumberInput
              label="Shower Floor"
              value={details.tile.showerFloor}
              onChange={(e) => handleInputChange("showerFloor", e.target.value)}
              unit="sqft"
              subtext="$45/sqft"
            />
            <CustomNumberInput
              label="Shower Wall"
              value={details.tile.showerWall}
              onChange={(e) => handleInputChange("showerWall", e.target.value)}
              unit="sqft"
              subtext="$15/sqft"
            />
            <HStack>
              <CustomToggleButton
                label="Niche"
                cost={150}
                isSelected={details.toggles.niche}
                onClick={() => handleToggleClick("niche")}
              />
              <CustomToggleButton
                label="Corner Shelf"
                cost={50}
                isSelected={details.toggles.cornerShelf}
                onClick={() => handleToggleClick("cornerShelf")}
              />
              <CustomToggleButton
                label="Bench"
                cost={100}
                isSelected={details.toggles.bench}
                onClick={() => handleToggleClick("bench")}
              />
            </HStack>
          </VStack>
        )}

        {details.type === "lvp" && (
          <VStack spacing={4} align="stretch">
            <CustomNumberInput
              label="LVP Labor"
              value={details.lvp.sqft}
              onChange={(e) => handleInputChange("sqft", e.target.value)}
              unit="sqft"
              subtext="$3/sqft"
            />
            <CustomNumberInput
              label="T-Mold"
              value={details.lvp.t_mold_qty}
              onChange={(e) => handleInputChange("t_mold_qty", e.target.value)}
              unit="qty"
              subtext="$45/each"
            />
            <CustomNumberInput
              label="End Mold"
              value={details.lvp.end_mold_qty}
              onChange={(e) =>
                handleInputChange("end_mold_qty", e.target.value)
              }
              unit="qty"
              subtext="$45/each"
            />
            <CustomNumberInput
              label="Stair Nose"
              value={details.lvp.stair_nose_qty}
              onChange={(e) =>
                handleInputChange("stair_nose_qty", e.target.value)
              }
              unit="qty"
              subtext="$75/each"
            />
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
