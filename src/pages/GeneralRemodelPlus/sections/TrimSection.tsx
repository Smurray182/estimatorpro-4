import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Input,
  IconButton,
  Flex,
  Divider,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

const trimProfiles = {
  baseboard: [
    {
      id: "base_151",
      name: "151 Base",
      costPerLf: 1.25,
      image: "/images/trim/151%20BASE.jpg",
    },
    {
      id: "base_366",
      name: "366 Base",
      costPerLf: 1.25,
      image: "/images/trim/366%20BASE.jpg",
    },
    {
      id: "base_688",
      name: "688 Base",
      costPerLf: 1.25,
      image: "/images/trim/688%20BASE.jpg",
    },
    {
      id: "base_4180",
      name: "4180 Base",
      costPerLf: 1.25,
      image: "/images/trim/4180%20BASE.jpg",
    },
    {
      id: "base_5180",
      name: "5180 Base",
      costPerLf: 1.25,
      image: "/images/trim/5180%20BASE.jpg",
    },
    {
      id: "base_6180",
      name: "6180 Base",
      costPerLf: 1.25,
      image: "/images/trim/6180%20BASE.jpg",
    },
    {
      id: "fbp_base",
      name: "FBP Base LDF",
      costPerLf: 1.25,
      image: "/images/trim/FBPBASELDF.jpg",
    },
    {
      id: "lwm_433",
      name: "LWM 433",
      costPerLf: 1.25,
      image: "/images/trim/LWM433.jpg",
    },
    {
      id: "msi_725",
      name: "MSI 725",
      costPerLf: 1.25,
      image: "/images/trim/MSI725.jpg",
    },
    {
      id: "vic_base",
      name: "VIC Base",
      costPerLf: 1.25,
      image: "/images/trim/VICBASE.jpg",
    },
    {
      id: "wm_618",
      name: "WM 618",
      costPerLf: 1.25,
      image: "/images/trim/WM618.jpg",
    },
    {
      id: "wm_620",
      name: "WM 620",
      costPerLf: 1.25,
      image: "/images/trim/WM620.jpg",
    },
    {
      id: "wm_623",
      name: "WM 623",
      costPerLf: 1.25,
      image: "/images/trim/WM623.jpg",
    },
    {
      id: "wm_625",
      name: "WM 625",
      costPerLf: 1.25,
      image: "/images/trim/WM625.jpg",
    },
    {
      id: "wm_713",
      name: "WM 713",
      costPerLf: 1.25,
      image: "/images/trim/WM713.jpg",
    },
  ],
  casing: [
    {
      id: "baby_howe",
      name: "Baby Howe",
      costPerLf: 1.25,
      image: "/images/casing/BABY%20HOWE.jpg",
    },
    {
      id: "beaded_fluted_m10",
      name: "Beaded Fluted M10",
      costPerLf: 1.25,
      image: "/images/casing/BEADED_FLUTED%20M10.jpg",
    },
    {
      id: "beaded_fluted",
      name: "Beaded Fluted",
      costPerLf: 1.25,
      image: "/images/casing/BEADED_FLUTED.jpg",
    },
    {
      id: "delta_howe",
      name: "Delta Howe",
      costPerLf: 1.25,
      image: "/images/casing/DELTA%20HOWE.jpg",
    },
    {
      id: "fbp_ldf_86",
      name: "FBP LDF 86",
      costPerLf: 1.25,
      image: "/images/casing/FBPLDF86CSG.jpg",
    },
    {
      id: "howe",
      name: "Howe",
      costPerLf: 1.25,
      image: "/images/casing/HOWE.jpg",
    },
    { id: "m3", name: "M3", costPerLf: 1.25, image: "/images/casing/M3.jpg" },
    {
      id: "modern",
      name: "Modern",
      costPerLf: 1.25,
      image: "/images/casing/MODERN.jpg",
    },
    {
      id: "victorian",
      name: "Victorian",
      costPerLf: 1.25,
      image: "/images/casing/VICTORIAN.jpg",
    },
    {
      id: "wm_316",
      name: "WM 316",
      costPerLf: 1.25,
      image: "/images/casing/WM316.jpg",
    },
    {
      id: "wm_326",
      name: "WM 326",
      costPerLf: 1.25,
      image: "/images/casing/WM326.jpg",
    },
    {
      id: "wm_356",
      name: "WM 356",
      costPerLf: 1.25,
      image: "/images/casing/WM356.jpg",
    },
    {
      id: "wm_366",
      name: "WM 366",
      costPerLf: 1.25,
      image: "/images/casing/WM366.jpg",
    },
    {
      id: "wm_376",
      name: "WM 376",
      costPerLf: 1.25,
      image: "/images/casing/WM376.jpg",
    },
    {
      id: "wm_455",
      name: "WM 455",
      costPerLf: 1.25,
      image: "/images/casing/WM455.jpg",
    },
    {
      id: "wm_462",
      name: "WM 462",
      costPerLf: 1.25,
      image: "/images/casing/WM462.jpg",
    },
    {
      id: "wm_473",
      name: "WM 473",
      costPerLf: 1.25,
      image: "/images/casing/WM473.jpg",
    },
  ],
  crown: [
    {
      id: "crown_45",
      name: '4 1/2" Crown',
      costPerLf: 1.25,
      image: "/images/trim/crown_45.jpg",
    },
  ],
  shelving: [
    {
      id: "shelf_12",
      name: '12" Deep Shelving',
      costPerLf: 1.25,
      image: "/images/trim/shelving_12.jpg",
    },
  ],
};

type InstallType = "installOnly" | "installAndPaint" | null;
interface TrimPiece {
  profileId: string;
  name: string;
  lf: number;
  cost: number;
  installType: InstallType;
}

const parseTrimPieces = (desc: string | undefined): TrimPiece[] => {
  if (!desc) return [];
  const pieces: TrimPiece[] = [];
  const regex = /-\s*(.*?):\s*(\d+\.?\d*)\s*LF(\s*\((.*?)\))?/g;
  const allProfiles = Object.values(trimProfiles).flat();
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    const [, name, lfStr, , installTypeStr] = match;
    const profile = allProfiles.find((p) => p.name === name.trim());
    if (profile) {
      let installType: InstallType = null;
      if (installTypeStr) {
        if (installTypeStr.includes("Install Only"))
          installType = "installOnly";
        if (installTypeStr.includes("Install & Paint"))
          installType = "installAndPaint";
      }
      let installCost = 0;
      if (installType === "installOnly") installCost = 2;
      if (installType === "installAndPaint") installCost = 3;
      const totalCostPerLf = profile.costPerLf + installCost;
      const lf = parseFloat(lfStr);
      const cost = totalCostPerLf * lf;
      pieces.push({
        profileId: profile.id,
        name: profile.name,
        lf,
        cost,
        installType,
      });
    }
  }
  return pieces;
};

const parseCasingDoors = (
  desc: string | undefined
): [number, string | null] => {
  if (!desc) return [0, null];
  const match = desc.match(/- (.*?) Casing: (\d+) doors/);
  if (match) {
    const [, name, count] = match;
    const profile = trimProfiles.casing.find((p) => p.name === name.trim());
    return [parseInt(count, 10), profile ? profile.id : null];
  }
  return [0, null];
};

const ProfileSelector: React.FC<{
  profiles: { id: string; name: string; costPerLf: number; image: string }[];
  onSelect: (
    profileId: string,
    linearFeet: number,
    installType: InstallType
  ) => void;
  isBaseboard: boolean;
}> = ({ profiles, onSelect, isBaseboard }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [linearFeet, setLinearFeet] = useState("");
  const [installType, setInstallType] = useState<InstallType>(null);
  const handleAdd = () => {
    if (selectedProfileId && linearFeet) {
      onSelect(selectedProfileId, parseFloat(linearFeet), installType);
      setLinearFeet("");
    }
  };
  return (
    <VStack spacing={6} w="full">
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} w="full">
        {profiles.map((profile) => (
          <Box
            key={profile.id}
            as="button"
            p={0}
            borderRadius="md"
            borderWidth="3px"
            borderColor={
              selectedProfileId === profile.id ? "blue.500" : "transparent"
            }
            onClick={() => setSelectedProfileId(profile.id)}
            overflow="hidden"
            w="150px"
            h="150px"
            transition="all 0.2s"
            _hover={{ transform: "scale(1.05)" }}
          >
            <Image
              src={profile.image}
              alt={profile.name}
              w="100%"
              h="100%"
              objectFit="cover"
              fallbackSrc="https://placehold.co/150x150?text=Image"
            />
          </Box>
        ))}
      </SimpleGrid>
      {isBaseboard && (
        <HStack w="full" pt={4}>
          <Button
            flex="1"
            colorScheme={installType === "installOnly" ? "teal" : "gray"}
            onClick={() => setInstallType("installOnly")}
            isDisabled={!selectedProfileId}
          >
            Install Only
          </Button>
          <Button
            flex="1"
            colorScheme={installType === "installAndPaint" ? "teal" : "gray"}
            onClick={() => setInstallType("installAndPaint")}
            isDisabled={!selectedProfileId}
          >
            Install & Paint
          </Button>
        </HStack>
      )}
      <HStack w="full" pt={4}>
        <Input
          type="number"
          placeholder="Linear Feet"
          value={linearFeet}
          onChange={(e) => setLinearFeet(e.target.value)}
          isDisabled={!selectedProfileId || (isBaseboard && !installType)}
        />
        <IconButton
          aria-label="Add linear feet"
          icon={<Icon as={Plus} />}
          colorScheme="green"
          onClick={handleAdd}
          isDisabled={
            !selectedProfileId || !linearFeet || (isBaseboard && !installType)
          }
        />
      </HStack>
    </VStack>
  );
};

const TrimSection: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  remodelType,
}) => {
  const [activeSubPage, setActiveSubPage] = useState<
    keyof typeof trimProfiles | null
  >(null);
  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "trim"
      ),
    [estimateData, remodelType]
  );

  const [trimPieces, setTrimPieces] = useState<TrimPiece[]>(() =>
    parseTrimPieces(existingItem?.description)
  );
  const [casingInfo, setCasingInfo] = useState<{
    count: number;
    profileId: string | null;
  }>(() => {
    const [count, profileId] = parseCasingDoors(existingItem?.description);
    return { count, profileId };
  });

  useEffect(() => {
    const trimCost = trimPieces.reduce((sum, piece) => sum + piece.cost, 0);
    const casingCost = casingInfo.count * 125;
    const totalCost = trimCost + casingCost;

    const buildDescription = () => {
      const parts = ["- Trim Out -"];
      if (trimPieces.length > 0) {
        const trimDescriptions = trimPieces.map((p) => {
          let installDesc = "";
          if (p.installType === "installOnly") installDesc = " (Install Only)";
          else if (p.installType === "installAndPaint")
            installDesc = " (Install & Paint)";
          return `- ${p.name}: ${p.lf} LF${installDesc}`;
        });
        parts.push(...trimDescriptions);
      }
      if (casingInfo.count > 0 && casingInfo.profileId) {
        const profile = trimProfiles.casing.find(
          (p) => p.id === casingInfo.profileId
        );
        if (profile)
          parts.push(`- ${profile.name} Casing: ${casingInfo.count} doors`);
      }
      return parts.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "trim",
        title: "Trim Out",
        category: "REMODEL",
        costCode: "R - Baseboards/Crown/Trim DOES NOT INCLUDE CABINET CROWN",
        unitCost: totalCost,
        quantity: 1,
        markup: 70,
        margin: 41.18,
        description,
      };
      if (
        newItem.description !== existingItem?.description ||
        newItem.unitCost !== existingItem?.unitCost
      ) {
        setEstimateData((prev) => {
          const currentItems = (
            Array.isArray(prev[remodelType]) ? prev[remodelType] : []
          ) as EstimateItem[];
          const otherItems = currentItems.filter((item) => item.id !== "trim");
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "trim"
          ),
        }));
      }
    }
  }, [trimPieces, casingInfo, existingItem, setEstimateData, remodelType]);

  const handleAddTrimPiece = (
    profileId: string,
    linearFeet: number,
    installType: InstallType
  ) => {
    const allProfiles = Object.values(trimProfiles).flat();
    const profile = allProfiles.find((p) => p.id === profileId);
    if (profile) {
      let installCost = 0;
      if (installType === "installOnly") installCost = 2;
      if (installType === "installAndPaint") installCost = 3;
      const totalCostPerLf = profile.costPerLf + installCost;
      const cost = totalCostPerLf * linearFeet;
      setTrimPieces((prev) => [
        ...prev,
        {
          profileId: profile.id,
          name: profile.name,
          lf: linearFeet,
          cost,
          installType,
        },
      ]);
    }
  };

  const handleDeleteTrimPiece = (index: number) => {
    setTrimPieces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCasingDoorChange = (amount: number) => {
    setCasingInfo((prev) => ({
      ...prev,
      count: Math.max(0, prev.count + amount),
    }));
  };

  const renderSubPage = () => {
    if (!activeSubPage) return null;
    const currentCategoryPieces = trimPieces.filter((p) => {
      const profile = Object.values(trimProfiles)
        .flat()
        .find((profile) => profile.id === p.profileId);
      const category = Object.keys(trimProfiles).find((key) =>
        trimProfiles[key as keyof typeof trimProfiles].some(
          (pr) => pr.id === profile?.id
        )
      );
      return category === activeSubPage;
    });
    if (activeSubPage === "casing") {
      return (
        <VStack spacing={6}>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} w="full">
            {trimProfiles.casing.map((profile) => (
              <Box
                key={profile.id}
                as="button"
                p={0}
                borderRadius="md"
                borderWidth="3px"
                borderColor={
                  casingInfo.profileId === profile.id
                    ? "blue.500"
                    : "transparent"
                }
                onClick={() =>
                  setCasingInfo((prev) => ({ ...prev, profileId: profile.id }))
                }
                overflow="hidden"
                w="150px"
                h="150px"
                transition="all 0.2s"
                _hover={{ transform: "scale(1.05)" }}
              >
                <Image
                  src={profile.image}
                  alt={profile.name}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  fallbackSrc="https://placehold.co/150x150?text=Image"
                />
              </Box>
            ))}
          </SimpleGrid>
          <Flex justify="space-between" align="center" w="full" pt={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Number of Doors
            </Text>
            <HStack>
              <IconButton
                aria-label="Decrease doors"
                icon={<Minus />}
                onClick={() => handleCasingDoorChange(-1)}
                isRound
                isDisabled={!casingInfo.profileId}
              />
              <Text
                fontSize="2xl"
                fontWeight="bold"
                w="60px"
                textAlign="center"
              >
                {casingInfo.count}
              </Text>
              <IconButton
                aria-label="Increase doors"
                icon={<Plus />}
                onClick={() => handleCasingDoorChange(1)}
                isRound
                isDisabled={!casingInfo.profileId}
              />
            </HStack>
          </Flex>
        </VStack>
      );
    }
    return (
      <VStack spacing={4}>
        <ProfileSelector
          profiles={trimProfiles[activeSubPage]}
          onSelect={handleAddTrimPiece}
          isBaseboard={activeSubPage === "baseboard"}
        />
        {currentCategoryPieces.length > 0 && (
          <VStack spacing={3} align="stretch" pt={4} w="full">
            <Divider />
            <Heading size="sm" pt={2}>
              Added {activeSubPage}
            </Heading>
            {currentCategoryPieces.map((piece, index) => (
              <Flex
                key={index}
                justify="space-between"
                align="center"
                bg="gray.50"
                p={2}
                borderRadius="md"
              >
                <Text>
                  {piece.name}: {piece.lf} LF{" "}
                  {piece.installType &&
                    `(${
                      piece.installType === "installOnly"
                        ? "Install Only"
                        : "Install & Paint"
                    })`}
                </Text>
                <IconButton
                  aria-label="Delete trim piece"
                  icon={<Icon as={Trash2} />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDeleteTrimPiece(index)}
                />
              </Flex>
            ))}
          </VStack>
        )}
      </VStack>
    );
  };

  if (activeSubPage) {
    return (
      <VStack w="full" spacing={6} align="stretch">
        <Flex w="full" justify="start">
          <Button
            onClick={() => setActiveSubPage(null)}
            leftIcon={<Icon as={ArrowLeft} />}
          >
            Back to Trim Categories
          </Button>
        </Flex>
        <Heading
          as="h3"
          size="lg"
          textAlign="center"
          textTransform="capitalize"
        >
          {activeSubPage}
        </Heading>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          {renderSubPage()}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack w="full" spacing={6} align="stretch">
      <Heading as="h3" size="lg" textAlign="center">
        Trim
      </Heading>
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <VStack spacing={4}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Button
              size="lg"
              h="100px"
              onClick={() => setActiveSubPage("baseboard")}
            >
              Baseboard
            </Button>
            <Button
              size="lg"
              h="100px"
              onClick={() => setActiveSubPage("casing")}
            >
              Casing
            </Button>
            <Button
              size="lg"
              h="100px"
              onClick={() => setActiveSubPage("crown")}
            >
              Crown
            </Button>
            <Button
              size="lg"
              h="100px"
              onClick={() => setActiveSubPage("shelving")}
            >
              Shelving
            </Button>
          </SimpleGrid>
          {(trimPieces.length > 0 || casingInfo.count > 0) && (
            <VStack spacing={3} align="stretch" pt={6} w="full">
              <Divider />
              <Heading size="md" pt={2} textAlign="center">
                Current Trim Selections
              </Heading>
              {trimPieces.map((piece, index) => (
                <Flex
                  key={index}
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    {piece.name}: {piece.lf} LF{" "}
                    {piece.installType &&
                      `(${
                        piece.installType === "installOnly"
                          ? "Install Only"
                          : "Install & Paint"
                      })`}
                  </Text>
                  <IconButton
                    aria-label="Delete trim piece"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteTrimPiece(index)}
                  />
                </Flex>
              ))}
              {casingInfo.count > 0 && casingInfo.profileId && (
                <Flex
                  justify="space-between"
                  align="center"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    {
                      trimProfiles.casing.find(
                        (p) => p.id === casingInfo.profileId
                      )?.name
                    }{" "}
                    Casing: {casingInfo.count} doors
                  </Text>
                  <IconButton
                    aria-label="Delete casing selection"
                    icon={<Icon as={Trash2} />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => setCasingInfo({ count: 0, profileId: null })}
                  />
                </Flex>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default TrimSection;
