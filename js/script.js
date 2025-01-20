console.log("Let's Write javaScript");
let currentSong = new Audio();
let songs;
let currentFolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currentFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //Show all the songs in playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Harshal</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
  }

  // Attach event listener to all the songs
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/Songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").splice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`/Songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#000"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="/Songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((card) => {
    card.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}

async function main() {
  // Get the list of all songs
  await getSongs("Songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  // Attach event listener to play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    let duration = currentSong.duration;
    let currentTime = currentSong.currentTime;
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentTime
    )} / ${secondsToMinutesSeconds(duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = currentSong.duration * (percent / 100);
  });

  // Add an event listener to the hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
  });

  // Add an event listener to the close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add event listener to the previous buttons
  previous.addEventListener("click", () => {
    console.log("Previous Clicked");
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
    if (index - 1 > length) {
      playMusic(songs[index - 1]);
    }
  });

  // Add event listener to the next button
  next.addEventListener("click", () => {
    console.log("Next Clicked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  // Add event listener to the volume button
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to ", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg","mute.svg");
      currentSong.volume = 0;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 0;
    }else{
      e.target.src = e.target.src.replace("mute.svg","volume.svg");
      currentSong.volume = 0.1;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value = 10;
    }
  })
}

main();
