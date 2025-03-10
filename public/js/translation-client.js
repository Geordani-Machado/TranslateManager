/**
 * Cliente de tradução para anotati.com
 * Use este script para carregar traduções em seu site
 *
 * Exemplo de uso:
 * <script src="https://translate.anotati.com/js/translation-client.js"></script>
 * <script>
 *   const translator = new AnotatiTranslator('en');
 *   translator.init().then(() => {
 *     console.log(translator.translate('hello.world'));
 *   });
 * </script>
 */

class AnotatiTranslator {
  constructor(locale = "en") {
    this.locale = locale
    this.translations = {}
    this.baseUrl = "https://translate.anotati.com/api/public/translations"
    this.isLoaded = false
  }

  /**
   * Inicializa o tradutor carregando as traduções
   * @returns {Promise} Promise que resolve quando as traduções são carregadas
   */
  async init() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.locale}`)

      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`)
      }

      this.translations = await response.json()
      this.isLoaded = true

      // Disparar evento quando as traduções forem carregadas
      window.dispatchEvent(
        new CustomEvent("anotati-translations-loaded", {
          detail: { locale: this.locale },
        }),
      )

      return this.translations
    } catch (error) {
      console.error("Error loading translations:", error)
      throw error
    }
  }

  /**
   * Traduz uma chave
   * @param {string} key - Chave de tradução
   * @param {Object} params - Parâmetros para interpolação (opcional)
   * @returns {string} Texto traduzido ou a própria chave se não encontrada
   */
  translate(key, params = {}) {
    if (!this.isLoaded) {
      console.warn("Translations not loaded yet. Call init() first.")
      return key
    }

    let text = this.translations[key] || key

    // Interpolação simples de parâmetros
    if (params && typeof params === "object") {
      Object.keys(params).forEach((param) => {
        text = text.replace(new RegExp(`{{${param}}}`, "g"), params[param])
      })
    }

    return text
  }

  /**
   * Atalho para o método translate
   */
  t(key, params = {}) {
    return this.translate(key, params)
  }

  /**
   * Muda o idioma e recarrega as traduções
   * @param {string} locale - Novo código de idioma
   * @returns {Promise} Promise que resolve quando as novas traduções são carregadas
   */
  async changeLocale(locale) {
    this.locale = locale
    this.isLoaded = false
    return this.init()
  }
}

// Expor globalmente
window.AnotatiTranslator = AnotatiTranslator

