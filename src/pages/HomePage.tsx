import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Icon,
  VStack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from "@chakra-ui/react";
import {
  Home,
  Bath,
  ShowerHead,
  CookingPot,
  Save,
  FolderOpen,
  RefreshCcw,
  Ruler,
  Wrench,
  FileText,
  DownloadCloud,
  FileCheck,
} from "lucide-react";
import { EstimateState } from "../App";

interface ActionButtonProps {
  name: string;
  icon: React.ElementType;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ name, icon, onClick }) => {
  return (
    <Box
      as="button"
      onClick={onClick}
      bg="gray.100"
      p={6}
      borderRadius="xl"
      boxShadow="md"
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        bg: "gray.200",
        boxShadow: "lg",
        transform: "scale(1.05)",
      }}
    >
      <VStack spacing={4}>
        <Icon as={icon} boxSize={10} color="gray.600" />
        <Heading size="md" fontWeight="semibold" color="gray.700">
          {name}
        </Heading>
      </VStack>
    </Box>
  );
};

interface Category {
  name: string;
  icon: React.ElementType;
  page: string;
}

interface CategoryButtonProps {
  category: Category;
  onNavigate: (page: string) => void;
  total?: number;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  onNavigate,
  total = 0,
}) => {
  const hasTotal = total > 0;
  return (
    <Box
      as="button"
      onClick={() => onNavigate(category.page)}
      bg={hasTotal ? "blue.500" : "white"}
      color={hasTotal ? "white" : "inherit"}
      p={6}
      borderRadius="xl"
      boxShadow="md"
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        bg: "blue.500",
        color: "white",
        boxShadow: "xl",
        transform: "scale(1.05)",
        ".chakra-icon": {
          color: "white",
        },
      }}
    >
      <VStack spacing={4}>
        <Icon
          as={category.icon}
          boxSize={10}
          color={hasTotal ? "white" : "blue.500"}
          transition="color 0.3s"
        />
        <VStack spacing={1}>
          <Heading size="md" fontWeight="semibold">
            {category.name}
          </Heading>
        </VStack>
      </VStack>
    </Box>
  );
};

interface HomePageProps {
  onNavigate: (page: string) => void;
  totals: { [key: string]: number };
  onSetName: (name: string) => void;
  onDownload: () => void;
  onClearCurrent: () => void;
  onLoad: (data: any) => void;
  onStartNewRoom: () => void;
  estimateData: EstimateState;
}

const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  totals,
  onSetName,
  onDownload,
  onLoad,
  onClearCurrent,
  onStartNewRoom,
  estimateData,
}) => {
  const {
    isOpen: isSaveModalOpen,
    onOpen: onSaveModalOpen,
    onClose: onSaveModalClose,
  } = useDisclosure();
  const {
    isOpen: isClearAlertOpen,
    onOpen: onClearAlertOpen,
    onClose: onClearAlertClose,
  } = useDisclosure();
  const {
    isOpen: isDownloadConfirmOpen,
    onOpen: onDownloadConfirmOpen,
    onClose: onDownloadConfirmClose,
  } = useDisclosure();

  const [estimateName, setEstimateName] = useState(
    estimateData.projectName || ""
  );
  const cancelRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Category[] = [
    {
      name: "General Remodel +",
      icon: Home,
      page: "general-remodel-plus",
    },
    { name: "Master Bathroom", icon: Bath, page: "master-bathroom" },
    { name: "Guest Bathroom", icon: ShowerHead, page: "guest-bathroom" },
    { name: "Kitchen", icon: CookingPot, page: "kitchen" },
  ];

  const handleSaveClick = () => {
    onSetName(estimateName);
    onSaveModalClose();
    onDownloadConfirmOpen();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const data = JSON.parse(text as string);
        onLoad(data);
      } catch (error) {
        console.error("Failed to read or parse file:", error);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <Container maxW="container.lg" py={12}>
        <VStack spacing={10}>
          <Box textAlign="center">
            <Heading as="h1" size="2xl" color="gray.800">
              Estimator Pro
            </Heading>
            <Text fontSize="xl" color="gray.600" mt={2}>
              Choose a template or load a project
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} w="100%">
            {categories.map((category) => {
              const keyMap: { [key: string]: string } = {
                "General Remodel +": "generalRemodel",
                "Master Bathroom": "masterBathroom",
                "Guest Bathroom": "guestBathroom",
                Kitchen: "kitchen",
              };
              const total = totals[keyMap[category.name]] || 0;
              return (
                <CategoryButton
                  key={category.name}
                  category={category}
                  onNavigate={onNavigate}
                  total={total}
                />
              );
            })}
            <ActionButton
              name="Room Layout"
              icon={Ruler}
              onClick={onStartNewRoom}
            />
            <ActionButton
              name="Tools"
              icon={Wrench}
              onClick={() => onNavigate("tools")}
            />
            <ActionButton
              name="Notes"
              icon={FileText}
              onClick={() => onNavigate("notes")}
            />
            <ActionButton
              name="Review"
              icon={FileCheck}
              onClick={() => onNavigate("review")}
            />
            <ActionButton
              name="Save Estimate"
              icon={Save}
              onClick={onSaveModalOpen}
            />
            <ActionButton
              name="Load Estimate"
              icon={FolderOpen}
              onClick={handleLoadClick}
            />
            <ActionButton
              name="Export to CSV"
              icon={DownloadCloud}
              onClick={() => onNavigate("export")}
            />
            {/* FIX: Re-added the Export PDF button */}
            <ActionButton
              name="Export PDF"
              icon={FileText}
              onClick={() => onNavigate("export-pdf")}
            />
          </SimpleGrid>
          <Button
            variant="outline"
            colorScheme="orange"
            leftIcon={<RefreshCcw size={16} />}
            onClick={onClearAlertOpen}
            mt={4}
          >
            Clear Current / Start New
          </Button>
          <Text fontSize="sm" color="gray.500" pt={8}>
            &copy; {new Date().getFullYear()} Estimator Pro. All rights
            reserved.
          </Text>
        </VStack>
      </Container>

      <Modal isOpen={isSaveModalOpen} onClose={onSaveModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Project Name</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Project Name</FormLabel>
              <Input
                placeholder="e.g., 'John Smith - Kitchen'"
                value={estimateName}
                onChange={(e) => setEstimateName(e.target.value)}
                autoFocus
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSaveModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveClick}
              isDisabled={!estimateName}
            >
              Save Name
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDownloadConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDownloadConfirmClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Download Estimate File?</AlertDialogHeader>
            <AlertDialogBody>
              Would you also like to download the .json file for this estimate?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDownloadConfirmClose}>
                No
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  onDownload();
                  onDownloadConfirmClose();
                }}
                ml={3}
              >
                Yes, Download
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isClearAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClearAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Current Estimate
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? All unsaved work in your current estimate will be
              reset to zero. This will not affect your saved projects.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClearAlertClose}>
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                onClick={() => {
                  onClearCurrent();
                  onClearAlertClose();
                }}
                ml={3}
              >
                Yes, Clear
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default HomePage;
