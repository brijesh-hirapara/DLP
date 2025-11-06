import React, { useEffect, useState } from "react";
import { calculateTimeLeft } from "./timeUtils";

interface CountdownTimerProps {
  startTime: string;
  duration?: number; // in hours
  color?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startTime,
  duration = 24,
  color = "",
}) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!startTime) return;

    const updateTimer = () => {
      const { hours, minutes, seconds, expired } = calculateTimeLeft(startTime, duration);

      if (expired) {
        setTimeLeft("");
        return;
      }

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s Left`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, duration]);

  return (
    <span style={{ color, fontWeight: 500 }}>
      {timeLeft}
    </span>
  );
};
