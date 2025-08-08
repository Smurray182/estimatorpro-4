import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, Slide, useToast } from "@chakra-ui/react";
import * as serviceWorkerRegistration from "./registerServiceWorker";
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";
import useLocalStorage from "./hooks/useLocalStorage";
import RoomLayoutToolPage from "./pages/RoomLayoutTool/RoomLayoutToolPage";
import SavedRoomsPage from "./pages/RoomLayoutTool/SavedRoomsPage";
import ToolsPage from "./pages/Tools/ToolsPage";
import CalculatorPage from "./pages/Tools/CalculatorPage";
import FeetInchesCalculatorPage from "./pages/Tools/FeetInchesCalculatorPage";
import EstimateBuilderPage from "./pages/GeneralRemodelPlus/EstimateBuilderPage";
import NotesPage from "./pages/Notes/NotesPage";
import ReviewPage from "./pages/ReviewPage";
import ExportPage from "./pages/Export/ExportPage";
import ExportPDFPage from "./pages/ExportPDFPage";

// Interfaces for type safety
interface Point {
  x: number;
  y: number;
}
export interface Room {
  name: string;
  area: number;
  vertices: Point[];
  isClosed: boolean;
  savedAt: string;
}
export interface EstimateItem {
  id: string;
  title: string;
  category: string;
  costCode: string;
  unitCost: number;
  quantity?: number;
  unit?: string;
  markup: number;
  margin: number;
  description?: string;
}
export interface SavedNote {
  id: string;
  canvasData: string | null;
  textData: string;
}
export interface EstimateState {
  generalRemodel: EstimateItem[];
  masterBathroom: EstimateItem[];
  guestBathroom: EstimateItem[];
  kitchen: EstimateItem[];
  savedRooms: Room[];
  activeRoom: {
    vertices: Point[];
    isClosed: boolean;
  } | null;
  savedNotes: SavedNote[];
  projectName: string;
}

const initialEstimateState: EstimateState = {
  generalRemodel: [],
  masterBathroom: [],
  guestBathroom: [],
  kitchen: [],
  savedRooms: [],
  activeRoom: null,
  savedNotes: [],
  projectName: "",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [estimateData, setEstimateData, removeEstimateData] =
    useLocalStorage<EstimateState>("currentEstimate", initialEstimateState);
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );
  const toast = useToast();

  useEffect(() => {
    serviceWorkerRegistration.unregister();
  }, []);

  const handleUpdateAccepted = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowUpdate(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const navigateTo = (page: string) => {
    if (currentPage === "room-layout-tool" && page !== "room-layout-tool") {
      setEstimateData((prevData) => ({
        ...prevData,
        activeRoom: null,
      }));
    }
    setCurrentPage(page);
  };

  const handleSaveRoom = (roomData: Room) => {
    setEstimateData((prevData) => ({
      ...prevData,
      savedRooms: [...(prevData.savedRooms || []), roomData],
      activeRoom: null,
    }));
    toast({
      title: "Room Saved",
      description: `"${roomData.name}" was added to the estimate.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLoadRoom = (roomToLoad: Room) => {
    setEstimateData((prevData) => ({
      ...prevData,
      activeRoom: {
        vertices: roomToLoad.vertices,
        isClosed: roomToLoad.isClosed,
      },
    }));
    navigateTo("room-layout-tool");
  };

  const handleDeleteRoom = (roomSavedAt: string) => {
    setEstimateData((prevData) => ({
      ...prevData,
      savedRooms: prevData.savedRooms.filter(
        (room) => room.savedAt !== roomSavedAt
      ),
    }));
    toast({
      title: "Room Deleted",
      description: "The room layout has been removed.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStartNewRoom = () => {
    setEstimateData((prevData) => ({
      ...prevData,
      activeRoom: {
        vertices: [{ x: 0, y: 0 }],
        isClosed: false,
      },
    }));
    navigateTo("room-layout-tool");
  };

  const handleSetProjectName = (name: string) => {
    if (!name) return;
    setEstimateData((prev) => ({ ...prev, projectName: name }));
    toast({
      title: "Project Name Saved",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDownloadEstimate = () => {
    if (!estimateData.projectName) {
      toast({
        title: "Cannot Download",
        description: "Please save the project with a name first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const jsonString = JSON.stringify(estimateData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${estimateData.projectName}.json`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save estimate:", error);
      toast({
        title: "Error",
        description: "Could not create the download file.",
        status: "error",
      });
    }
  };

  const handleLoadEstimate = (newData: any) => {
    if (newData && Array.isArray(newData.generalRemodel)) {
      if (!newData.savedRooms) newData.savedRooms = [];
      if (!newData.activeRoom) newData.activeRoom = null;
      if (!newData.projectName) newData.projectName = "";
      setEstimateData(newData);
      toast({
        title: "Success",
        description: "Estimate loaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Load Failed",
        description: "This does not appear to be a valid estimate file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClearCurrent = () => {
    setEstimateData(initialEstimateState);
    navigateTo("home");
    removeEstimateData();
    toast({
      title: "Estimate Cleared",
      description: "Your current work has been reset.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleClearAll = () => {
    localStorage.clear();
    setEstimateData(initialEstimateState);
    navigateTo("home");
    toast({
      title: "All Data Cleared",
      description: "All saved data has been removed.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };

  const calculateTotal = (items: EstimateItem[]): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce(
      (sum, item) => sum + item.unitCost * (item.quantity || 1),
      0
    );
  };

  const totals = {
    generalRemodel: useMemo(
      () => calculateTotal(estimateData.generalRemodel),
      [estimateData.generalRemodel]
    ),
    masterBathroom: useMemo(
      () => calculateTotal(estimateData.masterBathroom),
      [estimateData.masterBathroom]
    ),
    guestBathroom: useMemo(
      () => calculateTotal(estimateData.guestBathroom),
      [estimateData.guestBathroom]
    ),
    kitchen: useMemo(
      () => calculateTotal(estimateData.kitchen),
      [estimateData.kitchen]
    ),
  };

  const renderPage = () => {
    const pageProps = {
      onNavigate: navigateTo,
      estimateData,
      setEstimateData,
      onSetName: handleSetProjectName,
      onDownload: handleDownloadEstimate,
      onLoad: handleLoadEstimate,
      onClearCurrent: handleClearCurrent,
      onClearAll: handleClearAll,
      projectName: estimateData.projectName,
    };

    switch (currentPage) {
      case "home":
        return (
          <HomePage
            {...pageProps}
            totals={totals}
            onStartNewRoom={handleStartNewRoom}
          />
        );
      case "general-remodel-plus":
        return (
          <EstimateBuilderPage
            {...pageProps}
            remodelType="generalRemodel"
            title="General Remodel +"
          />
        );
      case "master-bathroom":
        return (
          <EstimateBuilderPage
            {...pageProps}
            remodelType="masterBathroom"
            title="Master Bathroom"
          />
        );
      case "guest-bathroom":
        return (
          <EstimateBuilderPage
            {...pageProps}
            remodelType="guestBathroom"
            title="Guest Bathroom"
          />
        );
      case "kitchen":
        return (
          <EstimateBuilderPage
            {...pageProps}
            remodelType="kitchen"
            title="Kitchen"
          />
        );
      case "tools":
        return <ToolsPage {...pageProps} />;
      case "calculator":
        return <CalculatorPage {...pageProps} />;
      case "feet-inches-calculator":
        return <FeetInchesCalculatorPage {...pageProps} />;
      case "room-layout-tool":
        return (
          <RoomLayoutToolPage
            {...pageProps}
            onSaveRoom={handleSaveRoom}
            initialRoom={estimateData.activeRoom}
          />
        );
      case "saved-rooms":
        return (
          <SavedRoomsPage
            {...pageProps}
            rooms={estimateData.savedRooms}
            onLoadRoom={handleLoadRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        );
      case "notes":
        return <NotesPage {...pageProps} />;
      case "review":
        return <ReviewPage {...pageProps} />;
      case "export":
        return <ExportPage {...pageProps} />;
      case "export-pdf":
        return <ExportPDFPage {...pageProps} />;
      default:
        return (
          <HomePage
            {...pageProps}
            totals={totals}
            onStartNewRoom={handleStartNewRoom}
          />
        );
    }
  };

  return (
    <Box position="relative" minH="100vh">
      <div className="font-sans">
        <style>{`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none; margin: 0;
          }
          input[type=number] { -moz-appearance: textfield; }
        `}</style>
        {renderPage()}
      </div>
      <Footer />
      <Slide direction="bottom" in={showUpdate} style={{ zIndex: 20 }}>
        <Box
          p="4"
          color="white"
          bg="blue.500"
          roundedTop="md"
          shadow="lg"
          textAlign="center"
        >
          A new version of the app is available.
          <Button
            colorScheme="whiteAlpha"
            variant="outline"
            size="sm"
            ml={4}
            onClick={handleUpdateAccepted}
          >
            Refresh
          </Button>
        </Box>
      </Slide>
    </Box>
  );
}
