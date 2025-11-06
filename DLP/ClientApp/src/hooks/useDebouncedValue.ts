import { useEffect, useState } from "react";

interface Props {
  value: string;
  delay: number;
}

export const useDebouncedValue = ({ delay, value }: Props) => {
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
