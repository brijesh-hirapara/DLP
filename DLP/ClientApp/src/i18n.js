import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { LanguagesApi } from "api";

// Define the mapping of subdomains to language codes
const subdomainLanguageMap = {
  kgh: "bs",
  kghrs: "sr",
  kghbrcko: "bs",
  kghfbih: "bs",
};

// Function to extract subdomain from hostname
function getSubdomain(hostname) {
  // Split the hostname into parts
  const parts = hostname.split(".");

  // If the domain has at least three parts (e.g., subdomain.domain.com),
  // then the first part is the subdomain.
  // If the domain has fewer parts (e.g., localhost or domain.com), return an empty string.
  return parts.length >= 3 ? parts[0] : "";
}

// Extract the subdomain from the current hostname
const subdomain = getSubdomain(window.location.hostname);
const languagesApi = new LanguagesApi();
// const currentLang = await languagesApi.apiLanguagesI18nCodesGetForInstance();

const { data } = await languagesApi.apiLanguagesI18nCodesGetForInstance();
localStorage.setItem("Instance", data.instance || "MVTEO");
// Determine the language code based on the subdomain
// const currentLang = subdomainLanguageMap[subdomain] || "en";
const localURL = process.env.REACT_APP_API_URL;
//const basePath = window.location.hostname === 'localhost' ? "http://localhost:7111/" : "/";

// Base path based on the environment
const basePath = window.location.hostname.includes("localhost")
  ? localURL + "/"
  : "/";
  const currentLang  = localStorage.getItem("i18nextLng") ;

const options = {
  order: ["navigator", "localStorage"],
  caches: ["localStorage"],
  fallbackLng: ["en-US"],
  load: "currentOnly",
  saveMissing: true, // send not translated keys to endpoint
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  backend: {
    loadPath: basePath + "api/translations/{{lng}}",
    // loadPath: basePath + "api/translations/" + currentLang,
    addPath: basePath + "api/translations/en",
    crossDomain: false,
  },
  nsSeparator: false,
  keySeparator: false,
};

// i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init(options);
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(options)
  .then(() => {
const currentLang  = localStorage.getItem("i18nextLng") ;
 i18n.changeLanguage( currentLang || data.languageCodeForInstance || "en");
   });
//i18n.changeLanguage(currentLang);