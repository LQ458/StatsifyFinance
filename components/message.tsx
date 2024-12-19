import { useEffect, useState } from "react";

type TipType = "success" | "warning" | "error";

interface TipProps {
  type: TipType;
  message: string;
  duration?: number; // 自动关闭的时间，默认2秒
  onClose: () => void;
}

const Message = ({ type, message, duration = 2000, onClose }: TipProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 在组件渲染后短暂延迟，触发淡入效果
    setTimeout(() => setVisible(true), 10);

    // 按定时隐藏组件
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // 等待淡出动画结束后调用关闭
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`tip tip-${type} ${visible ? "fade-in" : "fade-out"} ss-tip`}
    >
      <span className="tip-message">{message}</span>
      <button className="tip-close" onClick={() => setVisible(false)}></button>
    </div>
  );
};

export default Message;
