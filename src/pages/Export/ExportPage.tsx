import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Icon,
  Text,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { ArrowLeft, DownloadCloud } from "lucide-react";
import { EstimateState, EstimateItem } from "../../App";

interface PageProps {
  estimateData: EstimateState;
  onNavigate: (page: string) => void;
  projectName: string;
}

interface ProcessedItem {
  Category: string;
  "Cost Code": string;
  Title: string;
  Description: string;
  "Unit Cost": number;
  "Builder Cost": number;
  Markup: number;
  "Markup Type": string;
  "Client Price": number;
  "Internal Notes": string;
  Margin: string;
}

const groupDataBySection = (data: EstimateState) => {
  const allItemsWithSource = [
    ...data.generalRemodel.map((item) => ({
      ...item,
      sourceCategory: "General Remodel",
    })),
    ...data.masterBathroom.map((item) => ({
      ...item,
      sourceCategory: "Master Bathroom",
    })),
    ...data.guestBathroom.map((item) => ({
      ...item,
      sourceCategory: "Guest Bathroom",
    })),
    ...data.kitchen.map((item) => ({ ...item, sourceCategory: "Kitchen" })),
  ];

  const grouped = allItemsWithSource.reduce((acc, item) => {
    const title =
      item.id === "permitFee"
        ? "PERMIT FEE"
        : item.title.toUpperCase().replace(/"/g, "");

    if (!acc[title]) {
      acc[title] = {
        items: [],
        costCode: item.costCode,
        category: item.category,
        markup: item.markup,
        margin: item.margin,
        totalCost: 0,
      };
    }
    acc[title].items.push({
      sourceCategory: item.sourceCategory,
      description: item.description,
    });
    acc[title].totalCost += item.unitCost * (item.quantity || 1);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(grouped).map(([title, data]) => ({ title, ...data }));
};

const generateMultiPartDescription = async (
  sectionTitle: string,
  items: { sourceCategory: string; description?: string }[],
  apiKey: string
): Promise<string> => {
  if (items.length === 1) {
    const simplePrompt = `Write a professional, customer-facing description for a section titled "${sectionTitle}" based on these notes: "${items[0].description}". The final description should start with "- ${sectionTitle} -" on the first line, followed by the detailed scope on the next line.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: simplePrompt }] }],
        }),
      }
    );
    const result = await response.json();
    return result.candidates[0].content.parts[0].text.trim();
  }

  const subPrompts = items
    .map(
      (item) =>
        `For the "${item.sourceCategory}" part of the project, the notes are: "${item.description}". Please write a customer-facing summary for just this part.`
    )
    .join("\n");

  const complexPrompt = `
        You are writing a scope of work for a section titled "${sectionTitle}". This section has work in multiple areas of the house.
        Based on the following instructions, generate a single, combined description.

        Instructions:
        ${subPrompts}

        Your final output must be a single block of text formatted exactly like this, with a separate, AI-generated description for each area:
        - ${sectionTitle} -
        - [Area 1 Name] -
        [AI-generated description for Area 1]
        - [Area 2 Name] -
        [AI-generated description for Area 2]
    `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: complexPrompt }] }],
      }),
    }
  );
  const result = await response.json();
  return result.candidates[0].content.parts[0].text.trim();
};

const convertToCSV = (data: ProcessedItem[]): string => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ("" + (row as any)[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

const ExportPage: React.FC<PageProps> = ({
  estimateData,
  onNavigate,
  projectName,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = "AIzaSyDZ7Lf1RxJ11Zp0YFBkVKMayS4Xi96qH5I";

  const handleExport = async () => {
    if (!projectName) {
      toast({
        title: "Project Not Saved",
        description:
          "Please save the estimate with a name on the homepage before exporting.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Generating Report...",
      description: "Please wait while the AI writes the descriptions.",
      status: "info",
      duration: null,
      isClosable: true,
    });

    try {
      let groupedData = groupDataBySection(estimateData);

      if (groupedData.length === 0) {
        toast.closeAll();
        toast({ title: "No data to export.", status: "warning" });
        setIsLoading(false);
        return;
      }

      // FIX: Logic to handle Termite Treatment as a separate line item
      let hasTermite = false;
      let termiteRow: ProcessedItem | null = null;

      groupedData = groupedData.map((section) => {
        if (
          section.title === "CONCRETE" &&
          section.items.some((i: any) =>
            i.description?.includes("Termite Treatment")
          )
        ) {
          hasTermite = true;
          // Subtract termite cost from concrete to avoid double-counting
          const newTotalCost = section.totalCost - 150;
          // Remove termite from the description notes for the AI
          section.items.forEach((item: any) => {
            item.description = item.description
              ?.replace("- Termite Treatment", "")
              .trim();
          });
          return { ...section, totalCost: newTotalCost };
        }
        return section;
      });

      const descriptionPromises = groupedData.map((section) =>
        generateMultiPartDescription(section.title, section.items, apiKey)
      );
      const generatedDescriptions = await Promise.all(descriptionPromises);

      let dataWithDescriptions = groupedData.map((section, index) => {
        const isCabinetItem = section.category === "CABINETS";
        const unitCost = section.totalCost;
        const markup = isCabinetItem ? 0 : 70;
        const clientPrice = isCabinetItem ? unitCost : unitCost * 1.7;

        return {
          Category: section.category,
          "Cost Code": section.costCode,
          Title: section.title,
          Description: generatedDescriptions[index],
          "Unit Cost": unitCost,
          "Builder Cost": unitCost,
          Markup: markup,
          "Markup Type": "%",
          "Client Price": clientPrice,
          "Internal Notes": section.items
            .map((i: any) => i.description)
            .join(" | "),
          Margin: isCabinetItem ? "0.00%" : "41.18%",
        };
      });

      if (hasTermite) {
        termiteRow = {
          Category: "REMODEL",
          "Cost Code": "R - Termite Prevention",
          Title: "TERMITE PREVENTION",
          Description:
            "Termite Treatment of slab foundation for new plumbing location. (Required per Florida Building Code 8th Ed.)",
          "Unit Cost": 150,
          "Builder Cost": 150,
          Markup: 70,
          "Markup Type": "%",
          "Client Price": 255,
          "Internal Notes": "$150 Per Room",
          Margin: "41.18%",
        };
        const concreteIndex = dataWithDescriptions.findIndex(
          (item) => item.Title === "CONCRETE"
        );
        if (concreteIndex > -1) {
          dataWithDescriptions.splice(concreteIndex + 1, 0, termiteRow);
        } else {
          dataWithDescriptions.push(termiteRow);
        }
      }

      const activeCategories = [];
      if (estimateData.masterBathroom.length > 0)
        activeCategories.push("MASTER BATHROOM REMODEL");
      if (estimateData.guestBathroom.length > 0)
        activeCategories.push("GUEST BATHROOM REMODEL");
      if (estimateData.kitchen.length > 0)
        activeCategories.push("KITCHEN REMODEL");
      if (estimateData.generalRemodel.length > 0)
        activeCategories.push("GENERAL REMODEL");
      const summaryTitle =
        activeCategories.length === 1 ? activeCategories[0] : "GENERAL REMODEL";

      const summaryRow: ProcessedItem = {
        Category: "REMODEL",
        "Cost Code": "R - Administrative",
        Title: summaryTitle,
        Description:
          "Work Scope Summary\nThis document outlines the scope of work for the proposed project.",
        "Unit Cost": 0,
        "Builder Cost": 0,
        Markup: 0,
        "Markup Type": "%",
        "Client Price": 0,
        "Internal Notes": "",
        Margin: "0.00%",
      };

      const disclaimerRow: ProcessedItem = {
        Category: "REMODEL",
        "Cost Code": "R - Administrative",
        Title: "FURNITURE DISCLAIMER",
        Description:
          "The client is responsible for relocating any furniture that will impede Todd Thomas Home’s work. If the homeowner asks Todd Thomas Home to move the furniture, Todd Thomas Home assumes no liability for any damages incurred. Additionally, an extra hourly fee of $90 per man will be charged for moving furniture.",
        "Unit Cost": 0,
        "Builder Cost": 0,
        Markup: 0,
        "Markup Type": "%",
        "Client Price": 0,
        "Internal Notes": "",
        Margin: "0.00%",
      };

      const finalData = [summaryRow, ...dataWithDescriptions, disclaimerRow];
      const finalCsv = convertToCSV(finalData);

      const blob = new Blob([finalCsv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${projectName}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.closeAll();
      toast({ title: "Export Successful!", status: "success" });
    } catch (error: any) {
      console.error("Export failed:", error);
      toast.closeAll();
      toast({
        title: "Export Failed",
        description: error.message || "An unknown error occurred.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack w="full" p={4} spacing={6} align="stretch">
      <Flex w="full" justify="space-between" align="center">
        <Button
          onClick={() => onNavigate("home")}
          leftIcon={<Icon as={ArrowLeft} />}
        >
          Back to Home
        </Button>
        <Heading as="h3" size="lg">
          Export Estimate
        </Heading>
        <Box w="110px" />
      </Flex>
      <VStack
        spacing={6}
        p={8}
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        align="stretch"
      >
        <VStack>
          <Icon as={DownloadCloud} boxSize={16} color="blue.500" />
          <Heading size="md">Export to Excel (CSV)</Heading>
          <Text textAlign="center" maxW="lg">
            This tool will use the Gemini AI to generate a professional,
            customer-facing scope of work and export it as a CSV file.
          </Text>
        </VStack>
        <Button
          colorScheme="blue"
          size="lg"
          leftIcon={
            isLoading ? <Spinner size="sm" /> : <Icon as={DownloadCloud} />
          }
          onClick={handleExport}
          isLoading={isLoading}
          loadingText="Generating..."
          isDisabled={!projectName}
        >
          Generate and Download Report
        </Button>
        {!projectName && (
          <Text fontSize="sm" color="red.500" pt={2}>
            Please save your estimate with a name on the homepage before
            exporting.
          </Text>
        )}
      </VStack>
    </VStack>
  );
};

export default ExportPage;
