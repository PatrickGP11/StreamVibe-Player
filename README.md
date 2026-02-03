# 🎵 StreamVibe Player

> Um reprodutor de música web moderno com interface Glassmorphism e reconhecimento de áudio integrado.

![Status](http://img.shields.io/static/v1?label=STATUS&message=PORTFOLIO&color=BLUE&style=for-the-badge)
![License](http://img.shields.io/static/v1?label=LICENSE&message=MIT&color=GREEN&style=for-the-badge)

## ⚖️ Aviso Legal (Disclaimer)

**Este projeto foi desenvolvido estritamente para fins educacionais e de portfólio.**

* **Não comercial:** Este projeto não possui fins lucrativos e não monetiza conteúdo.
* **Conteúdo:** Todas as músicas reproduzidas são **prévias de 30 segundos** fornecidas publicamente pela **iTunes Search API**, em conformidade com os termos de uso para demonstração.
* **Reconhecimento:** O serviço de identificação utiliza a API da **AudD.io** em caráter de teste.
* **Direitos:** Todos os direitos autorais das obras musicais pertencem aos seus respectivos proprietários, artistas e gravadoras. Não hospedamos arquivos MP3 em nossos servidores.

---

## 💻 Sobre o Projeto

O **StreamVibe** é uma aplicação Single Page Application (SPA) que explora o consumo de APIs de mídia em tempo real. O diferencial é a integração de um sistema de "Shazam" híbrido, capaz de ouvir o ambiente ou o sistema operacional para identificar faixas musicais.

### ✨ Funcionalidades

* **🔍 Busca Global:** Pesquisa músicas diretamente no catálogo do Apple Music/iTunes.
* **🎧 Smart Player:** Reprodução de prévias (30s) com controles de volume, progresso e Play/Pause.
* **⚡ Controle de Velocidade:** Acelere ou desacelere a música (0.5x até 2.0x).
* **❤️ Favoritos:** Persistência de dados local (LocalStorage) para salvar músicas.
* **🎙️ Reconhecimento de Áudio (Shazam):**
    * **Modo Microfone:** Para celulares e som ambiente.
    * **Modo Sistema:** Captura o áudio de outras abas (YouTube, Spotify) no PC.
* **📱 Responsivo:** Design adaptado para Mobile e Desktop com Glassmorphism.

---

## 🛠 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).
* **APIs:**
    * [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) (Dados e Áudio).
    * [AudD.io](https://audd.io/) (Reconhecimento Musical).
* **Tools:** MediaRecorder API, LocalStorage.

---

## 🚀 Como Rodar o Projeto

Como este projeto utiliza uma API de reconhecimento que requer proteção CORS, é necessário um passo extra para rodar localmente.

### 1. Obter Chave de API
Você precisará de um Token gratuito da AudD:
1.  Cadastre-se em [AudD.io](https://audd.io/).
2.  Copie seu `api_token`.
3.  No arquivo `script.js`, insira o token na linha 2:
    ```javascript
    const AUDD_API_TOKEN = 'COLE_SEU_TOKEN_AQUI';
    ```

### 2. Rodar a Aplicação
Basta abrir o arquivo `index.html` em seu navegador.

### 3. ⚠️ Ativar o Proxy (Importante)
Para que o reconhecimento funcione sem um servidor Backend (backend-less), utilizamos um Proxy temporário.
1.  Se o reconhecimento falhar, o app avisará.
2.  Acesse **[cors-anywhere.herokuapp.com/corsdemo](https://cors-anywhere.herokuapp.com/corsdemo)**.
3.  Clique no botão **"Request temporary access"**.
4.  Volte ao app e use o microfone normalmente.

---

## 🎨 Créditos e Atribuições

* **Design:** Inspirado em tendências de Glassmorphism e interfaces modernas de streaming.
* **Ícones:** [RemixIcon](https://remixicon.com/).
* **Desenvolvimento:** [Patrick Gonçalves]

---

## 📝 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido por Patrick Gonçalves

💡 Projeto educacional e interativo em JavaScript
