import React from "react";
import { Button } from "@chakra-ui/react";

interface CustomToggleButtonProps {
  label: string;
  cost?: number | null;
  isSelected: boolean;
  onClick: () => void;
}

export const CustomToggleButton: React.FC<CustomToggleButtonProps> = ({
  label,
  cost,
  isSelected,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      colorScheme={isSelected ? "blue" : "gray"}
      variant={isSelected ? "solid" : "outline"}
      w="100%"
    >
      {label} {cost ? `($${cost})` : ""}
    </Button>
  );
};
