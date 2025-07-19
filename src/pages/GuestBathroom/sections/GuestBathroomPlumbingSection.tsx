import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  SimpleGrid,
  Checkbox,
  Input,
  Flex,
} from "@chakra-ui/react";
import { CustomToggleButton } from "components/CustomToggleButton";

interface PlumbingDetails {
  toggles: { guest: boolean };
  checklist: { [key: string]: boolean };
  vanitySinkCount: number | string;
}

interface SectionProps {
  initialData: any;
  onUpdate: (data: object, totalCost: number) => void;
}

export const GuestBathroomPlumbingSection: React.FC<SectionProps> = ({
  initialData,
  onUpdate,
}) => {
  const [details, setDetails] = useState<PlumbingDetails>(
    initialData?.plumbingDetails || {
      toggles: { guest: false },
      checklist: {
        vanitySink: false,
        toiletInstall: false,
        tubFiller: false,
        showerSystem: false,
      },
      vanitySinkCount: 0,
    }
  );

  const totalCost = useMemo(() => {
    let c = 0;
    if (details.toggles.guest) c += 1900;
    if (details.checklist.vanitySink)
      c += (Number(details.vanitySinkCount) || 0) * 150;
    if (details.checklist.toiletInstall) c += 125;
    if (details.checklist.tubFiller) c += 450;
    if (details.checklist.showerSystem) c += 600;
    return c;
  }, [details]);

  useEffect(() => {
    onUpdate({ plumbingDetails: details }, totalCost);
  }, [totalCost, details, onUpdate]);

  return (
    <Box pt={2}>
      <VStack spacing={4} align="stretch">
        <CustomToggleButton
          label="Guest Bath Rough-in"
          cost={1900}
          isSelected={details.toggles.guest}
          onClick={() =>
            setDetails((p) => ({
              ...p,
              toggles: { ...p.toggles, guest: !p.toggles.guest },
            }))
          }
        />
        <Text fontWeight="bold" pt={2}>
          Installation Checklist
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Flex
            align="center"
            justify="space-between"
            bg="gray.100"
            p={2}
            borderRadius="md"
          >
            <Checkbox
              isChecked={details.checklist.vanitySink}
              onChange={(e) =>
                setDetails((p) => ({
                  ...p,
                  checklist: { ...p.checklist, vanitySink: e.target.checked },
                }))
              }
            >
              Vanity Sink/s ($150/ea)
            </Checkbox>
            <Input
              type="number"
              value={details.vanitySinkCount}
              onChange={(e) =>
                setDetails((p) => ({ ...p, vanitySinkCount: e.target.value }))
              }
              isDisabled={!details.checklist.vanitySink}
              w="80px"
              size="sm"
            />
          </Flex>
          <Checkbox
            isChecked={details.checklist.toiletInstall}
            onChange={(e) =>
              setDetails((p) => ({
                ...p,
                checklist: { ...p.checklist, toiletInstall: e.target.checked },
              }))
            }
            bg="gray.100"
            p={2}
            borderRadius="md"
          >
            Toilet Install ($125)
          </Checkbox>
          <Checkbox
            isChecked={details.checklist.tubFiller}
            onChange={(e) =>
              setDetails((p) => ({
                ...p,
                checklist: { ...p.checklist, tubFiller: e.target.checked },
              }))
            }
            bg="gray.100"
            p={2}
            borderRadius="md"
          >
            Tub Filler ($450)
          </Checkbox>
          <Checkbox
            isChecked={details.checklist.showerSystem}
            onChange={(e) =>
              setDetails((p) => ({
                ...p,
                checklist: { ...p.checklist, showerSystem: e.target.checked },
              }))
            }
            bg="gray.100"
            p={2}
            borderRadius="md"
          >
            Shower System ($600)
          </Checkbox>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
