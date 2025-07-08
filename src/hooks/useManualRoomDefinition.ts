import { useCallback, useState } from 'react';
import { Point } from '@/types';

export interface RoomBoundary {
  id: string;
  points: Point[];
  isComplete: boolean;
  name: string;
  properties: {
    floorMaterial?: string;
    ceilingMaterial?: string;
    wallHeight?: number;
    area?: number;
  };
  color: string;
}

interface ManualRoomState {
  isDefining: boolean;
  currentRoom: RoomBoundary | null;
  rooms: RoomBoundary[];
  editingRoom: string | null;
}

interface UseManualRoomDefinitionProps {
  onRoomsChange: (rooms: RoomBoundary[]) => void;
  rooms: RoomBoundary[];
  snapToGuides?: (point: Point) => { snapped: boolean; snapPoint: Point };
  enabled?: boolean;
}

export const useManualRoomDefinition = ({
  onRoomsChange,
  rooms,
  snapToGuides,
  enabled = true
}: UseManualRoomDefinitionProps) => {
  const [roomState, setRoomState] = useState<ManualRoomState>({
    isDefining: false,
    currentRoom: null,
    rooms,
    editingRoom: null
  });

  // Start defining a new room
  const startRoomDefinition = useCallback((name?: string) => {
    if (!enabled) return;

    const newRoom: RoomBoundary = {
      id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: [],
      isComplete: false,
      name: name || `Room ${rooms.length + 1}`,
      properties: {
        wallHeight: 96, // Default 8 feet in inches
      },
      color: `hsl(${Math.random() * 360}, 70%, 85%)`
    };

    setRoomState(prev => ({
      ...prev,
      isDefining: true,
      currentRoom: newRoom
    }));
  }, [enabled, rooms.length]);

  // Add a point to the current room boundary
  const addPointToRoom = useCallback((point: Point) => {
    if (!roomState.isDefining || !roomState.currentRoom) return;

    // Apply snap to guides if available
    let finalPoint = point;
    if (snapToGuides) {
      const snapResult = snapToGuides(point);
      if (snapResult.snapped) {
        finalPoint = snapResult.snapPoint;
      }
    }

    // Check if we're close to the starting point to close the room
    const startPoint = roomState.currentRoom.points[0];
    const isClosingRoom = startPoint && 
      roomState.currentRoom.points.length >= 3 &&
      Math.sqrt(
        Math.pow(finalPoint.x - startPoint.x, 2) + 
        Math.pow(finalPoint.y - startPoint.y, 2)
      ) < 20;

    if (isClosingRoom) {
      // Close the room
      completeRoom();
    } else {
      // Add the point
      setRoomState(prev => ({
        ...prev,
        currentRoom: prev.currentRoom ? {
          ...prev.currentRoom,
          points: [...prev.currentRoom.points, finalPoint]
        } : null
      }));
    }
  }, [roomState.isDefining, roomState.currentRoom, snapToGuides]);

  // Complete the current room
  const completeRoom = useCallback(() => {
    if (!roomState.currentRoom || roomState.currentRoom.points.length < 3) return;

    const completedRoom: RoomBoundary = {
      ...roomState.currentRoom,
      isComplete: true,
      properties: {
        ...roomState.currentRoom.properties,
        area: calculateRoomArea(roomState.currentRoom.points)
      }
    };

    const updatedRooms = [...rooms, completedRoom];
    onRoomsChange(updatedRooms);

    setRoomState(prev => ({
      ...prev,
      isDefining: false,
      currentRoom: null,
      rooms: updatedRooms
    }));
  }, [roomState.currentRoom, rooms, onRoomsChange]);

  // Cancel current room definition
  const cancelRoomDefinition = useCallback(() => {
    setRoomState(prev => ({
      ...prev,
      isDefining: false,
      currentRoom: null
    }));
  }, []);

  // Calculate room area using shoelace formula
  const calculateRoomArea = useCallback((points: Point[]): number => {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  }, []);

  // Remove a room
  const removeRoom = useCallback((roomId: string) => {
    const updatedRooms = rooms.filter(room => room.id !== roomId);
    onRoomsChange(updatedRooms);
    setRoomState(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  }, [rooms, onRoomsChange]);

  // Update room properties
  const updateRoomProperties = useCallback((roomId: string, properties: Partial<RoomBoundary['properties']>) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId 
        ? { ...room, properties: { ...room.properties, ...properties } }
        : room
    );
    onRoomsChange(updatedRooms);
    setRoomState(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  }, [rooms, onRoomsChange]);

  // Update room name
  const updateRoomName = useCallback((roomId: string, name: string) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, name } : room
    );
    onRoomsChange(updatedRooms);
    setRoomState(prev => ({
      ...prev,
      rooms: updatedRooms
    }));
  }, [rooms, onRoomsChange]);

  // Start editing a room boundary
  const startEditingRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    setRoomState(prev => ({
      ...prev,
      isDefining: true,
      editingRoom: roomId,
      currentRoom: { ...room, isComplete: false }
    }));

    // Remove the room from the list temporarily
    const updatedRooms = rooms.filter(r => r.id !== roomId);
    onRoomsChange(updatedRooms);
  }, [rooms, onRoomsChange]);

  // Move a point in the current room
  const moveRoomPoint = useCallback((pointIndex: number, newPosition: Point) => {
    if (!roomState.currentRoom) return;

    // Apply snap to guides if available
    let finalPosition = newPosition;
    if (snapToGuides) {
      const snapResult = snapToGuides(newPosition);
      if (snapResult.snapped) {
        finalPosition = snapResult.snapPoint;
      }
    }

    const updatedPoints = [...roomState.currentRoom.points];
    updatedPoints[pointIndex] = finalPosition;

    setRoomState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom ? {
        ...prev.currentRoom,
        points: updatedPoints
      } : null
    }));
  }, [roomState.currentRoom, snapToGuides]);

  // Remove a point from the current room
  const removeRoomPoint = useCallback((pointIndex: number) => {
    if (!roomState.currentRoom || roomState.currentRoom.points.length <= 3) return;

    const updatedPoints = roomState.currentRoom.points.filter((_, index) => index !== pointIndex);

    setRoomState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom ? {
        ...prev.currentRoom,
        points: updatedPoints
      } : null
    }));
  }, [roomState.currentRoom]);

  // Get room at point (for selection)
  const getRoomAtPoint = useCallback((point: Point): RoomBoundary | null => {
    for (const room of rooms) {
      if (isPointInRoom(point, room.points)) {
        return room;
      }
    }
    return null;
  }, [rooms]);

  // Check if point is inside room using ray casting
  const isPointInRoom = useCallback((point: Point, roomPoints: Point[]): boolean => {
    if (roomPoints.length < 3) return false;

    let inside = false;
    let j = roomPoints.length - 1;

    for (let i = 0; i < roomPoints.length; i++) {
      const xi = roomPoints[i].x;
      const yi = roomPoints[i].y;
      const xj = roomPoints[j].x;
      const yj = roomPoints[j].y;

      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
      j = i;
    }

    return inside;
  }, []);

  // Generate SVG path for room
  const getRoomPath = useCallback((room: RoomBoundary): string => {
    if (room.points.length < 2) return '';

    const pathData = room.points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      } else {
        return `${path} L ${point.x} ${point.y}`;
      }
    }, '');

    return room.isComplete ? `${pathData} Z` : pathData;
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    switch (e.key) {
      case 'Escape':
        if (roomState.isDefining) {
          cancelRoomDefinition();
        }
        break;
      case 'Enter':
        if (roomState.isDefining && roomState.currentRoom && roomState.currentRoom.points.length >= 3) {
          completeRoom();
        }
        break;
      case 'r':
      case 'R':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          startRoomDefinition();
        }
        break;
    }
  }, [enabled, roomState.isDefining, roomState.currentRoom, cancelRoomDefinition, completeRoom, startRoomDefinition]);

  return {
    // State
    roomState,
    isDefiningRoom: roomState.isDefining,
    currentRoom: roomState.currentRoom,
    
    // Room management
    startRoomDefinition,
    addPointToRoom,
    completeRoom,
    cancelRoomDefinition,
    removeRoom,
    updateRoomProperties,
    updateRoomName,
    
    // Room editing
    startEditingRoom,
    moveRoomPoint,
    removeRoomPoint,
    
    // Utilities
    getRoomAtPoint,
    isPointInRoom,
    getRoomPath,
    calculateRoomArea,
    
    // Keyboard handling
    handleKeyDown
  };
};