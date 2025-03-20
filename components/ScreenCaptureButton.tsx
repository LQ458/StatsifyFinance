import { CameraOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import styles from "@/src/css/screen-capture.module.css";

interface ScreenCaptureButtonProps {
  onStartScreenshot: () => void;
}

export default function ScreenCaptureButton({
  onStartScreenshot,
}: ScreenCaptureButtonProps) {
  const t = useTranslations("common.screencapture");

  return (
    <button className={styles.captureButton} onClick={onStartScreenshot}>
      <CameraOutlined />
      {t("capture")}
    </button>
  );
}
