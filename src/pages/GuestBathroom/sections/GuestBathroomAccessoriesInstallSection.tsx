import React, { useState, useMemo, useEffect } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { CustomNumberInput } from 'components/CustomNumberInput';

interface AccessoriesDetails {
  laborHours: string | number;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomAccessoriesInstallSection: React.FC<SectionProps> = ({ initialData, onUpdate }) => {
  const [details, setDetails] = useState<AccessoriesDetails>(initialData?.accessoriesInstallDetails || { laborHours: '' });
  const totalCost = useMemo(() => (Number(details.laborHours) || 0) * 60, [details]);

  useEffect(() => {
    onUpdate({ accessoriesInstallDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={6} align="stretch">
        <CustomNumberInput
          label="Labor"
          value={details.laborHours}
          onChange={e => setDetails({ laborHours: e.target.value })}
          unit="hrs"
          subtext="$60/hr"
        />
      </VStack>
    </Box>
  );
};