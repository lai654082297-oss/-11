import { FilesetResolver, GestureRecognizer, DrawingUtils } from "@mediapipe/tasks-vision";
import { GestureState } from "../types";

let gestureRecognizer: GestureRecognizer | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: runningMode,
    numHands: 1
  });
  console.log("Gesture Recognizer Loaded");
};

export const predictWebcam = (
  video: HTMLVideoElement, 
  onGesture: (gesture: GestureState, xPos: number) => void
) => {
  if (!gestureRecognizer) return;

  const nowInMs = Date.now();
  const results = gestureRecognizer.recognizeForVideo(video, nowInMs);

  let detectedGesture = GestureState.NONE;
  let xPos = 0.5;

  if (results.gestures.length > 0) {
    const categoryName = results.gestures[0][0].categoryName;
    const hand = results.landmarks[0];
    
    // Calculate simple average X position of the hand
    if (hand && hand.length > 0) {
        xPos = hand[0].x; // Wrist position usually
    }

    if (categoryName === "Open_Palm") {
      detectedGesture = GestureState.OPEN_PALM;
    } else if (categoryName === "Closed_Fist") {
      detectedGesture = GestureState.CLOSED_FIST;
    } else {
        // Just tracking movement if hand is present but gesture is neutral
        detectedGesture = GestureState.NONE;
    }
    
    // Override NONE with movement hints based on position
    if (detectedGesture === GestureState.NONE) {
        if (xPos < 0.3) detectedGesture = GestureState.MOVING_LEFT;
        else if (xPos > 0.7) detectedGesture = GestureState.MOVING_RIGHT;
    }
  }

  onGesture(detectedGesture, xPos);
};
