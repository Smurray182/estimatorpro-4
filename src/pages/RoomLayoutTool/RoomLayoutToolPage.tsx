import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
  Flex,
} from "@chakra-ui/react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  FolderOpen,
  Save,
  X,
} from "lucide-react";
import { Room } from "../../App";

// Interfaces
interface Point {
  x: number;
  y: number;
}

interface PageProps {
  onNavigate: (page: string) => void;
  onSaveRoom: (roomData: Room) => void;
  initialRoom: { vertices: Point[]; isClosed: boolean } | null;
}

const NumpadUnit: React.FC<{
  title: string;
  value: string;
  onKeyPress: (key: string) => void;
  colorScheme: "blue" | "green";
}> = ({ title, value, onKeyPress, colorScheme }) => {
  const keys = [
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "1",
    "2",
    "3",
    ".",
    "0",
    "backspace",
  ];

  return (
    <VStack spacing={2}>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        fontFamily="mono"
        bg="white"
        p={1}
        borderRadius="md"
        w="110px"
        textAlign="center"
      >
        {value}
      </Text>
      <SimpleGrid columns={3} spacing={1} w="110px">
        {keys.map((key) => (
          <Button
            key={key}
            onClick={() => onKeyPress(key)}
            size="sm"
            colorScheme={
              key === "." || key === "backspace" ? "gray" : colorScheme
            }
            color={key === "." || key === "backspace" ? "gray.700" : undefined}
            borderColor={
              key === "." || key === "backspace" ? "gray.400" : undefined
            }
            variant={key === "." || key === "backspace" ? "outline" : "solid"}
            p={2}
          >
            {key === "backspace" ? <Icon as={X} boxSize={4} /> : key}
          </Button>
        ))}
      </SimpleGrid>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        {title}
      </Text>
    </VStack>
  );
};

const ControlPanel: React.FC<{
  feetValue: string;
  inchesValue: string;
  handleNumpadInput: (type: "feet" | "inches", key: string) => void;
  handleAddWall: (angle: number) => void;
  handleClear: () => void;
  handleSaveClick: () => void;
  handleCloseShape: () => void;
  isShapeClosable: boolean;
  onNavigate: (page: string) => void;
}> = ({
  feetValue,
  inchesValue,
  handleNumpadInput,
  handleAddWall,
  handleClear,
  handleSaveClick,
  handleCloseShape,
  isShapeClosable,
  onNavigate,
}) => (
  <Grid
    h="auto"
    w="full"
    px={4}
    py={2}
    bg="gray.100"
    borderTop="1px solid"
    borderColor="gray.200"
    templateColumns="auto 1fr auto"
    alignItems="center"
    gap={4}
  >
    <GridItem>
      <HStack spacing={4}>
        <NumpadUnit
          title="Feet"
          value={feetValue}
          onKeyPress={(key) => handleNumpadInput("feet", key)}
          colorScheme="blue"
        />
        <NumpadUnit
          title="Inches"
          value={inchesValue}
          onKeyPress={(key) => handleNumpadInput("inches", key)}
          colorScheme="green"
        />
      </HStack>
    </GridItem>
    <GridItem justifySelf="center">
      <VStack>
        <SimpleGrid columns={3} spacing={1} w="150px">
          <IconButton
            size="md"
            aria-label="Draw North West"
            onClick={() => handleAddWall(135)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
            icon={<ArrowUpLeft />}
          />
          <IconButton
            size="md"
            aria-label="Draw North"
            icon={<ArrowUp />}
            onClick={() => handleAddWall(90)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
          />
          <IconButton
            size="md"
            aria-label="Draw North East"
            onClick={() => handleAddWall(45)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
            icon={<ArrowUpRight />}
          />
          <IconButton
            size="md"
            aria-label="Draw West"
            icon={<ArrowLeft />}
            onClick={() => handleAddWall(180)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
          />
          <Box />
          <IconButton
            size="md"
            aria-label="Draw East"
            icon={<ArrowRight />}
            onClick={() => handleAddWall(0)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
          />
          <IconButton
            size="md"
            aria-label="Draw South West"
            onClick={() => handleAddWall(225)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
            icon={<ArrowDownLeft />}
          />
          <IconButton
            size="md"
            aria-label="Draw South"
            icon={<ArrowDown />}
            onClick={() => handleAddWall(270)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
          />
          <IconButton
            size="md"
            aria-label="Draw South East"
            onClick={() => handleAddWall(315)}
            bg="gray.300"
            _hover={{ bg: "gray.400" }}
            icon={<ArrowDownRight />}
          />
        </SimpleGrid>
      </VStack>
    </GridItem>
    <GridItem justifySelf="end">
      <VStack spacing={2} align="stretch">
        <Button
          size="sm"
          w="110px"
          leftIcon={<Icon as={X} />}
          colorScheme="red"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          size="sm"
          w="110px"
          leftIcon={<Icon as={Save} />}
          colorScheme="blue"
          onClick={handleSaveClick}
        >
          Save
        </Button>
        <Button
          size="sm"
          w="110px"
          leftIcon={<Icon as={FolderOpen} />}
          colorScheme="green"
          onClick={() => onNavigate("saved-rooms")}
        >
          Load
        </Button>
        <Button
          size="sm"
          w="110px"
          onClick={handleCloseShape}
          colorScheme="yellow"
          isDisabled={!isShapeClosable}
        >
          Close Shape
        </Button>
      </VStack>
    </GridItem>
  </Grid>
);

const RoomLayoutToolPage: React.FC<PageProps> = ({
  onNavigate,
  onSaveRoom,
  initialRoom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feetValue, setFeetValue] = useState("0");
  const [inchesValue, setInchesValue] = useState("0");
  const [vertices, setVertices] = useState<Point[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [totalArea, setTotalArea] = useState(0);
  const [viewport, setViewport] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [roomName, setRoomName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const PIXELS_PER_INCH = 5;
  const VIEWPORT_PADDING = 100;

  useEffect(() => {
    if (initialRoom) {
      setVertices(initialRoom.vertices);
      setIsClosed(initialRoom.isClosed);
    }
  }, [initialRoom]);

  const handleClear = () => {
    if (vertices.length > 0) {
      setVertices([vertices[0]]);
    } else {
      setVertices([]);
    }
    setIsClosed(false);
    setTotalArea(0);
  };

  const handleSaveClick = () => {
    if (vertices.length < 2) return;
    onOpen();
  };

  const handleConfirmSave = () => {
    const roomData: Room = {
      name: roomName,
      area: totalArea,
      vertices: vertices,
      isClosed: isClosed,
      savedAt: new Date().toISOString(),
    };
    onSaveRoom(roomData);
    onClose();
    setRoomName("");
  };

  const calculateArea = useCallback(
    (verts: Point[]): number => {
      if (verts.length < 3) return 0;
      let area = 0;
      for (let i = 0; i < verts.length; i++) {
        const next = (i + 1) % verts.length;
        area += verts[i].x * verts[next].y - verts[i].y * verts[next].x;
      }
      const areaInSqPixels = Math.abs(area / 2);
      return areaInSqPixels / (PIXELS_PER_INCH * PIXELS_PER_INCH * 144);
    },
    [PIXELS_PER_INCH]
  );

  useEffect(() => {
    if (isClosed) {
      setTotalArea(calculateArea(vertices));
    } else {
      setTotalArea(0);
    }
  }, [isClosed, vertices, calculateArea]);

  const updateViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || vertices.length === 0) return;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    vertices.forEach((v) => {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    });
    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;
    const availableWidth = Math.max(0, canvas.width - VIEWPORT_PADDING * 2);
    const availableHeight = Math.max(0, canvas.height - VIEWPORT_PADDING * 2);
    const scaleX = drawingWidth > 0 ? availableWidth / drawingWidth : 1;
    const scaleY = drawingHeight > 0 ? availableHeight / drawingHeight : 1;
    const scale = Math.min(scaleX, scaleY, 5);
    const drawingCenterX = minX + drawingWidth / 2;
    const drawingCenterY = minY + drawingHeight / 2;
    const offsetX = canvas.width / 2 - drawingCenterX * scale;
    const offsetY = canvas.height / 2 - drawingCenterY * scale;
    setViewport({
      scale: isFinite(scale) && scale > 0 ? scale : 1,
      offsetX,
      offsetY,
    });
  }, [vertices, VIEWPORT_PADDING]);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const gridSpacing = 12 * PIXELS_PER_INCH;
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1 / viewport.scale;
      const canvas = ctx.canvas;
      const left = -viewport.offsetX / viewport.scale;
      const top = -viewport.offsetY / viewport.scale;
      const right = (canvas.width - viewport.offsetX) / viewport.scale;
      const bottom = (canvas.height - viewport.offsetY) / viewport.scale;
      for (
        let x = Math.floor(left / gridSpacing) * gridSpacing;
        x < right;
        x += gridSpacing
      ) {
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }
      for (
        let y = Math.floor(top / gridSpacing) * gridSpacing;
        y < bottom;
        y += gridSpacing
      ) {
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();
      }
    },
    [viewport, PIXELS_PER_INCH]
  );

  const redrawAll = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const canvas = ctx.canvas;
    const parent = canvas.parentElement;
    if (
      parent &&
      (canvas.width !== parent.clientWidth ||
        canvas.height !== parent.clientHeight)
    ) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);
    drawGrid(ctx);
    if (vertices.length > 0) {
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      vertices.forEach((point, idx) => {
        if (idx > 0) ctx.lineTo(point.x, point.y);
      });
      if (isClosed && vertices.length > 2) {
        ctx.closePath();
      }
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2 / viewport.scale;
      ctx.lineJoin = "round";
      ctx.stroke();
      if (isClosed) {
        ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
        ctx.fill();
      }
      vertices.forEach((vertex, index) => {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 6 / viewport.scale, 0, 2 * Math.PI);
        ctx.fillStyle = index === 0 ? "#10B981" : "#3B82F6";
        ctx.fill();
      });
    }
    ctx.restore();
  }, [vertices, isClosed, viewport, drawGrid]);

  useEffect(() => {
    redrawAll();
  }, [vertices, viewport, redrawAll]);

  useEffect(() => {
    updateViewport();
  }, [vertices, updateViewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;
    const resizeObserver = new ResizeObserver(() => {
      updateViewport();
      redrawAll();
    });
    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, [updateViewport, redrawAll]);

  const handleNumpadInput = (type: "feet" | "inches", key: string) => {
    const current = type === "feet" ? feetValue : inchesValue;
    const setter = type === "feet" ? setFeetValue : setInchesValue;
    let updated = current;
    if (key === "backspace") {
      updated = current.length > 1 ? current.slice(0, -1) : "0";
    } else if (key === "." && current.includes(".")) {
      return;
    } else {
      updated = current === "0" && key !== "." ? key : current + key;
    }
    setter(updated);
  };

  const handleAddWall = (angle: number) => {
    if (isClosed || vertices.length === 0) return;
    const last = vertices[vertices.length - 1];
    const feet = parseFloat(feetValue) || 0;
    const inches = parseFloat(inchesValue) || 0;
    if (feet === 0 && inches === 0) return;
    const lengthInPixels = (feet * 12 + inches) * PIXELS_PER_INCH;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * lengthInPixels;
    const dy = -Math.sin(rad) * lengthInPixels;
    const newPoint = { x: last.x + dx, y: last.y + dy };
    setVertices([...vertices, newPoint]);
    setFeetValue("0");
    setInchesValue("0");
  };

  return (
    <Flex direction="column" h="100vh" w="100vw">
      <Box flex="1" p={4} position="relative" overflow="hidden">
        <IconButton
          aria-label="Back to home"
          icon={<Icon as={ArrowLeft} />}
          onClick={() => onNavigate("home")}
          position="absolute"
          top={2}
          left={2}
          zIndex={10}
          colorScheme="gray"
        />
        <Box position="relative" w="100%" h="100%" bg="white" borderRadius="md">
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </Box>
        <Box
          position="absolute"
          bottom={2}
          right={2}
          bg="whiteAlpha.800"
          backdropFilter="blur(2px)"
          p={3}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading size="sm" color="slate.700">
            Total Area:
          </Heading>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="blue.600"
            textAlign="right"
          >
            {totalArea.toFixed(2)} sq ft
          </Text>
        </Box>
      </Box>

      <ControlPanel
        feetValue={feetValue}
        inchesValue={inchesValue}
        handleNumpadInput={handleNumpadInput}
        handleAddWall={handleAddWall}
        handleClear={handleClear}
        handleSaveClick={handleSaveClick}
        handleCloseShape={() => setIsClosed(true)}
        isShapeClosable={vertices.length >= 3 && !isClosed}
        onNavigate={onNavigate}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Room Layout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Room Name</FormLabel>
              <Input
                placeholder="e.g., Master Bedroom"
                value={roomName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRoomName(e.target.value)
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleConfirmSave}
              isDisabled={!roomName}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RoomLayoutToolPage;
