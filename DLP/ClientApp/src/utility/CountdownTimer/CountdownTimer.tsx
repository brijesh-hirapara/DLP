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


// export const CountdownTimerForExpire: React.FC<CountdownTimerProps> = ({
//   startTime,
//   color = "",
// }) => {
//   const [timeLeft, setTimeLeft] = useState("");

//   useEffect(() => {
//     if (!startTime) return;

//     const targetTime = new Date(startTime).getTime();

//     const updateTimer = () => {
//       const now = new Date().getTime();
//       const diff = targetTime - now;

//       if (diff <= 0) {
//         setTimeLeft("Expired");
//         return;
//       }

//       const hours = Math.floor(diff / (1000 * 60 * 60));
//       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//       const seconds = Math.floor((diff % (1000 * 60)) / 1000);

//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s Left`);
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);

//     return () => clearInterval(interval);
//   }, [startTime]);

//   return (
//     <span style={{ color, fontWeight: 500 }}>
//       {timeLeft || "Expired"}
//     </span>
//   );
// };

export const CountdownTimerForExpire: React.FC<CountdownTimerProps> = ({
  startTime,
  color = "",
}) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!startTime) {
      setTimeLeft("Expired");
      return;
    }

    // ✅ Always interpret UTC properly
    const targetTime = new Date(
      typeof startTime === "string" && !startTime.endsWith("Z")
        ? `${startTime}Z`
        : startTime
    ).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Format with leading zeros (e.g. 02h 05m 09s)
      const formatted = `${hours}h ${minutes}m ${seconds
        .toString()
        .padStart(2, "0")}s Left`;
      setTimeLeft(formatted);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <span style={{ color, fontWeight: 500 }}>
      {timeLeft}
    </span>
  );
};
