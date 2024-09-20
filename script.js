console.log("Let's write javascript code")
let cardContainer = document.querySelector(".card-container");
let inputValue;
let inputValue2;
let currSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    //fetching the songs from songs folder
    let songsData = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await songsData.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let a = div.getElementsByTagName("a");

    songs = [];
    for (let i = 0; i < a.length; i++) {
        const element = a[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    };


    //show all the songs in the playlist
    let songUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="music icon">
                <div class="songInfo">
                    <div class="song-name">
                        ${song.replaceAll("%20", " ")}
                    </div>
                    <div class="song-artist">
                        Deepak
                    </div>
                </div>
                <div class="play-now">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="Play icon">
                </div></li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelectorAll(".songslist li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML.trim());
        })
    });

}

const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".song-info marquee").innerHTML = decodeURI(track);
    // document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let songsFolders = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await songsFolders.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let foldAnchors = div.getElementsByTagName("a");
    let array = Array.from(foldAnchors);


    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {

            let folder = e.href.split("/").slice(-2)[0];

            // Get the metadata of folder
            let songsFolders = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);

            let response = await songsFolders.json();
            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder.toLowerCase()}" class="card">
                
                <img src="/songs/${folder}/cover.jpg" alt="">

                    <div class="albumInfo">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>

                    <div class="play-btn">
                    <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                        <polygon points="35,30 35,70 70,50" fill="black" />
                    </svg>
                </div>

            </div>`

        }

    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log("Fetching Songs")
            // console.log(item.currentTarget.dataset.folder)
            let songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        });
    });


    
}

async function main() {

    // Attach event listeners to arrow buttons for changing playlists
    let arrowBtns = Array.from(document.getElementsByClassName("arrow-btn"));
    let currentAlbumIndex = 0;

    arrowBtns[0].addEventListener("click", () => {
        if (currentAlbumIndex > 0) {
            currentAlbumIndex--;
            let folder = document.getElementsByClassName("card")[currentAlbumIndex].dataset.folder;
            getSongs(`songs/${folder}`);
        }
    });

    arrowBtns[1].addEventListener("click", () => {
        if (currentAlbumIndex < document.getElementsByClassName("card").length - 1) {
            currentAlbumIndex++;
            let folder = document.getElementsByClassName("card")[currentAlbumIndex].dataset.folder;
            getSongs(`songs/${folder}`);
        }
    });

    //get the list of all songs
    await getSongs("songs/Anime");
    playMusic(songs[0], true);

    // Display all the albums/playlists on the page
    displayAlbums();


    //attach and event listener to play
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "pause.svg"
        }
        else {
            currSong.pause()
            play.src = "play.svg"

        }
    });

    //listen for time update event
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
    });

    //add an event listener to seekbar to drag the circle
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100;
    });

    //Add an event listener for hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    //Add an event listener to the previous
    previous.addEventListener("click", () => {
        currSong.pause();
        play.src = "play.svg";
        // console.log("previos clicked");

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });

    //Add an event listener to the next
    next.addEventListener("click", () => {
        currSong.pause();
        play.src = "play.svg";
        // console.log("next clicked");

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });


    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {

        if (e.target.value == 0) {
            document.querySelector(".volume img").src = "mute.svg"
        }
        else if (e.target.value <= 50) {
            document.querySelector(".volume img").src = "half-vol.svg"
        }
        else {
            document.querySelector(".volume img").src = "volume.svg"
        }

        inputValue = e.target.value;
        inputValue2 = e.target.value;

        currSong.volume = parseInt(e.target.value) / 100;
    });

    
      // Function to move the volume bar with volume icons
      function setRange(value) {
        document.querySelector(".range").getElementsByTagName("input")[0].value = value;
    }


    // Add event listener to mute track
    document.querySelector(".volume img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            inputValue = 0;
            currSong.volume = parseInt(inputValue) / 100;
            setRange(inputValue);
        }
        else if (e.target.src.includes("half-vol.svg")) {
            e.target.src = e.target.src.replace("half-vol.svg", "mute.svg");
            inputValue = 0;
            currSong.volume = parseInt(inputValue) / 100;
            setRange(inputValue);
        }
        else {
            if (inputValue2 <= 50) {
                e.target.src = e.target.src.replace("mute.svg", "half-vol.svg");
            }
            else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            }
            inputValue = inputValue2;
            currSong.volume = parseInt(inputValue) / 100;
            setRange(inputValue);
        }
    });

  


}


main()