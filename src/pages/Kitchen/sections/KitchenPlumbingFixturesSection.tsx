import React, { useState, useMemo, useEffect } from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

const fixtureList = [
  { key: "kitchenFaucet", label: "Kitchen Faucet", price: 250 },
  { key: "garbageDisposal", label: "Garbage Disposal", price: 200 },
  { key: "dishwasher", label: "Dishwasher Install", price: 175 },
  { key: "iceMaker", label: "Ice Maker Line", price: 150 },
  { key: "potFiller", label: "Pot Filler", price: 450 },
];

interface FixtureDetails {
  [key: string]: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const KitchenPlumbingFixturesSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<FixtureDetails>(
    initialData?.plumbingFixturesDetails || {}
  );

  const totalCost = useMemo(() => {
    return fixtureList.reduce((sum, item) => {
      const quantity = Number(details[item.key]) || 0;
      return sum + quantity * item.price;
    }, 0);
  }, [details]);

  useEffect(() => {
    onUpdate({ plumbingFixturesDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  const handleInputChange = (field: string, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box pt={2}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={8} spacingY={4}>
        {fixtureList.map((fixture) => (
          <CustomNumberInput
            key={fixture.key}
            label={fixture.label}
            value={details[fixture.key] || ""}
            onChange={(e) => handleInputChange(fixture.key, e.target.value)}
            subtext={`$${fixture.price}/each`}
            unit="qty"
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};
