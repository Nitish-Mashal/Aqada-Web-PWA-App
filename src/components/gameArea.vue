<template>
  <div class="w-screen h-[100dvh] flex flex-col overflow-hidden relative bg-white">

    <!-- GAME AREA -->
    <div class="flex-1 relative overflow-hidden">
      <transition :name="transitionName" mode="out-in">

        <!-- WRAPPER (important for transition) -->
        <div :key="iframeKey" class="w-full h-full relative">

          <!-- IFRAME -->
          <iframe v-if="iframeUrl" ref="iframeRef" :src="iframeUrl" class="w-full h-full border-0"
            @load="onIframeLoaded" @error="onIframeError" />

          <!-- 🔥 SPLASH -->
          <div v-if="isLoading || isSwitchingGame"
            class="absolute inset-0 flex items-center justify-center bg-white z-50">
            <img :src="AqadaImage" class="animate-pulse" />
          </div>

        </div>

      </transition>
    </div>

    <!-- ✅ BOTTOM INFO BAR (UNCHANGED UI) -->
    <div class="absolute bottom-16 left-0 w-full z-40 px-4 pb-2">
      <div class="bg-black/70 text-white text-sm rounded-lg px-3 py-2 text-center">

        <span v-if="!isOnline" class="text-white">
          Uh oh! No internet, no aqada
        </span>

        <span v-else-if="isAllGamesCompleted" class="text-white">
          You have finished this game
        </span>

        <span v-else class="text-white">
          {{ currentGameData?.short_description || "Play and enjoy the challenge!" }}
        </span>

      </div>
    </div>


    <hr class="m-0" />

    <!-- CONTROLS -->
    <div class="relative h-16 flex items-center justify-between px-4">

      <!-- UP -->
      <button @click="switchGame('up', 'up')" :disabled="!canGoUp"
        :class="{ 'opacity-50 cursor-not-allowed': !canGoUp }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <!-- TITLE -->
      <div v-if="games.length" class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
        <div class="flex items-center gap-2">
          <div class="text-lg font-semibold">
            {{ currentGameData.game_type_name }}
          </div>

          <button @click="showHowToPlay = true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0
                1.172 1.025 1.172 2.687 0 3.712
                -.203.179-.43.326-.67.442
                -.745.361-1.45.999-1.45 1.827v.75
                M21 12a9 9 0 1 1-18 0
                9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </button>
        </div>

        <div class="text-sm text-gray-500">
          {{ formatPublishDate(currentGameData.publish_date_time) }}
        </div>
      </div>

      <!-- DOWN -->
      <button @click="switchGame('down', 'down')" :disabled="!canGoDown"
        :class="{ 'opacity-50 cursor-not-allowed': !canGoDown }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0
            9 9 0 0 1 18 0Z" />
        </svg>
      </button>

    </div>

    <!-- HOW TO PLAY -->
    <div v-if="showHowToPlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg p-6 relative" @click.stop>
        <button @click="showHowToPlay = false" class="absolute top-3 right-3">✕</button>

        <h2 class="text-xl font-bold mb-4">How to Play</h2>

        <p>
          {{ currentGameData?.game_type_how_to?.content || 'Instructions not available' }}
        </p>
      </div>
    </div>



  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useGameStore } from "../stores/useGameStore";
import { useUserStore } from "../stores/useUserStore";
import axios from "axios";
import AqadaImage from "/Aqada.jpg";

const gameStore = useGameStore();
const userStore = useUserStore();

const currentGame = ref(0);
const iframeKey = ref(0);
const iframeRef = ref(null);
const isSwitchingGame = ref(false);
const userId = ref(null);
const initialSequence = ref(null);

const canGoUp = ref(false);
const canGoDown = ref(true);
const showHowToPlay = ref(false);
const transitionName = ref("slide-down");

/* ✅ NEW STATES */
const isOnline = ref(navigator.onLine);

/* ✅ COMPUTED */
const games = computed(() => gameStore.games);
const isLoading = computed(() => gameStore.isLoading);

const currentGameData = computed(() => {
  return games.value[currentGame.value] || {};
});

/* ✅ GAME COMPLETION */
const isAllGamesCompleted = computed(() => {
  return !canGoDown.value;
});

const markGameCompleted = (gameId) => {
  if (!gameId) return;
  localStorage.setItem(`game_completed_${gameId}`, "true");
};

/* ✅ INTERNET LISTENER */
const updateOnlineStatus = async () => {
  try {
    await fetch("https://www.google.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
    });
    isOnline.value = true;
  } catch (e) {
    isOnline.value = false;
  }
};

/* ✅ IFRAME MESSAGE LISTENER */
const handleMessage = (event) => {
  try {
    const origin = new URL(iframeUrl.value).origin;
    if (event.origin !== origin) return;
  } catch {
    return;
  }

  if (event.data?.type === "GAME_COMPLETED") {
    markGameCompleted(event.data.gameId || currentGameData.value._id);
  }
};

const getParamKeyFromUrl = (url) => {
  const pathParts = url.pathname.split("/").filter(Boolean);
  const ignore = ["games", "play", "app"];

  for (let i = pathParts.length - 1; i >= 0; i--) {
    if (!ignore.includes(pathParts[i])) {
      return pathParts[i];
    }
  }

  return pathParts[pathParts.length - 1];
};

const iframeUrl = computed(() => {
  if (!games.value.length || !userId.value) return "";
  return getGameUrl(games.value[currentGame.value], userId.value);
});

onMounted(async () => {
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  window.addEventListener("message", handleMessage);

  // 🔥 check immediately on load
  await updateOnlineStatus();

  await userStore.createUnsignedUser();

  userId.value =
    userStore.userId || localStorage.getItem("currentUserId");

  if (userId.value) {
    localStorage.setItem("currentUserId", userId.value);
  }

  await gameStore.fetchGames();

  const seq = games.value[0]?.publish_sequence_no;
  if (!seq) return;

  initialSequence.value = seq;
  canGoUp.value = false;
  canGoDown.value = seq !== 1;
  updateOnlineStatus(); // 👈 ADD THIS
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateOnlineStatus);
  window.removeEventListener("offline", updateOnlineStatus);
  window.removeEventListener("message", handleMessage);
});

const getGameUrl = (game, userId) => {
  const url = new URL(game.game_url);
  const paramKey = getParamKeyFromUrl(url);

  if (paramKey && !url.searchParams.has(paramKey)) {
    url.searchParams.set(paramKey, game._id);
  }

  url.searchParams.set("user", userId);
  url.searchParams.set("game_id", game._id);

  return url.toString();
};

function onIframeLoaded() {
  setTimeout(() => {
    const origin = new URL(iframeUrl.value).origin;

    if (iframeRef.value?.contentWindow) {
      iframeRef.value.contentWindow.postMessage(
        { type: "USER_ID_READY", userId: userId.value },
        origin
      );
    }

    isSwitchingGame.value = false;
  }, 100);
}

function onIframeError() {
  isSwitchingGame.value = false;
}

function formatPublishDate(dateTime) {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function switchGame(direction, scrollDir) {
  if (!games.value.length || isSwitchingGame.value) return;

  if (direction === "up" && !canGoUp.value) return;
  if (direction === "down" && !canGoDown.value) return;

  transitionName.value = direction === "down"
    ? "slide-up"
    : "slide-down";

  isSwitchingGame.value = true;
  iframeKey.value++;

  const currentSequence =
    games.value[currentGame.value]?.publish_sequence_no;

  try {
    const res = await axios.get(
      "https://aqada.online/games/get-my-games",
      {
        params: {
          sequence: currentSequence,
          scroll: scrollDir,
        },
      }
    );

    const newGame = res.data;

    gameStore.games = [newGame];
    currentGame.value = 0;

    const seq = newGame.publish_sequence_no;

    canGoDown.value = seq !== 1;
    canGoUp.value = seq !== initialSequence.value;

  } catch (error) {
    if (error.response?.status === 503 || error.response?.status === 404) {
      if (direction === "up") {
        canGoUp.value = false;
        canGoDown.value = true;
      }

      if (direction === "down") {
        canGoDown.value = false;
        canGoUp.value = true;
      }
    }
  } finally {
    isSwitchingGame.value = false;
  }
}
</script>

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-down-enter-from {
  transform: translateY(100%);
}

.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.5s ease-in-out;
}

.slide-up-enter-from {
  transform: translateY(-100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}
</style>