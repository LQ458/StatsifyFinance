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
import domtoimage from "dom-to-image";
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
    setIsSelectionInProgress(false);
    onScreenshotEnd?.();
  }, [onScreenshotEnd]);

  // 添加ESC键退出功能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isSelecting || isQuestionVisible)) {
        endScreenshot();
      }
    };

    if (isSelecting || isQuestionVisible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSelecting, isQuestionVisible, endScreenshot]);

  const handleStartSelection = useCallback((e: React.MouseEvent) => {
    // 如果点击的是提示文字或退出按钮，不开始选择
    if (
      (e.target as HTMLElement).closest(".screenshot-hint") ||
      (e.target as HTMLElement).closest(".screenshot-exit")
    ) {
      return;
    }

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
      // 临时移除所有可能导致oklab错误的样式
      const originalStyles = new Map();
      const styleSheets = Array.from(document.styleSheets);

      // 保存并移除所有外部样式表
      styleSheets.forEach((sheet, index) => {
        try {
          if (
            sheet.href &&
            (sheet.href.includes("stagewise") || sheet.href.includes("toolbar"))
          ) {
            originalStyles.set(index, sheet.disabled);
            sheet.disabled = true;
          }
        } catch (e) {
          // 跨域样式表可能无法访问
        }
      });

      // 临时隐藏所有stagewise相关元素
      const stagewiseElements = document.querySelectorAll(
        '[class*="stagewise"], [id*="stagewise"], [class*="toolbar"]',
      );
      const originalDisplays = new Map();
      stagewiseElements.forEach((el, index) => {
        if (el instanceof HTMLElement) {
          originalDisplays.set(index, el.style.display);
          el.style.display = "none";
        }
      });

      const canvas = await html2canvas(document.body, {
        x: left,
        y: top,
        width,
        height,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        ignoreElements: (element) => {
          // 更全面的忽略规则，修复类型错误
          const className =
            typeof element.className === "string" ? element.className : "";
          const id = typeof element.id === "string" ? element.id : "";

          return (
            element.classList.contains("stagewise-companion-anchor") ||
            element.classList.contains("stagewise-toolbar") ||
            id.includes("stagewise") ||
            className.includes("stagewise") ||
            className.includes("toolbar") ||
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE"
          );
        },
        onclone: (clonedDoc) => {
          // 在克隆的文档中移除所有可能导致问题的元素和样式
          const problematicElements = clonedDoc.querySelectorAll(
            '[class*="stagewise"], [id*="stagewise"], [class*="toolbar"], script, style',
          );
          problematicElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.remove();
            }
          });

          // 移除所有外部样式表链接
          const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          links.forEach((link) => {
            if (
              link.getAttribute("href")?.includes("stagewise") ||
              link.getAttribute("href")?.includes("toolbar")
            ) {
              link.remove();
            }
          });
        },
      });

      // 恢复原始样式和显示状态
      styleSheets.forEach((sheet, index) => {
        if (originalStyles.has(index)) {
          sheet.disabled = originalStyles.get(index);
        }
      });

      stagewiseElements.forEach((el, index) => {
        if (el instanceof HTMLElement && originalDisplays.has(index)) {
          el.style.display = originalDisplays.get(index);
        }
      });

      const image = canvas.toDataURL("image/png");
      setCapturedImage(image);
      setIsQuestionVisible(true);
      console.log("Screenshot captured, showing question panel");
    } catch (error) {
      console.error("Screenshot failed:", error);

      // 如果第一种方法失败，尝试更激进的方案
      try {
        console.log("Trying fallback screenshot method...");

        // 使用dom-to-image库，支持现代CSS颜色函数
        console.log("Trying dom-to-image screenshot method...");

        try {
          // 直接截取整个页面，然后在Canvas中裁剪选中区域
          const dataUrl = await domtoimage.toPng(document.body, {
            width: window.innerWidth,
            height: window.innerHeight,
            style: {
              transform: "none",
              "transform-origin": "top left",
            },
            filter: (node) => {
              // 过滤掉截图相关的元素
              if (node instanceof HTMLElement) {
                const className = node.className || "";
                const id = node.id || "";
                return (
                  !className.includes("screen-capture") &&
                  !id.includes("screen-capture") &&
                  !className.includes("stagewise") &&
                  !id.includes("stagewise")
                );
              }
              return true;
            },
          });

          // 将dataUrl转换为canvas并裁剪选中区域
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // 裁剪选中区域
              ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
              const image = canvas.toDataURL("image/png");
              setCapturedImage(image);
              setIsQuestionVisible(true);
              console.log("dom-to-image screenshot captured successfully");
            }
          };
          img.src = dataUrl;
        } catch (domError) {
          console.error("dom-to-image failed:", domError);

          // 备用方案：使用html2canvas
          const canvas = await html2canvas(document.body, {
            x: left,
            y: top,
            width,
            height,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            ignoreElements: (element) => {
              const className =
                typeof element.className === "string" ? element.className : "";
              const id = typeof element.id === "string" ? element.id : "";
              return (
                className.includes("stagewise") || id.includes("stagewise")
              );
            },
          });

          const image = canvas.toDataURL("image/png");
          setCapturedImage(image);
          setIsQuestionVisible(true);
          console.log("html2canvas fallback screenshot captured successfully");
        }
      } catch (fallbackError) {
        console.error("Fallback screenshot also failed:", fallbackError);
        endScreenshot();
      }
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
            zIndex: 10001,
          }}
        >
          {isSelecting && (
            <div
              onMouseDown={handleStartSelection}
              onMouseMove={handleSelection}
              onMouseUp={handleEndSelection}
              style={{ width: "100%", height: "100%" }}
            >
              {/* 退出按钮 */}
              <button
                className="screenshot-exit"
                onClick={endScreenshot}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  zIndex: 10002,
                }}
                title="退出截图 (ESC)"
              >
                ✕
              </button>

              {/* 提示信息 */}
              <div
                className={`screenshot-hint ${styles.hint}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "white",
                  padding: "15px 25px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  textAlign: "center",
                  zIndex: 10002,
                  pointerEvents: "none",
                }}
              >
                {t("hint")}
                <div
                  style={{ fontSize: "14px", marginTop: "8px", opacity: 0.8 }}
                >
                  按 ESC 键退出
                </div>
              </div>

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
              {/* 退出按钮 */}
              <button
                className="screenshot-exit"
                onClick={endScreenshot}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  zIndex: 10002,
                }}
                title="退出截图 (ESC)"
              >
                ✕
              </button>

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
