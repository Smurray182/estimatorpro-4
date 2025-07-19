import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Icon,
  Text,
  Flex,
  Divider,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { EstimateState, EstimateItem, Room, SavedNote } from "../App";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- Reusable Printable Components ---

const PrintableReview: React.FC<{ items: EstimateItem[]; total: number }> = ({
  items,
  total,
}) => (
  <VStack spacing={4} p={8} bg="white" align="stretch">
    <Heading size="lg" textAlign="center">
      Estimate Summary
    </Heading>
    {items.map((item) => (
      <Box
        key={`${item.id}-${item.title}`}
        w="full"
        borderBottom="1px solid #eee"
        pb={4}
      >
        <Heading size="md" mb={2}>
          {item.title}
        </Heading>
        <Text
          whiteSpace="pre-wrap"
          fontFamily="monospace"
          fontSize="sm"
          color="gray.600"
        >
          {item.description}
        </Text>
      </Box>
    ))}
    <Flex w="full" justify="flex-end" align="center" pt={4}>
      <Heading size="lg">Grand Total:</Heading>
      <Heading size="lg" color="blue.600" ml={4}>
        ${(total * 1.65).toFixed(2)}
      </Heading>
    </Flex>
  </VStack>
);

const PrintableNote: React.FC<{ note: SavedNote }> = ({ note }) => (
  <VStack spacing={4} p={8} bg="white" align="stretch">
    <Heading size="lg" textAlign="center">
      Note - {new Date(note.id).toLocaleString()}
    </Heading>
    {note.canvasData && (
      <img
        src={note.canvasData}
        alt="Note Drawing"
        style={{ maxWidth: "100%", border: "1px solid #ccc" }}
      />
    )}
    {typeof note.textData === "string" && (
      <Text whiteSpace="pre-wrap" pt={4}>
        {note.textData}
      </Text>
    )}
  </VStack>
);

const PrintableRoomLayout: React.FC<{ room: Room }> = ({ room }) => {
  const minX = Math.min(...room.vertices.map((v: { x: number }) => v.x));
  const minY = Math.min(...room.vertices.map((v: { y: number }) => v.y));
  const maxX = Math.max(...room.vertices.map((v: { x: number }) => v.x));
  const maxY = Math.max(...room.vertices.map((v: { y: number }) => v.y));

  const width = maxX - minX;
  const height = maxY - minY;

  const aspectRatio = height > 0 ? width / height : 1;

  const padding = 20;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${
    height + padding * 2
  }`;

  const points = room.vertices
    .map((v: { x: number; y: number }) => `${v.x},${v.y}`)
    .join(" ");

  return (
    <VStack spacing={4} p={8} bg="white" align="stretch">
      <Heading size="lg" textAlign="center">
        Room Layout - {room.name}
      </Heading>
      {/* FIX: Use a simple Box with explicit aspect ratio for reliable rendering */}
      <Box w="100%" maxW="180mm" mx="auto">
        <svg
          viewBox={viewBox}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <polygon
            points={points}
            fill="#E2E8F0"
            stroke="#4A5568"
            strokeWidth={width / 100}
          />
        </svg>
      </Box>
      <Text>Area: {room.area.toFixed(2)} sq ft</Text>
    </VStack>
  );
};

// --- Main Export Page Component ---

interface PageProps {
  estimateData: EstimateState;
  onNavigate: (page: string) => void;
  projectName: string;
}

const ExportPDFPage: React.FC<PageProps> = ({
  estimateData,
  onNavigate,
  projectName,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const roomRefs = useRef<(HTMLDivElement | null)[]>([]);

  const allItems = [
    ...estimateData.generalRemodel,
    ...estimateData.masterBathroom,
    ...estimateData.guestBathroom,
    ...estimateData.kitchen,
  ];
  const grandTotal = allItems.reduce(
    (sum, item) => sum + item.unitCost * (item.quantity || 1),
    0
  );

  const handleExport = async () => {
    if (!projectName) {
      toast({
        title: "Project Not Saved",
        description:
          "Please save the estimate with a name before exporting the portfolio.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Generating PDF...",
      status: "info",
      duration: null,
      isClosable: true,
    });

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      pdf.setFontSize(22);
      pdf.text(`Estimate Summary: ${projectName}`, pdfWidth / 2, yPos, {
        align: "center",
      });
      yPos += 15;

      allItems.forEach((item) => {
        if (yPos > pdfHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.title, margin, yPos);
        yPos += 7;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const splitDescription = pdf.splitTextToSize(
          item.description || "",
          pdfWidth - margin * 2
        );
        pdf.text(splitDescription, margin, yPos);
        yPos += splitDescription.length * 4 + 5;
      });

      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pdfWidth - margin, yPos);
      yPos += 10;

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Grand Total:", pdfWidth - margin, yPos, { align: "right" });
      pdf.text(
        `$${(grandTotal * 1.65).toFixed(2)}`,
        pdfWidth - margin,
        yPos + 8,
        { align: "right" }
      );

      for (let i = 0; i < estimateData.savedNotes.length; i++) {
        const noteRef = noteRefs.current[i];
        if (noteRef) {
          pdf.addPage();
          const canvas = await html2canvas(noteRef);
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      for (let i = 0; i < estimateData.savedRooms.length; i++) {
        const roomRef = roomRefs.current[i];
        if (roomRef) {
          pdf.addPage();
          const canvas = await html2canvas(roomRef, { scale: 2 }); // Increase scale for better quality
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            pdfWidth,
            pdfHeight,
            undefined,
            "FAST"
          );
        }
      }

      pdf.save(`${projectName}_portfolio.pdf`);
      toast.closeAll();
      toast({ title: "Export Successful!", status: "success", duration: 3000 });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.closeAll();
      toast({
        title: "Export Failed",
        description: "Could not generate the PDF.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box position="absolute" left="-9999px" top="0" w="210mm">
        {/* The review page is now drawn directly, so no ref is needed */}
        {estimateData.savedNotes.map((note: SavedNote, index: number) => (
          <Box key={note.id} ref={(el) => (noteRefs.current[index] = el)}>
            <PrintableNote note={note} />
          </Box>
        ))}
        {estimateData.savedRooms.map((room: Room, index: number) => (
          <Box key={room.savedAt} ref={(el) => (roomRefs.current[index] = el)}>
            <PrintableRoomLayout room={room} />
          </Box>
        ))}
      </Box>

      <VStack w="full" p={4} spacing={6} align="stretch">
        <Flex w="full" justify="space-between" align="center">
          <Button
            onClick={() => onNavigate("home")}
            leftIcon={<Icon as={ArrowLeft} />}
          >
            Back to Home
          </Button>
          <Heading as="h3" size="lg">
            Export Portfolio
          </Heading>
          <Box w="110px" />
        </Flex>

        <VStack
          spacing={4}
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          align="center"
        >
          <Icon as={FileText} boxSize={16} color="blue.500" />
          <Heading size="md">Generate PDF Portfolio</Heading>
          <Text textAlign="center" maxW="lg">
            This will create a single PDF file containing the full estimate
            summary, all saved notes, and all saved room layouts.
          </Text>
          <Button
            colorScheme="blue"
            size="lg"
            leftIcon={
              isLoading ? <Spinner size="sm" /> : <Icon as={Download} />
            }
            onClick={handleExport}
            isLoading={isLoading}
            loadingText="Generating PDF..."
            isDisabled={!projectName}
          >
            Generate and Download PDF
          </Button>
          {!projectName && (
            <Text fontSize="sm" color="red.500">
              Please save your estimate with a name on the homepage before
              exporting.
            </Text>
          )}
        </VStack>
      </VStack>
    </>
  );
};

export default ExportPDFPage;
