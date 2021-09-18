/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";

import Webcam from "react-webcam";

import { Hands } from "@mediapipe/hands";
import * as Cam from "@mediapipe/camera_utils";

function App() {
  const [hands, setHands] = useState<string>("");

  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);
  const button2Ref = useRef<any>(null);

  var countersec = 0;
  var stopdown = false
  var stopup = false

  var camera = null;
  var canvasCtx: CanvasRenderingContext2D;

  function onResults(results: any) {
    canvasCtx.clearRect(0, 0, 1280, 720);
    canvasCtx.fill();
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        canvasCtx.beginPath();
        canvasCtx.font = "48px serif";

        const coords = buttonRef.current.getBoundingClientRect();
        const coords2 = button2Ref.current.getBoundingClientRect();

        const handX = landmarks[9].x * canvasRef.current.width;
        const handY = landmarks[9].y * canvasRef.current.height + 50;

        if (
          handX >= coords.x - 20 &&
          handX <= coords.x + coords.width &&
          handY >= coords.y - 20 &&
          handY <= coords.y + coords.height + 20
        ) {
          countersec++;
          if (!stopup) {
            setHands(`${countersec}`);
            stopdown = false;
          }
          if (countersec >= 30) {
            setHands("👍");
            countersec = 0;
            stopup = true;
          }
        }
        if (
          handX >= coords2.x - 20 &&
          handX <= coords2.x + coords2.width &&
          handY >= coords2.y - 20 &&
          handY <= coords2.y + coords2.height + 20
        ) {
          countersec++;
          if (!stopdown) {
            setHands(`${countersec}`);
            stopup = false;
          }
          if (countersec >= 30) {
            setHands("👎");
            countersec = 0;
            stopdown = true;
          }
        }

        canvasCtx.fillText(
          "🤚",
          landmarks[9].x * canvasRef.current.width - 30,
          landmarks[9].y * canvasRef.current.height + 50
        );

        canvasCtx.fillStyle = "yellow";
        canvasCtx.fill();
      }
    }
  }

  useEffect(() => {
    canvasCtx = canvasRef.current.getContext("2d");
    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      selfieMode: true,
      maxNumHands: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new Cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          const image = webcamRef.current.video;
          await hands.send({ image });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);
  return (
    <div>
      <h1>{hands}</h1>
      <Webcam ref={webcamRef} hidden />
      <button
        ref={buttonRef}
        style={{ marginLeft: "200px", marginTop: "200px" }}
      >
        YES
      </button>
      <button
        ref={button2Ref}
        style={{ marginLeft: "200px", marginTop: "200px" }}
      >
        NO
      </button>
      <canvas
        style={{ position: "absolute", top: 0, left: 0 }}
        className="output_canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      ></canvas>
    </div>
  );
}

export default App;
