import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Textarea,
  IconButton,
  Flex,
  useToast,
  Text,
  Divider,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Trash2,
  Save,
  X,
  Edit,
  Camera,
  Eraser,
  Pen,
  Upload,
} from "lucide-react";
import { EstimateState } from "../../App";
import type { SavedNote } from "../../App";

interface PageProps {
  estimateData: EstimateState;
  setEstimateData: React.Dispatch<React.SetStateAction<EstimateState>>;
  onNavigate: (page: string) => void;
}

// --- Toolbar Sub-component ---
const Toolbar: React.FC<{
  tool: string;
  setTool: (tool: "pen" | "eraser") => void;
  drawColor: string;
  setDrawColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
}> = ({ tool, setTool, drawColor, setDrawColor, lineWidth, setLineWidth }) => {
  const colors = [
    { name: "black", value: "#000000" },
    { name: "red", value: "#E53E3E" },
    { name: "blue", value: "#3182CE" },
  ];

  const lineSizes = [
    { name: "thin", value: 3 },
    { name: "medium", value: 8 },
    { name: "thick", value: 15 },
  ];

  return (
    <Flex
      w="full"
      p={2}
      borderRadius="md"
      bg="gray.100"
      justifyContent="space-around"
      alignItems="center"
      boxShadow="sm"
      wrap="wrap"
      gap={2}
    >
      <HStack spacing={1}>
        <IconButton
          size="sm"
          aria-label="Pen"
          icon={<Pen size="16px" />}
          onClick={() => setTool("pen")}
          isActive={tool === "pen"}
          variant="outline"
          colorScheme={tool === "pen" ? "blue" : "gray"}
        />
        <IconButton
          size="sm"
          aria-label="Eraser"
          icon={<Eraser size="16px" />}
          onClick={() => setTool("eraser")}
          isActive={tool === "eraser"}
          variant="outline"
          colorScheme={tool === "eraser" ? "blue" : "gray"}
        />
      </HStack>
      <Divider orientation="vertical" h="30px" />
      <HStack spacing={2}>
        {colors.map((c) => (
          <Box
            as="button"
            key={c.name}
            w="24px"
            h="24px"
            bg={c.value}
            borderRadius="full"
            onClick={() => setDrawColor(c.value)}
            border="2px solid"
            borderColor={drawColor === c.value ? "blue.400" : "transparent"}
          />
        ))}
      </HStack>
      <Divider orientation="vertical" h="30px" />
      <HStack spacing={2}>
        {lineSizes.map((s) => (
          <Box
            as="button"
            key={s.name}
            w="24px"
            h="24px"
            bg="gray.200"
            borderRadius="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setLineWidth(s.value)}
            border="2px solid"
            borderColor={lineWidth === s.value ? "blue.400" : "transparent"}
          >
            <Box
              w={`${s.value}px`}
              h={`${s.value}px`}
              bg="black"
              borderRadius="full"
            />
          </Box>
        ))}
      </HStack>
    </Flex>
  );
};

const NotesPage: React.FC<PageProps> = ({
  estimateData,
  setEstimateData,
  onNavigate,
}) => {
  const toast = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // FIX: Added a separate ref for the camera input
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(
    () => estimateData.savedNotes || []
  );
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [drawColor, setDrawColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(3);
  const [currentText, setCurrentText] = useState("");

  const interaction = useRef<"draw" | "pan" | "pinch" | null>(null);
  const pointers = useRef<PointerEvent[]>([]);
  const lastPinchDistance = useRef<number | null>(null);

  useEffect(() => {
    if (savedNotes !== estimateData.savedNotes) {
      setEstimateData((prev) => ({ ...prev, savedNotes }));
    }
  }, [savedNotes, estimateData.savedNotes, setEstimateData]);

  const getContext = () => canvasRef.current?.getContext("2d");

  useEffect(() => {
    const context = getContext();
    if (context) {
      context.lineCap = "round";
      context.lineWidth = lineWidth;
      context.strokeStyle = tool === "eraser" ? "white" : drawColor;
    }
  }, [tool, drawColor, lineWidth]);

  const getCanvasCoords = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.push(e.nativeEvent);

    if (pointers.current.length === 1) {
      if (e.pointerType === "pen" || e.pointerType === "mouse") {
        interaction.current = "draw";
        const { x, y } = getCanvasCoords(e.nativeEvent);
        const context = getContext();
        if (context) {
          context.beginPath();
          context.moveTo(x, y);
        }
      } else {
        interaction.current = "pan";
      }
    } else if (pointers.current.length === 2) {
      interaction.current = "pinch";
      const p1 = pointers.current[0];
      const p2 = pointers.current[1];
      const dx = p1.clientX - p2.clientX;
      const dy = p1.clientY - p2.clientY;
      lastPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.buttons) return;

    const index = pointers.current.findIndex(
      (p) => p.pointerId === e.pointerId
    );
    if (index >= 0) pointers.current[index] = e.nativeEvent;

    if (interaction.current === "draw") {
      const { x, y } = getCanvasCoords(e.nativeEvent);
      const context = getContext();
      if (context) {
        context.lineTo(x, y);
        context.stroke();
      }
    } else if (interaction.current === "pan" && pointers.current.length === 1) {
      // Panning logic can be re-implemented here if needed
    } else if (
      interaction.current === "pinch" &&
      pointers.current.length === 2
    ) {
      // Pinch-to-zoom logic can be re-implemented here if needed
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current = pointers.current.filter(
      (p) => p.pointerId !== e.pointerId
    );
    if (pointers.current.length < 2) lastPinchDistance.current = null;
    if (pointers.current.length < 1) {
      interaction.current = null;
      const context = getContext();
      if (context) context.closePath();
    }
  };

  const clearCanvasAndText = () => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentText("");
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  // FIX: New handler for the camera button
  const handleTakePhotoClick = () => cameraInputRef.current?.click();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = getContext();
        if (canvas && context) {
          clearCanvasAndText();
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSaveNote = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newNote: SavedNote = {
      id: new Date().toISOString(),
      canvasData: canvas.toDataURL(),
      textData: currentText,
    };
    setSavedNotes((prev) => [...prev, newNote]);
    clearCanvasAndText();
    toast({ title: "Note saved!", status: "success", duration: 2000 });
  };

  const handleLoadNote = (noteToLoad: SavedNote) => {
    clearCanvasAndText();
    setCurrentText(noteToLoad.textData || "");

    const context = getContext();
    if (context && noteToLoad.canvasData) {
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0);
      img.src = noteToLoad.canvasData;
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setSavedNotes((prev) => prev.filter((note) => note.id !== noteId));
    toast({ title: "Note deleted.", status: "info", duration: 2000 });
  };

  return (
    <Flex direction="column" minH="100vh" w="100vw" p={4} gap={2}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: "none" }}
      />
      {/* FIX: New hidden input with 'capture' for the camera */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
      />
      <Flex w="full" justify="space-between" align="center" px={2}>
        <Button
          onClick={() => onNavigate("home")}
          leftIcon={<Icon as={ArrowLeft} />}
        >
          Back
        </Button>
        <Heading as="h3" size="lg">
          Notes
        </Heading>
        <Box w="80px" />
      </Flex>
      <Toolbar
        tool={tool}
        setTool={setTool}
        drawColor={drawColor}
        setDrawColor={setDrawColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
      />
      <Box
        flex="1"
        border="2px"
        borderColor="gray.200"
        borderRadius="md"
        overflow="hidden"
        position="relative"
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={900}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            touchAction: "none",
          }}
        />
      </Box>
      <Textarea
        placeholder="Type your notes here..."
        value={currentText}
        onChange={(e) => setCurrentText(e.target.value)}
        bg="white"
        boxShadow="sm"
        borderRadius="md"
      />
      <HStack w="full" justify="space-between" p={2}>
        {/* FIX: Added separate buttons for Camera and Upload */}
        <HStack>
          <Button
            onClick={handleTakePhotoClick}
            leftIcon={<Icon as={Camera} />}
            colorScheme="gray"
          >
            Take Photo
          </Button>
          <Button
            onClick={handleUploadClick}
            leftIcon={<Icon as={Upload} />}
            colorScheme="gray"
          >
            Upload
          </Button>
        </HStack>
        <HStack>
          <Button
            onClick={clearCanvasAndText}
            leftIcon={<Icon as={X} />}
            colorScheme="gray"
          >
            Clear
          </Button>
          <Button
            onClick={handleSaveNote}
            leftIcon={<Icon as={Save} />}
            colorScheme="blue"
          >
            Save Note
          </Button>
        </HStack>
      </HStack>
      {savedNotes.length > 0 && (
        <VStack
          w="full"
          spacing={3}
          align="stretch"
          pt={4}
          overflowY="auto"
          maxH="150px"
        >
          <Heading size="md">Saved Notes</Heading>
          {savedNotes.map((note) => (
            <Flex
              key={note.id}
              justify="space-between"
              align="center"
              bg="gray.50"
              p={3}
              borderRadius="md"
            >
              <Text>Note from {new Date(note.id).toLocaleString()}</Text>
              <HStack>
                <IconButton
                  aria-label="Load note"
                  icon={<Icon as={Edit} />}
                  onClick={() => handleLoadNote(note)}
                />
                <IconButton
                  aria-label="Delete note"
                  icon={<Icon as={Trash2} />}
                  colorScheme="red"
                  onClick={() => handleDeleteNote(note.id)}
                />
              </HStack>
            </Flex>
          ))}
        </VStack>
      )}
    </Flex>
  );
};

export default NotesPage;
