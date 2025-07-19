import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Tag,
  Flex,
  ButtonGroup,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { ArrowLeft, Trash2, Download } from "lucide-react";
import { Room } from "../../App";
import RoomPreview from "./RoomPreview";

interface PageProps {
  onNavigate: (page: string) => void;
  rooms: Room[];
  onLoadRoom: (room: Room) => void;
  onDeleteRoom: (savedAt: string) => void;
}

const SavedRoomsPage: React.FC<PageProps> = ({
  onNavigate,
  rooms,
  onLoadRoom,
  onDeleteRoom,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const handleDeleteClick = (savedAt: string) => {
    setRoomToDelete(savedAt);
    onOpen();
  };

  const confirmDelete = () => {
    if (roomToDelete) {
      onDeleteRoom(roomToDelete);
    }
    onClose();
  };

  return (
    <>
      <Box p={8} bg="gray.50" minH="100vh">
        <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
          <Flex justify="space-between" align="center">
            <Button
              onClick={() => onNavigate("home")}
              colorScheme="gray"
              variant="ghost"
              leftIcon={<ArrowLeft />}
            >
              Back to Home
            </Button>
            <Heading as="h1" size="xl">
              Saved Rooms
            </Heading>
          </Flex>

          {rooms && rooms.length > 0 ? (
            // FIX: Changed from SimpleGrid to VStack for a list layout
            <VStack spacing={3} align="stretch">
              {rooms.map((room) => (
                // FIX: Card is now a Flex container for horizontal layout
                <Card key={room.savedAt} variant="outline" bg="white" size="sm">
                  <CardBody p={3}>
                    <Flex align="center" w="100%">
                      <HStack spacing={4}>
                        <RoomPreview
                          vertices={room.vertices}
                          isClosed={room.isClosed}
                        />
                        <VStack align="start" spacing={0}>
                          <Heading as="h3" size="sm" noOfLines={1}>
                            {room.name}
                          </Heading>
                          <Text fontSize="sm" color="gray.600">
                            {room.area.toFixed(2)} sq ft
                          </Text>
                        </VStack>
                      </HStack>
                      <Spacer />
                      <ButtonGroup spacing="2">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<Download size={14} />}
                          onClick={() => onLoadRoom(room)}
                        >
                          Load
                        </Button>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete room"
                          icon={<Trash2 size={14} />}
                          onClick={() => handleDeleteClick(room.savedAt)}
                        />
                      </ButtonGroup>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500" fontSize="lg" pt={4} textAlign="center">
              You haven't saved any room layouts yet.
            </Text>
          )}
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Room
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default SavedRoomsPage;
