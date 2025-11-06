import { useState } from "react";

export enum LocalStorageKeys {
  user = "user",
}

export const useLocalStorage = (
  key: LocalStorageKeys,
  initialValue: any,
  useSearch = false
) => {
  const getItemBySearch = (search: any) => {
    let values = Object.keys(localStorage)
      .filter((key) => key.includes(search))
      .map((key) => localStorage[key]);
    return values;
  };

  const [value, setStateValue] = useState(() => {
    try {
      const item: any = useSearch
        ? getItemBySearch(key)
        : window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (v: any) => {
    try {
      setStateValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  };

  const deleteValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStateValue(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  return [value, setValue, deleteValue, getItemBySearch];
};
