declare module "react-select-country-list" {
    export interface CountryOption {
      value: string;
      label: string;
    }
  
    interface CountryList {
      getData: () => CountryOption[];
      getLabel: (value: string) => string;
      getValue: (label: string) => string;
    }
  
    export default function countryList(): CountryList;
  }
  