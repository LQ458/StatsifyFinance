"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { useTranslations } from "next-intl";
import { CameraOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";
import { createPortal } from "react-dom";
import styles from "@/src/css/screen-capture.module.css";

interface ScreenCaptureProps {
  onCapture: (image: string, question: string) => void;
  onScreenshotEnd?: () => void;
  isSelecting: boolean;
  onQuestionSelected?: () => void;
}

interface Position {
  x: number;
  y: number;
}

export default function ScreenCapture({
  onCapture,
  onScreenshotEnd,
  isSelecting,
  onQuestionSelected,
}: ScreenCaptureProps) {
  const t = useTranslations("common.screencapture");
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [currentPos, setCurrentPos] = useState<Position | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false);
  const selectionRef = useRef<HTMLDivElement>(null);

  const endScreenshot = useCallback(() => {
    console.log("Ending screenshot...");
    setIsQuestionVisible(false);
    setCapturedImage(null);
    setStartPos(null);
    setCurrentPos(null);
    onScreenshotEnd?.();
  }, [onScreenshotEnd]);

  const handleStartSelection = useCallback((e: React.MouseEvent) => {
    const pos = {
      x: e.pageX,
      y: e.pageY,
    };
    setStartPos(pos);
    setCurrentPos(pos);
    setIsSelectionInProgress(true);
  }, []);

  const handleSelection = useCallback(
    (e: React.MouseEvent) => {
      if (!startPos || !isSelectionInProgress) return;
      setCurrentPos({
        x: e.pageX,
        y: e.pageY,
      });
    },
    [startPos, isSelectionInProgress],
  );

  const handleEndSelection = useCallback(async () => {
    if (!startPos || !currentPos) return;
    setIsSelectionInProgress(false);

    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width < 10 || height < 10) {
      setStartPos(null);
      setCurrentPos(null);
      endScreenshot();
      return;
    }

    try {
      const canvas = await html2canvas(document.body, {
        x: left,
        y: top,
        width,
        height,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const image = canvas.toDataURL("image/png");
      setCapturedImage(image);
      setIsQuestionVisible(true);
    } catch (error) {
      console.error("Screenshot failed:", error);
      endScreenshot();
    }
  }, [startPos, currentPos, endScreenshot]);

  const handleQuestionSelect = (question: string) => {
    if (capturedImage) {
      onCapture(capturedImage, question);
      endScreenshot();
      onQuestionSelected?.();
    }
  };

  const getSelectionStyle = () => {
    if (!startPos || !currentPos) return {};

    const left = Math.min(startPos.x, currentPos.x);
    const top = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  // 只返回选择UI
  return (
    <>
      {(isSelecting || isQuestionVisible) && (
        <div
          className={styles.overlay}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {isSelecting && (
            <div
              onMouseDown={handleStartSelection}
              onMouseMove={handleSelection}
              onMouseUp={handleEndSelection}
              style={{ width: "100%", height: "100%" }}
            >
              <div className={styles.hint}>{t("hint")}</div>
              {startPos && currentPos && (
                <div
                  ref={selectionRef}
                  className={styles.selection}
                  style={getSelectionStyle()}
                />
              )}
            </div>
          )}

          {isQuestionVisible && capturedImage && (
            <div className={styles.questionPanel}>
              <h3>{t("questions.title")}</h3>
              <div className={styles.questionList}>
                <button
                  onClick={() => handleQuestionSelect(t("questions.explain"))}
                >
                  {t("questions.explain")}
                </button>
                <button
                  onClick={() => handleQuestionSelect(t("questions.concept"))}
                >
                  {t("questions.concept")}
                </button>
                <button
                  onClick={() => handleQuestionSelect(t("questions.example"))}
                >
                  {t("questions.example")}
                </button>
                <button
                  onClick={() => handleQuestionSelect(t("questions.suggest"))}
                >
                  {t("questions.suggest")}
                </button>
              </div>
              <img
                src={capturedImage}
                alt="Preview"
                className={styles.preview}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
