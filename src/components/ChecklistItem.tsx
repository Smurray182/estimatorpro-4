import React from "react";
import { Checkbox } from "@chakra-ui/react";

interface ChecklistItemProps {
  label: string;
  isChecked: boolean;
  onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  label,
  isChecked,
  onCheckboxChange,
}) => {
  return (
    <Checkbox
      isChecked={isChecked}
      onChange={onCheckboxChange}
      bg="gray.100"
      p={2}
      borderRadius="md"
      w="100%"
    >
      {label}
    </Checkbox>
  );
};
