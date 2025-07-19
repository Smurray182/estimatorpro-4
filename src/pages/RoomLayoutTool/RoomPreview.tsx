import React, { useRef, useEffect } from "react";
import { Box } from "@chakra-ui/react";

interface Point {
  x: number;
  y: number;
}

interface RoomPreviewProps {
  vertices: Point[];
  isClosed: boolean;
}

const RoomPreview: React.FC<RoomPreviewProps> = ({ vertices, isClosed }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || vertices.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple viewport calculation to fit the shape
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

    const padding = 5; // Reduced padding for a tighter fit
    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;
    const scaleX =
      drawingWidth > 0 ? (canvas.width - padding * 2) / drawingWidth : 1;
    const scaleY =
      drawingHeight > 0 ? (canvas.height - padding * 2) / drawingHeight : 1;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = canvas.width / 2 - (minX + drawingWidth / 2) * scale;
    const offsetY = canvas.height / 2 - (minY + drawingHeight / 2) * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw shape
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach((v) => ctx.lineTo(v.x, v.y));
    if (isClosed) {
      ctx.closePath();
    }
    ctx.strokeStyle = "#3182CE"; // blue.500
    ctx.lineWidth = 2 / scale;
    ctx.stroke();
    if (isClosed) {
      ctx.fillStyle = "rgba(49, 130, 206, 0.2)"; // blue with opacity
      ctx.fill();
    }
    ctx.restore();
  }, [vertices, isClosed]);

  return (
    <Box
      w="60px"
      h="60px"
      bg="white"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
    >
      <canvas ref={canvasRef} width="60" height="60" />
    </Box>
  );
};

export default RoomPreview;
