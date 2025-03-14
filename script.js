const audio = new Audio();
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const track = audioContext.createMediaElementSource(audio);
const gainNode = audioContext.createGain();
track.connect(gainNode).connect(audioContext.destination);

gainNode.gain.value = 1; // Volume padrão (1 = máximo, 0 = mudo)

const title = document.getElementById("musicTitle");
const artist = document.getElementById("musicArtist");
const cover = document.getElementById("currentImg");
const playlistTable = document.getElementById("playlistTable");
const muteButton = document.getElementById("mute-control");
const btnPlay = document.getElementById("play-control");
const currentDuration = document.getElementById("current-duration");
const totalDuration = document.getElementById("total-duration");
const volumeControl = document.getElementById("volume");
const progressbar = document.getElementById("progressbar");

let currentTrack = 0;
let firstPlay = true;

const playlist = [
    { name: "You Say Run", author: "Boku no Hero", linkMusic: "music/you-say-run.mpeg", linkImage: "imgs/you-say-run.jpg" },
    { name: "Haruka Kanata", author: "Naruto", linkMusic: "music/haruka-kanata.mp3", linkImage: "imgs/haruka-kanata.jpg" }
];

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${("0" + min).slice(-2)}:${("0" + sec).slice(-2)}`;
}

function updateTime() {
    currentDuration.textContent = formatTime(audio.currentTime);
    progressbar.value = audio.currentTime;
    progressbar.max = audio.duration;
}

audio.ontimeupdate = updateTime;

audio.addEventListener("loadedmetadata", () => {
    totalDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    playTrack(currentTrack);
});

function playTrack(index) {
    currentTrack = index;
    audio.src = playlist[currentTrack].linkMusic;
    title.textContent = playlist[currentTrack].name;
    artist.textContent = playlist[currentTrack].author;
    cover.src = playlist[currentTrack].linkImage;
    audio.play();
    btnPlay.classList.replace("bi-play-fill", "bi-pause-fill");
    firstPlay = false;
}

document.getElementById("next-control").addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    playTrack(currentTrack);
});

document.getElementById("prev-control").addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    playTrack(currentTrack);
});

btnPlay.addEventListener("click", () => {
    if (firstPlay) {
        playTrack(0);
    } else if (audio.paused) {
        audio.play();
        btnPlay.classList.replace("bi-play-fill", "bi-pause-fill");
    } else {
        audio.pause();
        btnPlay.classList.replace("bi-pause-fill", "bi-play-fill");
    }
});

progressbar.addEventListener("input", () => {
    audio.currentTime = progressbar.value;
});

// Controle de volume avançado
function setVolume(level) {
    gainNode.gain.value = level;
}

document.getElementById("btn-volume-low").addEventListener("click", () => setVolume(0.3));
document.getElementById("btn-volume-high").addEventListener("click", () => setVolume(1));
document.getElementById("btn-mute").addEventListener("click", () => setVolume(0));

// Media Session API para controles do sistema
if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
        title: playlist[currentTrack].name,
        artist: playlist[currentTrack].author,
        artwork: [{ src: playlist[currentTrack].linkImage, sizes: "96x96", type: "image/jpeg" }]
    });

    navigator.mediaSession.setActionHandler("play", () => {
        audio.play();
        btnPlay.classList.replace("bi-play-fill", "bi-pause-fill");
    });

    navigator.mediaSession.setActionHandler("pause", () => {
        audio.pause();
        btnPlay.classList.replace("bi-pause-fill", "bi-play-fill");
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        playTrack(currentTrack);
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        playTrack(currentTrack);
    });
}
