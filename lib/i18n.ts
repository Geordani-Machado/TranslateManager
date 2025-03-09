import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Recursos iniciais (podem ser vazios, serão carregados dinamicamente)
const resources = {
  pt: {
    example: {
      greeting: "Olá",
      name: "Usuário",
      content: "Este é um exemplo de conteúdo em português",
      cardDescription: "Um exemplo de componente i18n",
      alertMessage: "Esta é uma mensagem de alerta em português",
      showAlert: "Mostrar Alerta",
    },
  },
  en: {
    example: {
      greeting: "Hello",
      name: "User",
      content: "This is an example content in English",
      cardDescription: "An example of i18n component",
      alertMessage: "This is an alert message in English",
      showAlert: "Show Alert",
    },
  },
  es: {
    example: {
      greeting: "Hola",
      name: "Usuario",
      content: "Este es un ejemplo de contenido en español",
      cardDescription: "Un ejemplo de componente i18n",
      alertMessage: "Este es un mensaje de alerta en español",
      showAlert: "Mostrar Alerta",
    },
  },
}

// Inicializar i18n
i18n.use(initReactI18next).init({
  resources,
  lng: "pt", // Idioma padrão
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false, // React já escapa por padrão
  },
  react: {
    useSuspense: false, // Desativar suspense para evitar problemas com SSR
  },
})

export default i18n

