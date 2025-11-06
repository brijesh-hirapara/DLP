import openNotificationWithIcon from "./notification";
type QueryValue = string | string[];

/**
 * Return ellipsis of a given string
 * @param text
 * @param size
 */
const ellipsis = (text: string, size: number): string => {
  return `${text.split(" ").slice(0, size).join(" ")}...`;
};

const truncate = (text: string, size: number): string =>
  text.length > size ? `${text.substring(0, size)}...` : text;

interface ServerError {
  errors?: Record<string, string[]>;
  detail?: string;
}

interface ErrorType {
  response?: {
    status: number;
    data: ServerError;
  };
  title?: string;
}

const showServerErrors = (error: ErrorType): void => {
  const _error = { ...error };

  if (_error.response && [400, 500].includes(_error.response.status)) {
    const serverError = _error.response.data;
    let errorMessages = "";
    if (serverError.errors) {
      Object.keys(serverError.errors).forEach((key) => {
        errorMessages += serverError.errors![key].join("\n");
      });
    } else if (serverError.detail) {
      errorMessages += serverError.detail;
    }

    openNotificationWithIcon("error", error.title || "", errorMessages);
  } else if (_error.response && _error.response.status === 401) {
    window.location.replace("/authentication/login");
  } else if (_error.response && _error.response.status === 403) {
    window.location.replace("/error/403");
  } else if (_error.response && _error.response.status === 404) {
    window.location.replace("/error/404");
  }
};

const actionCreator = <T>(type: string, payload: T = {} as T) => {
  return { type, payload };
};

const getAdjustedFilters = (filters: Record<string, { value?: any } | any>) => {
  const adjustedFilters: Record<string, any> = {};
  if (filters) {
    Object.keys(filters).forEach((x) => {
      const item = filters[x];
      if (item) {
        adjustedFilters[x] = item.value || item;
      }
    });
  }
  return adjustedFilters;
};

/**
 *
 * @param filters
 * @returns object
 */
const formatObjectFiltersFromSelect = (
  filters: Record<string, { value?: string } | boolean>
) => {
  let objectFilters: Record<string, string | boolean> = {};

  Object.entries(filters).forEach(([key, e]) => {
    if (typeof e === "boolean") {
      objectFilters[key] = e;
    } else {
      objectFilters[key] = e?.value || "";
    }
  });

  return objectFilters;
};

interface LocationProps {
  pathname: string;
  search?: string;
  hash?: string;
}

function getLocationId({ pathname, search, hash }: LocationProps): string {
  return pathname + (search ? "?" + search : "") + (hash ? "#" + hash : "");
}

const getFilteredSearchParamsByKey = (
  key: string,
  params: URLSearchParams = new URLSearchParams(window.location.search)
) => {
  params.delete(key);
  return params.toString();
};

const base64Encode = (str: string): string => btoa(str);

const parseQueryAsNumber = (value: QueryValue, defaultValue?: number): number | undefined => {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (!value) return defaultValue;

  const intValue = parseFloat(value.replace(',', '.'));
  return !isNaN(intValue)
    ? intValue
    : defaultValue;
};

const parseQueryAsEnum = <T>(value: QueryValue, defaultValue?: T): T | null | undefined => {
  if (value === '' || value === null) {
    return null;
  }

  const valueActual = parseQueryAsNumber(value) || value;
  return valueActual != null
    ? valueActual as unknown as T
    : defaultValue;
};

const humanFileSize = (size: number | null | undefined): string => {
  if (size == null) return '0 B';
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i) as any).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

const shortenFileName = (fileName: string | null | undefined, length: number = 10): string => {
  if (!fileName) return '';
  // Check if the input filename is already shorter than or equal to the target length
  if (fileName.length <= length) return fileName;

  // Extract file extension
  const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

  // Calculate the amount of characters to keep from the start and end of the filename
  const charsFromStart = (length - ext.length - 3) / 2;
  const charsFromEnd = length - ext.length - 3 - charsFromStart;

  // Return shortened file name
  return `${fileName.substr(0, charsFromStart)}...${fileName.substr(-charsFromEnd)}.${ext}`;
}

const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Allow only digits
  if (/^\d*$/.test(value)) {
      e.target.value = value;
  } else {
      e.preventDefault();
  }
};

const handleNumericInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const charCode = e.charCode || e.keyCode;
  // Allow only numeric keys and control keys like backspace, tab, etc.
  if (charCode < 48 || charCode > 57) {
      e.preventDefault();
  }
};

const formatLabel = (value: string): string => {
  if (!value) return "";
  // Replace dashes with space, lowercase all, then capitalize first letters
  return value
    .replace(/cemt/gi, "CEMT")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}



export {
  ellipsis,
  getFilteredSearchParamsByKey,
  truncate,
  actionCreator,
  showServerErrors,
  getAdjustedFilters,
  getLocationId,
  formatObjectFiltersFromSelect,
  base64Encode,
  parseQueryAsEnum,
  parseQueryAsNumber,
  shortenFileName,
  humanFileSize,
  handleNumericInputChange,
  handleNumericInputKeyPress,
  formatLabel
};
