import { GpuBuffer, Results } from "@mediapipe/hands";
import { RefObject } from "react";

interface DisplayResultsParams {
  results: Results;
  canvasHandRef: RefObject<HTMLCanvasElement>;
  canvasVideoRef: RefObject<HTMLCanvasElement>;
  showVideoPlayback?: boolean;
  elements?: RefObject<HTMLElement>[];
}

function drawVideoPlayback(image: GpuBuffer, canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    console.warn("Could not get video canvas element");
    return;
  }

  const canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) {
    console.warn("Could not get video canvas context");
    return;
  }

  canvasCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function displayResults(params: DisplayResultsParams): boolean[] {
  const {
    results,
    canvasHandRef,
    canvasVideoRef,
    showVideoPlayback,
    elements,
  } = params;

  if (!canvasHandRef.current) {
    throw new Error("Could not get canvas element");
  }

  const canvasHandCtx = canvasHandRef.current.getContext("2d");
  if (!canvasHandCtx) {
    throw new Error("Could not get hand canvas context");
  }

  const canvasHandWidth = canvasHandRef.current.width;
  const canvasHandHeight = canvasHandRef.current.height;

  // Clear the canvas before update the hand position
  canvasHandCtx.clearRect(0, 0, canvasHandWidth, canvasHandHeight);
  canvasHandCtx.fill();

  // Draw the video frame
  if (showVideoPlayback) {
    drawVideoPlayback(results.image, canvasVideoRef.current);
  }

  // Initialize overlaps array - will be populated if elements are provided
  let overlaps: boolean[] = [];
  if (elements) {
    overlaps = elements.map(() => false);
  }

  // Draw the hand if detected
  if (results.multiHandLandmarks.length > 0) {
    const hand = results.multiHandLandmarks[0][9];

    canvasHandCtx.beginPath();
    canvasHandCtx.font = "48px sans-serif";
    canvasHandCtx.fillText(
      "🤚",
      hand.x * canvasHandRef.current.width - 30,
      hand.y * canvasHandRef.current.height + 50
    );
    canvasHandCtx.fill();

    // Check if hand overlaps elements
    const handX = hand.x * canvasHandRef.current.width;
    const handY = hand.y * canvasHandRef.current.height + 50;

    if (elements) {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element.current) {
          overlaps[i] = false;
          continue;
        }
        const elementRect = element.current.getBoundingClientRect();
        if (
          handX >= elementRect.x - 20 &&
          handX <= elementRect.x + elementRect.width && // Overlaps X axis
          handY >= elementRect.y - 20 &&
          handY <= elementRect.y + elementRect.height + 20 // Overlaps Y axis
        ) {
          overlaps[i] = true;
        } else {
          overlaps[i] = false;
        }
      }
    }
  }

  return overlaps;
}

export { displayResults };
