import i18n from "i18next";
import { initReactI18next } from "react-i18next";
void i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        welcome: "A little clarity. A lot of possibility.",
        overview: "Workspace overview",
        people: "Employee directory",
        company: "Company settings",
        roles: "Roles & permissions",
        audit: "Activity & audit",
      },
    },
  },
});
