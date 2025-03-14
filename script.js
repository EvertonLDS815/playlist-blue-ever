const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audio = new Audio();
const source = audioContext.createMediaElementSource(audio);
const gainNode = audioContext.createGain();
source.connect(gainNode);
gainNode.connect(audioContext.destination);

const title = document.getElementById("musicTitle");
const artist = document.getElementById("musicArtist");
const cover = document.getElementById("currentImg");
const playlistTable = document.getElementById("playlistTable");
const muteButton = document.getElementById("mute-control");
const btnPlay = document.querySelector("#play-control");
const currentDuration = document.getElementById("current-duration");
const totalDuration = document.getElementById("total-duration");
const volumeControl = document.getElementById("volume");
const progressBar = document.getElementById("progressbar");

let currentTrack = 0;
let firstPlay = true;

// Define a playlist
const playlist = [
    {
        name: "You Say Run",
        author: "Boku no Hero",
        linkMusic: "music/you-say-run.mpeg",
        linkImage: "imgs/you-say-run.jpg"
    },
    {
        name: "Haruka Kanata",
        author: "Naruto",
        linkMusic: "music/haruka-kanata.mp3",
        linkImage: "imgs/haruka-kanata.jpg"
    },
    {
        name: "Toumei Datta Sekai",
        author: "Naruto",
        linkMusic: "music/toumei-datta-sekai.mp3",
        linkImage: "imgs/toumei-datta-sekai.jpg"
    },
    {
        name: "For You",
        author: "Naruto",
        linkMusic: "music/for-you.mp3",
        linkImage: "imgs/for-you.jpg"
    },
    {
        name: "Nagariboshi",
        author: "Naruto",
        linkMusic: "music/nagariboshi.mp3",
        linkImage: "imgs/nagariboshi.jpg"
    },
    {
        name: "Don't try",
        author: "Naruto",
        linkMusic: "music/dont-try.mp3",
        linkImage: "imgs/dont-try.jpg"
    },
    {
        name: "Top Gear",
        author: "Super Nintendo",
        linkMusic: "music/top-gear-2.mpeg",
        linkImage: "imgs/top-gear.jpg"
    },
    {
        name: "Top Gear 4",
        author: "Super Nintendo",
        linkMusic: "music/top-gear-4.mp3",
        linkImage: "imgs/top-gear.jpg"
    },
    {
        name: "Doom",
        author: "Super Nintendo",
        linkMusic: "music/doom.mp3",
        linkImage: "imgs/doom.jpg"
    },
    {
        name: "Metal Warriors",
        author: "Super Nintendo",
        linkMusic: "music/metal-warriors.mp3",
        linkImage: "imgs/metal-warriors.jpg"
    },
    {
        name: "Top Gear 3000",
        author: "Super Nintendo",
        linkMusic: "music/top-gear-3000.mp3",
        linkImage: "imgs/top-gear-3000.jpg"
    },
    {
        name: "Graze the Roof",
        author: "Plants vs Zombies",
        linkMusic: "music/graze-the-roof.mp3",
        linkImage: "imgs/graze-the-roof.jpg"
    },
    {
        name: "The Meteor",
        author: "Dragon Ball Budokai Tenkaichi 3",
        linkMusic: "music/the-meteor.mp3",
        linkImage: "imgs/the-meteor.jpg"
    },
    {
        name: "Prisoner of Society",
        author: "Guitar Hero God",
        linkMusic: "music/prisoner-of-society.mp3",
        linkImage: "imgs/guitar-hero-god.jpg"
    },
    {
        name: "Canon Rock",
        author: "Guitar Hero God",
        linkMusic: "music/canon-rock.mp3",
        linkImage: "imgs/guitar-hero-god.jpg"
    },
    {
        name: "The temple of hate",
        author: "Guitar Hero God",
        linkMusic: "music/the-temple-of-hate.mp3",
        linkImage: "imgs/guitar-hero-god.jpg"
    },
    {
        name: "Universal Mind",
        author: "Guitar Hero God",
        linkMusic: "music/universal-mind.mp3",
        linkImage: "imgs/guitar-hero-god.jpg"
    }
];

// Formata tempo em MM:SS
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${("0" + min).slice(-2)}:${("0" + sec).slice(-2)}`;
}

// Carrega a lista de músicas na tabela
function loadPlaylist() {
    playlistTable.innerHTML = "";
    playlist.forEach((music, index) => {
        const row = document.createElement("tr");
        row.classList.add("li-changed");
        row.innerHTML = `
            <td><img src="${music.linkImage}" alt="Imagem da música"></td>
            <td>${music.name}</td>
            <td>${music.author}</td>
        `;
        row.addEventListener("click", () => playTrack(index));
        playlistTable.appendChild(row);
    });
}

// Atualiza a barra de progresso e o tempo
function updateProgress() {
    currentDuration.textContent = formatTime(audio.currentTime);
    progressBar.value = audio.currentTime;
    progressBar.max = audio.duration;
}

// Reproduz a faixa selecionada
function playTrack(index) {
    currentTrack = index;
    audio.src = playlist[currentTrack].linkMusic;
    title.textContent = playlist[currentTrack].name;
    artist.textContent = playlist[currentTrack].author;
    cover.src = playlist[currentTrack].linkImage;
    audio.play();
    btnPlay.classList.replace("bi-play-fill", "bi-pause-fill");
    firstPlay = false;

    // Atualiza visualmente a playlist
    document.querySelectorAll(".li-changed").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".li-changed")[index].classList.add("active");

    audio.onloadedmetadata = () => {
        totalDuration.textContent = formatTime(audio.duration);
        updateMediaSession();
    };
}

// Atualiza a Media Session API para mostrar a música na notificação do celular
function updateMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: playlist[currentTrack].name,
            artist: playlist[currentTrack].author,
            artwork: [{ src: playlist[currentTrack].linkImage, sizes: "512x512", type: "image/png" }]
        });

        navigator.mediaSession.setActionHandler("play", () => playPause());
        navigator.mediaSession.setActionHandler("pause", () => playPause());
        navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
        navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    }
}

// Toca ou pausa a música
function playPause() {
    if (firstPlay) {
        playTrack(0);
    } else if (audio.paused) {
        audio.play();
        btnPlay.classList.replace("bi-play-fill", "bi-pause-fill");
    } else {
        audio.pause();
        btnPlay.classList.replace("bi-pause-fill", "bi-play-fill");
    }
}

// Avança para a próxima faixa
function nextTrack() {
    currentTrack = (currentTrack + 1) % playlist.length;
    playTrack(currentTrack);
}

// Volta para a faixa anterior
function prevTrack() {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    playTrack(currentTrack);
}

// Atualiza a barra de progresso conforme a música toca
audio.addEventListener("timeupdate", updateProgress);

// Permite clicar na barra para avançar ou retroceder a música
progressBar.addEventListener("input", () => {
    audio.currentTime = progressBar.value;
});

// Mute e Unmute usando GainNode
muteButton.addEventListener("click", () => {
    if (gainNode.gain.value > 0) {
        gainNode.gain.value = 0;
        muteButton.classList.replace("bi-volume-up-fill", "bi-volume-mute-fill");
    } else {
        gainNode.gain.value = volumeControl.value / 100;
        muteButton.classList.replace("bi-volume-mute-fill", "bi-volume-up-fill");
    }
});

// Controle de volume usando GainNode
volumeControl.addEventListener("input", () => {
    gainNode.gain.value = volumeControl.value / 100;
});

// Controles de botões
btnPlay.addEventListener("click", playPause);
document.getElementById("next-control").addEventListener("click", nextTrack);
document.getElementById("prev-control").addEventListener("click", prevTrack);

// Teclas de atalho: Espaço (play/pause), Setas (próxima/anterior)
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        playPause();
    } else if (e.code === "ArrowRight") {
        nextTrack();
    } else if (e.code === "ArrowLeft") {
        prevTrack();
    }
});

// Quando a música terminar, toca a próxima
audio.addEventListener("ended", nextTrack);

// Carrega a playlist ao iniciar
loadPlaylist();
