import React, { useState, useMemo, useEffect } from "react";
import { Box, VStack, SimpleGrid } from "@chakra-ui/react";
import { CustomNumberInput } from "components/CustomNumberInput";

const fixtureList = [
  { key: "showerHead", label: "Shower Head", price: 200 },
  { key: "showerValve", label: "Shower Valve + Rough-in", price: 200 },
  { key: "floFxDrain", label: "FloFx Drain", price: 200 },
  { key: "vanityFaucets", label: "Vanity Faucets", price: 200 },
  { key: "tubFiller", label: "Tub Filler", price: 100 },
  { key: "tub", label: "Tub", price: 600 },
  { key: "towelBar", label: "Towel bar", price: 100 },
  { key: "towelRing", label: "Towel ring", price: 100 },
  { key: "toilet", label: "Toilet", price: 600 },
  { key: "tpHolder", label: "TP Holder", price: 100 },
  { key: "mirror", label: "Mirror", price: 200 },
  { key: "vanityLight", label: "Vanity light", price: 200 },
  { key: "handShower", label: "Hand Shower", price: 100 },
];

interface FixtureDetails {
  [key: string]: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const MasterBathroomPlumbingFixturesSection: React.FC<SectionProps> = ({
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
