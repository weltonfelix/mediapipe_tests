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

function displayResults(params: DisplayResultsParams): boolean[] | void {
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
    let overlaps: boolean[] = [];

    const handX = hand.x * canvasHandRef.current.width;
    const handY = hand.y * canvasHandRef.current.height + 50;

    if (elements) {
      for (let element of elements) {
        if (!element.current) {
          overlaps.push(false);
          continue;
        }
        const elementRect = element.current.getBoundingClientRect();
        if (
          handX >= elementRect.x - 20 &&
          handX <= elementRect.x + elementRect.width && // Overlaps X axis
          handY >= elementRect.y - 20 &&
          handY <= elementRect.y + elementRect.height + 20 // Overlaps Y axis
        ) {
          overlaps.push(true);
        } else {
          overlaps.push(false);
        }
      }

      return overlaps;
    }

    // if (
    //   handX >= coords.x - 20 &&
    //   handX <= coords.x + coords.width &&
    //   handY >= coords.y - 20 &&
    //   handY <= coords.y + coords.height + 20
    // ) {
    //   countersec++;
    //   if (!stopup) {
    //     setHands(`${countersec}`);
    //     stopdown = false;
    //   }
    //   if (countersec >= 30) {
    //     setHands("👍");
    //     countersec = 0;
    //     stopup = true;
    //   }
    // }
    // if (
    //   handX >= coords2.x - 20 &&
    //   handX <= coords2.x + coords2.width &&
    //   handY >= coords2.y - 20 &&
    //   handY <= coords2.y + coords2.height + 20
    // ) {
    //   countersec++;
    //   if (!stopdown) {
    //     setHands(`${countersec}`);
    //     stopup = false;
    //   }
    //   if (countersec >= 30) {
    //     setHands("👎");
    //     countersec = 0;
    //     stopdown = true;
    //   }
    // }
  }
}

export { displayResults };
