import React from "react";
import { Checkbox, Flex, Input } from "@chakra-ui/react";

interface ChecklistItemWithInputProps {
  label: string;
  isChecked: boolean;
  onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  count: string | number;
  onCountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChecklistItemWithInput: React.FC<ChecklistItemWithInputProps> = ({
  label,
  isChecked,
  onCheckboxChange,
  count,
  onCountChange,
}) => {
  return (
    <Flex
      align="center"
      justify="space-between"
      bg="gray.100"
      p={2}
      borderRadius="md"
    >
      <Checkbox isChecked={isChecked} onChange={onCheckboxChange}>
        {label}
      </Checkbox>
      <Input
        type="number"
        value={count}
        onChange={onCountChange}
        isDisabled={!isChecked}
        w="80px"
        size="sm"
        textAlign="center"
      />
    </Flex>
  );
};
