export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">API de Traduções - Documentação</h1>

      <div className="prose max-w-none">
        <h2>Visão Geral</h2>
        <p>
          A API de traduções do Anotati permite que você acesse as traduções gerenciadas pelo Translation Manager em
          seus sites e aplicativos externos.
        </p>

        <h2>Endpoints Públicos</h2>

        <h3>GET /api/public/translations/{"{locale}"}</h3>
        <p>Retorna todas as traduções para um idioma específico no formato JSON.</p>

        <h4>Parâmetros:</h4>
        <ul>
          <li>
            <strong>locale</strong> - Código do idioma (ex: 'en', 'pt', 'es')
          </li>
        </ul>

        <h4>Exemplo de resposta:</h4>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`{
  "common.welcome": "Welcome to our application",
  "common.login": "Login",
  "common.logout": "Logout",
  "errors.required": "This field is required"
}`}
        </pre>

        <h2>Cliente JavaScript</h2>
        <p>
          Para facilitar o uso das traduções em seus sites, disponibilizamos um cliente JavaScript que pode ser incluído
          diretamente em suas páginas.
        </p>

        <h3>Instalação</h3>
        <p>Adicione o script ao seu HTML:</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`<script src="https://translate.anotati.com/js/translation-client.js"></script>`}
        </pre>

        <h3>Uso Básico</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`<script>
  // Inicializar o tradutor com o idioma desejado
  const translator = new AnotatiTranslator('en');
  
  // Carregar as traduções
  translator.init().then(() => {
    // Traduzir uma chave
    const welcomeText = translator.translate('common.welcome');
    document.getElementById('welcome').textContent = welcomeText;
    
    // Traduzir com parâmetros
    const helloText = translator.translate('common.hello', { name: 'John' });
    // Se a tradução for "Hello, {{name}}!", o resultado será "Hello, John!"
  });
</script>`}
        </pre>

        <h3>Métodos Disponíveis</h3>
        <ul>
          <li>
            <strong>init()</strong> - Carrega as traduções do servidor. Retorna uma Promise.
          </li>
          <li>
            <strong>translate(key, params)</strong> - Traduz uma chave. Opcionalmente aceita parâmetros para
            interpolação.
          </li>
          <li>
            <strong>t(key, params)</strong> - Atalho para o método translate.
          </li>
          <li>
            <strong>changeLocale(locale)</strong> - Muda o idioma e recarrega as traduções.
          </li>
        </ul>

        <h3>Eventos</h3>
        <p>O cliente dispara um evento quando as traduções são carregadas:</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`window.addEventListener('anotati-translations-loaded', (event) => {
  console.log('Traduções carregadas para:', event.detail.locale);
});`}
        </pre>

        <h2>Exemplo Completo</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exemplo de Tradução</title>
  <script src="https://translate.anotati.com/js/translation-client.js"></script>
</head>
<body>
  <h1 id="welcome">Carregando...</h1>
  <p id="hello">Carregando...</p>
  
  <select id="language-selector">
    <option value="en">English</option>
    <option value="pt">Português</option>
    <option value="es">Español</option>
  </select>
  
  <script>
    // Inicializar o tradutor
    const translator = new AnotatiTranslator('en');
    
    // Função para atualizar os textos
    function updateTexts() {
      document.getElementById('welcome').textContent = translator.t('common.welcome');
      document.getElementById('hello').textContent = translator.t('common.hello', { name: 'User' });
    }
    
    // Carregar traduções e atualizar textos
    translator.init().then(updateTexts);
    
    // Mudar idioma quando o seletor for alterado
    document.getElementById('language-selector').addEventListener('change', (event) => {
      translator.changeLocale(event.target.value).then(updateTexts);
    });
  </script>
</body>
</html>`}
        </pre>
      </div>
    </div>
  )
}

