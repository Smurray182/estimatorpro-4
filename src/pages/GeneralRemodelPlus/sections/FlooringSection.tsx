import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Flex,
  Icon,
  Text,
  SimpleGrid,
  HStack,
  Input,
  IconButton,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { EstimateState, EstimateItem } from "../../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  remodelType: keyof Omit<
    EstimateState,
    "savedRooms" | "activeRoom" | "savedNotes"
  >;
}

type FlooringCategory = "tile" | "lvp" | "carpet" | "hardwood";

// --- Data Structures ---
const tileAreas = [
  { id: "floorTile", name: "Floor Tile", costPerSqFt: 5 },
  { id: "showerFloor", name: "Shower Floor", costPerSqFt: 45 },
  { id: "showerWall", name: "Shower Wall", costPerSqFt: 12 },
  { id: "wainscot", name: "Wainscot", costPerSqFt: 15 },
  { id: "backsplash", name: "Backsplash", costPerSqFt: 15 },
];
const tileAddons = [
  { id: "niche", name: "Niche", cost: 150 },
  { id: "cornerShelf", name: "Corner Shelf", cost: 50 },
  { id: "bench", name: "Bench", cost: 100 },
];
interface TilePiece {
  id: string;
  areaName: string;
  sqft: number;
  cost: number;
}
interface LvpPiece {
  id: string;
  type: "sqft" | "t-mold" | "end-mold" | "stair-nose";
  value: number;
  cost: number;
}
interface CarpetPiece {
  id: string;
  sqyd: number;
  cost: number;
}

// --- Parser Functions ---
const parseTilePieces = (desc: string): TilePiece[] => {
  const pieces: TilePiece[] = [];
  const regex = /-\s*(.*?):\s*(\d+\.?\d*)\s*sq ft/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    const area = tileAreas.find((a) => a.name === match[1]);
    if (area) {
      const sqft = parseFloat(match[2]);
      pieces.push({
        id: `restored-${area.id}-${match.index}`,
        areaName: area.name,
        sqft,
        cost: sqft * area.costPerSqFt,
      });
    }
  }
  return pieces;
};
const parseTileAddons = (desc: string): string[] => {
  return tileAddons
    .filter((a) => desc.includes(`- ${a.name}`))
    .map((a) => a.id);
};
const parseLvpOrHardwood = (
  desc: string,
  type: "LVP" | "Hardwood"
): LvpPiece[] => {
  const pieces: LvpPiece[] = [];
  const regex = new RegExp(`- ${type} (.*?): (\\d+\\.?\\d*)`, "g");
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    const pieceType = match[1]
      .toLowerCase()
      .replace(" ", "-") as LvpPiece["type"];
    const value = parseFloat(match[2]);
    let costPerUnit = 0;
    if (pieceType === "sqft") costPerUnit = 6;
    if (pieceType === "t-mold" || pieceType === "end-mold") costPerUnit = 5;
    if (pieceType === "stair-nose") costPerUnit = 75;
    pieces.push({
      id: `restored-${type}-${pieceType}-${match.index}`,
      type: pieceType,
      value,
      cost: value * costPerUnit,
    });
  }
  return pieces;
};
const parseCarpet = (desc: string): CarpetPiece[] => {
  const pieces: CarpetPiece[] = [];
  const regex = /-\s*Carpet:\s*(\d+\.?\d*)\s*sq yd/g;
  const matches = Array.from(desc.matchAll(regex));
  for (const match of matches) {
    const sqyd = parseFloat(match[1]);
    pieces.push({ id: `restored-carpet-${match.index}`, sqyd, cost: sqyd * 8 });
  }
  return pieces;
};

// --- Sub-Components ---
const TileSection: React.FC<{ data: any; onUpdate: (data: any) => void }> = ({
  data,
  onUpdate,
}) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [sqft, setSqft] = useState("");
  const toast = useToast();

  const handleAddTilePiece = () => {
    if (!selectedArea || !sqft) {
      toast({
        title: "Please select an area and enter square footage.",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    const areaInfo = tileAreas.find((a) => a.id === selectedArea);
    if (!areaInfo) return;
    const newPiece: TilePiece = {
      id: new Date().toISOString(),
      areaName: areaInfo.name,
      sqft: parseFloat(sqft),
      cost: parseFloat(sqft) * areaInfo.costPerSqFt,
    };
    onUpdate({ ...data, tilePieces: [...data.tilePieces, newPiece] });
    setSqft("");
  };

  const handleDeleteTilePiece = (id: string) =>
    onUpdate({
      ...data,
      tilePieces: data.tilePieces.filter((p: TilePiece) => p.id !== id),
    });
  const handleAddonToggle = (addonId: string) =>
    onUpdate({
      ...data,
      activeAddons: data.activeAddons.includes(addonId)
        ? data.activeAddons.filter((id: string) => id !== addonId)
        : [...data.activeAddons, addonId],
    });

  return (
    <VStack spacing={6} w="full">
      <Heading size="md" textAlign="center">
        Tile Installation
      </Heading>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={2} w="full">
        {tileAreas.map((area) => (
          <Button
            key={area.id}
            colorScheme={selectedArea === area.id ? "blue" : "gray"}
            onClick={() => setSelectedArea(area.id)}
          >
            {area.name}
          </Button>
        ))}
      </SimpleGrid>
      <HStack w="full">
        <Input
          type="number"
          placeholder="Square Footage"
          value={sqft}
          onChange={(e) => setSqft(e.target.value)}
          isDisabled={!selectedArea}
        />
        <IconButton
          aria-label="Add"
          icon={<Icon as={Plus} />}
          colorScheme="green"
          onClick={handleAddTilePiece}
          isDisabled={!selectedArea || !sqft}
        />
      </HStack>
      <Divider />
      <HStack w="full" justify="space-around">
        {tileAddons.map((addon) => (
          <Button
            key={addon.id}
            colorScheme={data.activeAddons.includes(addon.id) ? "blue" : "gray"}
            onClick={() => handleAddonToggle(addon.id)}
          >
            {addon.name}
          </Button>
        ))}
      </HStack>
      {/* FIX: Added list of saved items to the sub-page */}
      {(data.tilePieces.length > 0 || data.activeAddons.length > 0) && (
        <VStack w="full" align="stretch" pt={4}>
          <Divider />
          <Heading size="sm" pt={2}>
            Added Items
          </Heading>
          {data.tilePieces.map((piece: TilePiece) => (
            <Flex
              key={piece.id}
              justify="space-between"
              align="center"
              bg="gray.50"
              p={2}
              borderRadius="md"
            >
              <Text>
                {piece.areaName}: {piece.sqft} sq ft
              </Text>
              <IconButton
                aria-label="Delete"
                icon={<Icon as={Trash2} />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDeleteTilePiece(piece.id)}
              />
            </Flex>
          ))}
          {data.activeAddons.map((id: string) => {
            const addon = tileAddons.find((a) => a.id === id);
            return (
              <Flex
                key={id}
                justify="space-between"
                align="center"
                bg="gray.50"
                p={2}
                borderRadius="md"
              >
                <Text>{addon?.name}</Text>
                <IconButton
                  aria-label="Delete"
                  icon={<Icon as={Trash2} />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleAddonToggle(id)}
                />
              </Flex>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};

const LvpHardwoodSection: React.FC<{
  type: "LVP" | "Hardwood";
  data: any;
  onUpdate: (data: any) => void;
}> = ({ type, data, onUpdate }) => {
  const [sqft, setSqft] = useState("");
  const [tMoldLf, setTMoldLf] = useState("");
  const [endMoldLf, setEndMoldLf] = useState("");
  const [stairNoseQty, setStairNoseQty] = useState("");

  const handleAdd = (
    pieceType: LvpPiece["type"],
    valueStr: string,
    costPerUnit: number
  ) => {
    const value = parseFloat(valueStr);
    if (!value || value <= 0) return;
    const newPiece: LvpPiece = {
      id: new Date().toISOString(),
      type: pieceType,
      value,
      cost: value * costPerUnit,
    };
    onUpdate({ pieces: [...data.pieces, newPiece] });
    if (pieceType === "sqft") setSqft("");
    if (pieceType === "t-mold") setTMoldLf("");
    if (pieceType === "end-mold") setEndMoldLf("");
    if (pieceType === "stair-nose") setStairNoseQty("");
  };

  const handleDelete = (id: string) =>
    onUpdate({ pieces: data.pieces.filter((p: LvpPiece) => p.id !== id) });

  return (
    <VStack spacing={6} w="full">
      <Heading size="md" textAlign="center">
        {type} Installation
      </Heading>
      <VStack spacing={4} w="full" align="stretch">
        <HStack>
          <Input
            type="number"
            placeholder="Square Footage"
            value={sqft}
            onChange={(e) => setSqft(e.target.value)}
          />
          <Button onClick={() => handleAdd("sqft", sqft, 6)}>Add</Button>
        </HStack>
        <HStack>
          <Input
            type="number"
            placeholder="T-Mold (LF)"
            value={tMoldLf}
            onChange={(e) => setTMoldLf(e.target.value)}
          />
          <Button onClick={() => handleAdd("t-mold", tMoldLf, 5)}>Add</Button>
        </HStack>
        <HStack>
          <Input
            type="number"
            placeholder="End Mold (LF)"
            value={endMoldLf}
            onChange={(e) => setEndMoldLf(e.target.value)}
          />
          <Button onClick={() => handleAdd("end-mold", endMoldLf, 5)}>
            Add
          </Button>
        </HStack>
        <HStack>
          <Input
            type="number"
            placeholder="Stair Nose (Qty)"
            value={stairNoseQty}
            onChange={(e) => setStairNoseQty(e.target.value)}
          />
          <Button onClick={() => handleAdd("stair-nose", stairNoseQty, 75)}>
            Add
          </Button>
        </HStack>
      </VStack>
      {/* FIX: Added list of saved items to the sub-page */}
      {data.pieces.length > 0 && (
        <VStack w="full" align="stretch" pt={4}>
          <Divider />
          <Heading size="sm" pt={2}>
            Added Items
          </Heading>
          {data.pieces.map((piece: LvpPiece) => (
            <Flex
              key={piece.id}
              justify="space-between"
              align="center"
              bg="gray.50"
              p={2}
              borderRadius="md"
            >
              <Text textTransform="capitalize">
                {piece.type.replace("-", " ")}: {piece.value}
              </Text>
              <IconButton
                aria-label="Delete"
                icon={<Icon as={Trash2} />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(piece.id)}
              />
            </Flex>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

const CarpetSection: React.FC<{ data: any; onUpdate: (data: any) => void }> = ({
  data,
  onUpdate,
}) => {
  const [sqyd, setSqyd] = useState("");
  const handleAdd = () => {
    const value = parseFloat(sqyd);
    if (!value || value <= 0) return;
    const newPiece: CarpetPiece = {
      id: new Date().toISOString(),
      sqyd: value,
      cost: value * 8,
    };
    onUpdate({ pieces: [...data.pieces, newPiece] });
    setSqyd("");
  };
  const handleDelete = (id: string) =>
    onUpdate({ pieces: data.pieces.filter((p: CarpetPiece) => p.id !== id) });

  return (
    <VStack spacing={6} w="full">
      <Heading size="md" textAlign="center">
        Carpet Installation
      </Heading>
      <HStack w="full">
        <Input
          type="number"
          placeholder="Square Yards"
          value={sqyd}
          onChange={(e) => setSqyd(e.target.value)}
        />
        <Button onClick={handleAdd}>Add</Button>
      </HStack>
      {/* FIX: Added list of saved items to the sub-page */}
      {data.pieces.length > 0 && (
        <VStack w="full" align="stretch" pt={4}>
          <Divider />
          <Heading size="sm" pt={2}>
            Added Items
          </Heading>
          {data.pieces.map((piece: CarpetPiece) => (
            <Flex
              key={piece.id}
              justify="space-between"
              align="center"
              bg="gray.50"
              p={2}
              borderRadius="md"
            >
              <Text>Carpet: {piece.sqyd} sq yd</Text>
              <IconButton
                aria-label="Delete"
                icon={<Icon as={Trash2} />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(piece.id)}
              />
            </Flex>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

// --- Main Component ---
const FlooringSection: React.FC<PageProps> = (props) => {
  const { estimateData, setEstimateData, remodelType } = props;
  const [activeSubPage, setActiveSubPage] = useState<FlooringCategory | null>(
    null
  );

  const existingItem = useMemo(
    () =>
      (estimateData[remodelType] as EstimateItem[]).find(
        (item) => item.id === "flooring"
      ),
    [estimateData, remodelType]
  );

  const [tileData, setTileData] = useState(() => ({
    tilePieces: parseTilePieces(existingItem?.description || ""),
    activeAddons: parseTileAddons(existingItem?.description || ""),
  }));
  const [lvpData, setLvpData] = useState(() => ({
    pieces: parseLvpOrHardwood(existingItem?.description || "", "LVP"),
  }));
  const [carpetData, setCarpetData] = useState(() => ({
    pieces: parseCarpet(existingItem?.description || ""),
  }));
  const [hardwoodData, setHardwoodData] = useState(() => ({
    pieces: parseLvpOrHardwood(existingItem?.description || "", "Hardwood"),
  }));

  useEffect(() => {
    const tileCost =
      tileData.tilePieces.reduce((s, p) => s + p.cost, 0) +
      tileData.activeAddons.reduce(
        (s, id) => s + (tileAddons.find((a) => a.id === id)?.cost || 0),
        0
      );
    const lvpCost = lvpData.pieces.reduce((s, p) => s + p.cost, 0);
    const carpetCost = carpetData.pieces.reduce((s, p) => s + p.cost, 0);
    const hardwoodCost = hardwoodData.pieces.reduce((s, p) => s + p.cost, 0);
    const totalCost = tileCost + lvpCost + carpetCost + hardwoodCost;

    const buildDescription = () => {
      const details: string[] = [];
      tileData.tilePieces.forEach((p) =>
        details.push(`- ${p.areaName}: ${p.sqft} sq ft`)
      );
      tileData.activeAddons.forEach((id) =>
        details.push(`- ${tileAddons.find((a) => a.id === id)?.name}`)
      );
      lvpData.pieces.forEach((p) =>
        details.push(`- LVP ${p.type.replace("-", " ")}: ${p.value}`)
      );
      carpetData.pieces.forEach((p) =>
        details.push(`- Carpet: ${p.sqyd} sq yd`)
      );
      hardwoodData.pieces.forEach((p) =>
        details.push(`- Hardwood ${p.type.replace("-", " ")}: ${p.value}`)
      );
      if (details.length === 0) return "";
      return "- Floor/Tile Install -\n" + details.join("\n");
    };
    const description = buildDescription();

    if (totalCost > 0) {
      const newItem: EstimateItem = {
        id: "flooring",
        title: "FLOOR/TILE INSTALL",
        category: "REMODEL",
        costCode: "R - Flooring",
        unitCost: totalCost,
        quantity: 1,
        markup: 70,
        margin: 41.18,
        description,
      };
      if (newItem.description !== existingItem?.description) {
        setEstimateData((prev) => {
          const currentItems = (
            Array.isArray(prev[remodelType]) ? prev[remodelType] : []
          ) as EstimateItem[];
          const otherItems = currentItems.filter(
            (item) => item.id !== "flooring"
          );
          return { ...prev, [remodelType]: [...otherItems, newItem] };
        });
      }
    } else {
      if (existingItem) {
        setEstimateData((prev) => ({
          ...prev,
          [remodelType]: (prev[remodelType] as EstimateItem[]).filter(
            (item) => item.id !== "flooring"
          ),
        }));
      }
    }
  }, [
    tileData,
    lvpData,
    carpetData,
    hardwoodData,
    existingItem,
    setEstimateData,
    remodelType,
  ]);

  const renderContent = () => {
    switch (activeSubPage) {
      case "tile":
        return <TileSection data={tileData} onUpdate={setTileData} />;
      case "lvp":
        return (
          <LvpHardwoodSection type="LVP" data={lvpData} onUpdate={setLvpData} />
        );
      case "carpet":
        return <CarpetSection data={carpetData} onUpdate={setCarpetData} />;
      case "hardwood":
        return (
          <LvpHardwoodSection
            type="Hardwood"
            data={hardwoodData}
            onUpdate={setHardwoodData}
          />
        );
      default:
        return (
          <VStack w="full" spacing={6} align="stretch">
            <Heading as="h3" size="lg" textAlign="center">
              Floor/Tile Install
            </Heading>
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="md"
              borderWidth="2px"
              borderColor={existingItem ? "blue.500" : "white"}
              transition="border-color 0.2s"
            >
              <VStack spacing={4}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Button
                    size="lg"
                    h="100px"
                    onClick={() => setActiveSubPage("tile")}
                  >
                    Tile
                  </Button>
                  <Button
                    size="lg"
                    h="100px"
                    onClick={() => setActiveSubPage("lvp")}
                  >
                    LVP
                  </Button>
                  <Button
                    size="lg"
                    h="100px"
                    onClick={() => setActiveSubPage("carpet")}
                  >
                    Carpet
                  </Button>
                  <Button
                    size="lg"
                    h="100px"
                    onClick={() => setActiveSubPage("hardwood")}
                  >
                    Hardwood
                  </Button>
                </SimpleGrid>

                {tileData.tilePieces.length +
                  tileData.activeAddons.length +
                  lvpData.pieces.length +
                  carpetData.pieces.length +
                  hardwoodData.pieces.length >
                  0 && (
                  <VStack w="full" pt={6} spacing={2} align="stretch">
                    <Divider />
                    <Heading size="md" textAlign="center" pt={2}>
                      Current Selections
                    </Heading>
                    {tileData.tilePieces.map((p: TilePiece) => (
                      <Text key={p.id}>
                        - {p.areaName}: {p.sqft} sq ft
                      </Text>
                    ))}
                    {tileData.activeAddons.map((id: string) => (
                      <Text key={id}>
                        - {tileAddons.find((a) => a.id === id)?.name}
                      </Text>
                    ))}
                    {lvpData.pieces.map((p: LvpPiece) => (
                      <Text key={p.id}>
                        - LVP {p.type.replace("-", " ")}: {p.value}
                      </Text>
                    ))}
                    {carpetData.pieces.map((p: CarpetPiece) => (
                      <Text key={p.id}>- Carpet: {p.sqyd} sq yd</Text>
                    ))}
                    {hardwoodData.pieces.map((p: LvpPiece) => (
                      <Text key={p.id}>
                        - Hardwood {p.type.replace("-", " ")}: {p.value}
                      </Text>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Box>
          </VStack>
        );
    }
  };

  if (activeSubPage) {
    return (
      <VStack w="full" spacing={6} align="stretch">
        <Flex w="full" justify="start">
          <Button
            onClick={() => setActiveSubPage(null)}
            leftIcon={<Icon as={ArrowLeft} />}
          >
            Back to Flooring Types
          </Button>
        </Flex>
        <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
          {renderContent()}
        </Box>
      </VStack>
    );
  }

  return renderContent();
};

export default FlooringSection;
