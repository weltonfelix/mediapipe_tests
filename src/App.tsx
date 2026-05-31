import { useRef, useEffect, useState } from "react";

import Webcam from "react-webcam";

import { Hands, Results, VERSION } from "@mediapipe/hands";
import * as Cam from "@mediapipe/camera_utils";

import { displayResults } from "./utils/hand_recognition";

import "./style.css";

const HANDS_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}`;
const resolveHandsFile = (file: string) => `${HANDS_BASE_URL}/${file}`;

function App() {
  var numberValue = 0;
  const [number, setNumber] = useState(0);
  const [camStatus, setCamStatus] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasHandRef = useRef<HTMLCanvasElement>(null);
  const canvasVideoRef = useRef<HTMLCanvasElement>(null);

  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const minusButtonRef = useRef<HTMLButtonElement>(null);

  const camButtonRef = useRef<HTMLButtonElement>(null);

  function onResults(results: Results) {
    const elements = [plusButtonRef, minusButtonRef, camButtonRef];

    const overlaps = displayResults({
      results,
      canvasHandRef,
      canvasVideoRef,
      showVideoPlayback: camStatus,
      elements,
    });

    if (overlaps) {
      if (overlaps[0]) {
        numberValue++;
        setNumber(numberValue);
      } else if (overlaps[1]) {
        numberValue--;
        setNumber(numberValue);
      } else if (overlaps[2]) {
        setCamStatus(true);
      }
    }
  }

  // Starts hands recognition
  useEffect(() => {
    const hands = new Hands({
      locateFile: resolveHandsFile,
    });

    hands.setOptions({
      selfieMode: true,
      maxNumHands: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    let mediapipeCamera: Cam.Camera | null = null;
    let videoCheckInterval: ReturnType<typeof setInterval> | null = null;

    const startHandTracking = () => {
      const image = webcamRef.current?.video;
      if (!image || image.readyState < 2) {
        return false;
      }

      mediapipeCamera = new Cam.Camera(image, {
        onFrame: async () => {
          await hands.send({ image });
        },
        width: image.videoWidth || image.width,
        height: image.videoHeight || image.height,
      });

      mediapipeCamera.start();
      return true;
    };

    if (!startHandTracking()) {
      videoCheckInterval = setInterval(() => {
        if (startHandTracking() && videoCheckInterval) {
          clearInterval(videoCheckInterval);
          videoCheckInterval = null;
        }
      }, 200);
    }

    return () => {
      if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
      }
      mediapipeCamera?.stop();
      hands.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camStatus]);
  return (
    <>
      <Webcam ref={webcamRef} hidden />
      {!camStatus && (number < -50 || number > 50) && (
        <button className="controlCam" ref={camButtonRef}>
          Show 📷
        </button>
      )}
      <div id="control">
        <button className="minusButton bg" ref={minusButtonRef}>
          -
        </button>
        <div className="bg">
          <h1 id="counter">{number}</h1>
        </div>
        <button className="plusButton bg" ref={plusButtonRef}>
          +
        </button>
      </div>
      <canvas
        className="handCanvas"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasHandRef}
      ></canvas>
      <canvas
        className="videoPlaybackCanvas"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasVideoRef}
      ></canvas>
    </>
  );
}

export default App;
