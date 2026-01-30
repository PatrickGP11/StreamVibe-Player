/* ==========================================================================
   1. CONFIGURAÇÕES E ESTADO GLOBAL
   ========================================================================== */
// --- COLOQUE SEU TOKEN DA AUDD.IO ABAIXO ---
const AUDD_API_TOKEN = 'b536f5ba903cb9ba6824a2536bd14d7b';

// Estado da Aplicação
let currentSong = null;
let favorites = JSON.parse(localStorage.getItem('myFavorites')) || [];
let mediaRecorder = null;
let audioChunks = [];
const speeds = [1.0, 1.5, 2.0, 0.5];
let speedIndex = 0;

/* ==========================================================================
   2. ELEMENTOS DO HTML (DOM)
   ========================================================================== */
const searchInput = document.getElementById('searchInput');
const resultContainer = document.getElementById('resultContainer');
const fullScreenPlayer = document.getElementById('fullScreenPlayer');
const listeningOverlay = document.getElementById('listeningOverlay');
const sourceSelectionModal = document.getElementById('sourceSelectionModal');
const searchWrapper = document.getElementById('searchWrapper');
const bgBlur = document.getElementById('bgBlur');

const audioElement = document.getElementById('audioElement');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

const playerImage = document.getElementById('playerImage');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playIcon = document.getElementById('playIcon');
const likeIcon = document.getElementById('likeIcon');
const likeBtn = document.querySelector('.like-btn');
const speedBtn = document.getElementById('speedBtn');

/* ==========================================================================
   3. NAVEGAÇÃO E INTERFACE
   ========================================================================== */
function switchTab(tabName) {
    document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (tabName === 'favorites') {
        searchWrapper.style.display = 'none';
        displayResults(favorites);
    } else {
        searchWrapper.style.display = 'block';
        resultContainer.innerHTML = '<div class="empty-state"><p>Busque algo novo.</p></div>';
    }
}

// MENU INTELIGENTE
function openSourceMenu() {
    sourceSelectionModal.classList.remove('hidden');

    // Detecção de dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const btnSystem = document.getElementById('btnSystem');
    const mobileWarning = document.getElementById('mobileWarning');

    if (isMobile) {
        btnSystem.style.display = 'none';
        mobileWarning.style.display = 'block';
    } else {
        btnSystem.style.display = 'flex';
        mobileWarning.style.display = 'none';
    }
}

function closeSourceMenu() { sourceSelectionModal.classList.add('hidden'); }

/* ==========================================================================
   4. BUSCA DE MÚSICA (ITUNES API)
   ========================================================================== */
searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') searchMusic(); });

async function searchMusic(forceTerm = null) {
    const term = forceTerm || searchInput.value;
    if (!term) return;

    resultContainer.innerHTML = '<div class="empty-state"><p>Buscando...</p></div>';

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
        const data = await response.json();

        const songs = data.results.map(item => ({
            id: item.trackId, title: item.trackName, artist: item.artistName,
            image: item.artworkUrl100.replace('100x100', '600x600'), preview: item.previewUrl
        }));
        displayResults(songs);
    } catch (error) {
        resultContainer.innerHTML = '<div class="empty-state"><p>Erro ao buscar.</p></div>';
    }
}

function displayResults(songsList) {
    resultContainer.innerHTML = '';
    if (songsList.length === 0) {
        resultContainer.innerHTML = '<div class="empty-state"><p>Nada encontrado.</p></div>';
        return;
    }
    songsList.forEach(song => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `<img src="${song.image}"><h3>${song.title}</h3><p>${song.artist}</p>`;
        card.addEventListener('click', () => openPlayer(song));
        resultContainer.appendChild(card);
    });
}

/* ==========================================================================
   5. PLAYER DE MÚSICA
   ========================================================================== */
function openPlayer(song) {
    currentSong = song;
    playerTitle.innerText = song.title; playerArtist.innerText = song.artist;
    playerImage.src = song.image; bgBlur.style.backgroundImage = `url(${song.image})`;

    audioElement.src = song.preview; audioElement.playbackRate = 1.0;
    speedIndex = 0; speedBtn.innerText = "1x";

    updateLikeButtonVisual(); audioElement.play(); updatePlayIcon(true);
    fullScreenPlayer.classList.remove('hidden');
}

function closePlayer() { fullScreenPlayer.classList.add('hidden'); }
function togglePlay() { audioElement.paused ? (audioElement.play(), updatePlayIcon(true)) : (audioElement.pause(), updatePlayIcon(false)); }
function updatePlayIcon(isPlaying) { playIcon.className = isPlaying ? 'ri-pause-fill' : 'ri-play-fill'; }
function changeSpeed() { speedIndex = (speedIndex + 1) % speeds.length; audioElement.playbackRate = speeds[speedIndex]; speedBtn.innerText = speeds[speedIndex] + "x"; }

audioElement.addEventListener('timeupdate', () => {
    if (isNaN(audioElement.duration)) return;
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.value = progress; progressBar.style.backgroundSize = `${progress}% 100%`;
    currentTimeEl.innerText = formatTime(audioElement.currentTime); durationEl.innerText = formatTime(audioElement.duration);
});
progressBar.addEventListener('input', () => { audioElement.currentTime = (progressBar.value / 100) * audioElement.duration; });
audioElement.addEventListener('ended', () => { updatePlayIcon(false); progressBar.value = 0; progressBar.style.backgroundSize = '0% 100%'; });
function formatTime(s) { if (isNaN(s)) return "0:00"; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec < 10 ? '0' : ''}${sec}`; }

/* ==========================================================================
   6. FAVORITOS
   ========================================================================== */
function toggleFavorite() {
    if (!currentSong) return;
    const index = favorites.findIndex(f => f.id === currentSong.id);
    index === -1 ? favorites.push(currentSong) : favorites.splice(index, 1);
    localStorage.setItem('myFavorites', JSON.stringify(favorites));
    updateLikeButtonVisual();
    if (searchWrapper.style.display === 'none') displayResults(favorites);
}

function updateLikeButtonVisual() {
    const isFav = currentSong && favorites.some(f => f.id === currentSong.id);
    likeBtn.classList.toggle('liked', isFav); likeIcon.className = isFav ? 'ri-heart-fill' : 'ri-heart-line';
}

/* ==========================================================================
   7. SISTEMA DE RECONHECIMENTO (MIC + SYSTEM)
   ========================================================================== */

// A. Microfone
async function startMicRecording() {
    closeSourceMenu();
    const statusText = listeningOverlay.querySelector('p');
    listeningOverlay.classList.remove('hidden');
    statusText.innerText = "Configurando Microfone...";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
        processStream(stream, "mic");
    } catch (err) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            processStream(stream, "mic");
        } catch (err2) { handleError(err2); }
    }
}

// B. Sistema (DisplayMedia)
async function startSystemRecording() {
    closeSourceMenu();
    const statusText = listeningOverlay.querySelector('p');
    listeningOverlay.classList.remove('hidden');
    statusText.innerText = "Selecione a Guia e MARQUE 'Compartilhar Áudio'!";
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

        // Validação: Tem áudio?
        if (stream.getAudioTracks().length === 0) {
            alert("ERRO: Você esqueceu de marcar 'Compartilhar áudio da guia'.");
            stream.getTracks().forEach(t => t.stop());
            listeningOverlay.classList.add('hidden');
            return;
        }
        processStream(stream, "system");
    } catch (err) { handleError(err); }
}

// C. Processamento e Gravação (A CORREÇÃO ESTÁ AQUI)
function processStream(originalStream, type) {
    const statusText = listeningOverlay.querySelector('p');
    const recordTime = type === "mic" ? 6000 : 10000;
    let timeLeft = recordTime / 1000;

    // --- CORREÇÃO DO ERRO 'FAILED TO EXECUTE START' ---
    // O navegador manda Video+Audio no modo "system". 
    // O gravador só aceita Audio. Se misturar, ele trava.
    // Aqui nós separamos apenas o áudio para gravar.

    let streamToRecord = originalStream;

    if (type === "system") {
        const audioTrack = originalStream.getAudioTracks()[0];
        streamToRecord = new MediaStream([audioTrack]); // Cria um fluxo SÓ de áudio
    }
    // ---------------------------------------------------

    const options = { audioBitsPerSecond: 128000, mimeType: 'audio/webm;codecs=opus' };

    try {
        mediaRecorder = new MediaRecorder(streamToRecord, options);
    } catch (e) {
        mediaRecorder = new MediaRecorder(streamToRecord);
    }

    audioChunks = [];
    const interval = setInterval(() => {
        timeLeft--; statusText.innerText = type === "mic" ? `Ouvindo... (${timeLeft}s)` : `Gravando sistema... (${timeLeft}s)`;
    }, 1000);

    mediaRecorder.addEventListener("dataavailable", e => { if (e.data.size > 0) audioChunks.push(e.data); });

    mediaRecorder.addEventListener("stop", async () => {
        clearInterval(interval);

        // Importante: Parar o stream ORIGINAL para sumir o ícone de compartilhamento
        originalStream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (audioBlob.size < 3000) { alert("Áudio muito curto."); listeningOverlay.classList.add('hidden'); return; }
        statusText.innerText = "Enviando..."; await identifySongAPI(audioBlob);
    });

    mediaRecorder.start();
    setTimeout(() => { if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop(); }, recordTime);
}

// D. API AudD
async function identifySongAPI(blob) {
    if (AUDD_API_TOKEN === 'SEU_TOKEN_AQUI') { alert("ERRO: Configure o TOKEN no script.js!"); listeningOverlay.classList.add('hidden'); return; }

    const formData = new FormData();
    formData.append("file", blob, 'recording.webm');
    formData.append("api_token", AUDD_API_TOKEN);
    formData.append("return", "apple_music,spotify");

    try {
        const response = await fetch("https://cors-anywhere.herokuapp.com/https://api.audd.io/", { method: 'POST', body: formData });
        if (response.status === 403) { alert("ERRO: Ative o Proxy em cors-anywhere.herokuapp.com/corsdemo"); listeningOverlay.classList.add('hidden'); return; }
        const data = await response.json();
        listeningOverlay.classList.add('hidden');
        if (data.status === "success" && data.result) {
            const fullName = `${data.result.title} ${data.result.artist}`;
            searchInput.value = fullName; searchMusic(fullName);
        } else { alert("Música não identificada."); }
    } catch (e) { alert("Erro de conexão."); listeningOverlay.classList.add('hidden'); }
}

function cancelShazam() { if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop(); listeningOverlay.classList.add('hidden'); }
function handleError(err) { console.error(err); listeningOverlay.classList.add('hidden'); if (err.name !== 'NotAllowedError') alert("Erro: " + err.message); }