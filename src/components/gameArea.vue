<template>
  <div class="w-screen h-[100dvh] flex flex-col overflow-hidden relative bg-white">

    <!-- FIRST TIME HELP OVERLAY -->
    <div v-if="showHelpOverlay" class="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <h2 class="text-xl font-bold text-center mb-5">
          Welcome to Aqada 🎮
        </h2>

        <div class="space-y-4 text-sm text-gray-700">
          <div class="border rounded-xl p-4">
            <div class="font-semibold mb-1">📘 Game Instructions</div>
            <p>
              Tap the <b>?</b> icon beside the game title to view how to play.
            </p>
          </div>

          <div class="border rounded-xl p-4">
            <div class="font-semibold mb-1">⬆️⬇️ Browse More Games</div>
            <p>
              Use the <b>Up</b> and <b>Down</b> buttons at the bottom to move
              between games.
            </p>
          </div>
        </div>

        <button @click="closeHelpOverlay" class="mt-6 w-full bg-black text-white py-2 rounded-xl font-medium">
          Got it
        </button>
      </div>
    </div>

    <!-- GAME AREA -->
    <div class="flex-1 relative overflow-hidden">
      <transition :name="transitionName" mode="out-in">
        <div :key="iframeKey" class="w-full h-full relative">

          <!-- IFRAME -->
          <iframe v-if="iframeUrl" ref="iframeRef" :src="iframeUrl" class="w-full h-full border-0"
            @load="onIframeLoaded" @error="onIframeError" />

          <!-- LOADING -->
          <div v-if="isLoading || isSwitchingGame"
            class="absolute inset-0 flex items-center justify-center bg-white z-50">
            <img :src="AqadaImage" class="animate-pulse" />
          </div>

        </div>
      </transition>
    </div>

    <!-- BOTTOM BAR -->
    <div class="absolute bottom-16 left-0 w-full z-40 px-4 pb-2">
      <div class="bg-black/70 text-sm rounded-lg px-3 py-2 text-center text-white">

        <span v-if="isCurrentGameCompleted" class="text-white">
          You have finished this game 🎉
        </span>

        <span v-else class="text-white">
          Play and enjoy 🎮
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
    <div v-if="showHowToPlay" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg p-6 relative" @click.stop>
        <button @click="showHowToPlay = false" class="absolute top-3 right-3">
          ✕
        </button>

        <h2 class="text-xl font-bold mb-4">How to Play</h2>

        <p>
          {{
            currentGameData?.game_type_how_to?.content ||
            "Instructions not available"
          }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick
} from "vue";

import axios from "axios";
import AqadaImage from "/Aqada.jpg";

import { useGameStore } from "../stores/useGameStore";
import { useUserStore } from "../stores/useUserStore";

const gameStore = useGameStore();
const userStore = useUserStore();

/* STATE */
const currentGame = ref(0);
const iframeKey = ref(0);
const iframeRef = ref(null);

const isSwitchingGame = ref(false);
const userId = ref(null);

const canGoUp = ref(false);
const canGoDown = ref(true);

const showHowToPlay = ref(false);
const showHelpOverlay = ref(false);

const transitionName = ref("slide-up");
const initialSequence = ref(null);

let postMessageTimer = null;
let completedCheckTimer = null;

/* =========================================
✅ NEW: REACTIVE COMPLETED STATE
========================================= */
const completedGames = ref(
  JSON.parse(localStorage.getItem("completed") || "[]")
);

/* COMPUTED */
const games = computed(() => gameStore.games);
const isLoading = computed(() => gameStore.isLoading);

const currentGameData = computed(() => {
  return games.value[currentGame.value] || {};
});

/* =========================================
✅ UPDATED: USE REACTIVE STATE
========================================= */
const isCurrentGameCompleted = computed(() => {
  const currentId = currentGameData.value?._id;
  return completedGames.value.includes(currentId);
});

/* HELP */
function checkFirstVisit() {
  const seen = localStorage.getItem("aqada_help_seen");

  if (!seen) {
    showHelpOverlay.value = true;
  }
}

function closeHelpOverlay() {
  showHelpOverlay.value = false;
  localStorage.setItem("aqada_help_seen", "true");
}

/* DATE */
function formatPublishDate(dateTime) {
  if (!dateTime) return "";

  return new Date(dateTime).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

/* URL */
function getParamKeyFromUrl(url) {
  const pathParts = url.pathname
    .split("/")
    .filter(Boolean);

  const ignore = ["games", "play", "app"];

  for (let i = pathParts.length - 1; i >= 0; i--) {
    if (!ignore.includes(pathParts[i])) {
      return pathParts[i];
    }
  }

  return pathParts[pathParts.length - 1];
}

function getGameUrl(game, uid) {
  const url = new URL(game.game_url);

  const paramKey = getParamKeyFromUrl(url);

  if (paramKey && !url.searchParams.has(paramKey)) {
    url.searchParams.set(paramKey, game._id);
  }

  url.searchParams.set("user", uid);
  url.searchParams.set("game_id", game._id);

  return url.toString();
}

const iframeUrl = computed(() => {
  if (!games.value.length || !userId.value) {
    return "";
  }

  return getGameUrl(
    games.value[currentGame.value],
    userId.value
  );
});

/* =========================================
✅ UPDATED: SAVE WITH REACTIVE UPDATE
========================================= */
function saveCompletedGame(gameId) {
  if (!gameId) return;

  if (!completedGames.value.includes(gameId)) {
    completedGames.value.push(gameId);

    localStorage.setItem(
      "completed",
      JSON.stringify(completedGames.value)
    );
  }
}

/* =========================================
CHECK CHILD GAME COMPLETION
========================================= */
function checkCompletedGame() {
  const completedGameId = localStorage.getItem("completed_game_id");

  if (!completedGameId) return;

  saveCompletedGame(completedGameId);

  localStorage.removeItem("completed_game_id");
}

/* IFRAME */
function sendUserIdToIframe() {
  if (!iframeRef.value?.contentWindow) return;
  if (!iframeUrl.value) return;

  const origin = new URL(iframeUrl.value).origin;

  iframeRef.value.contentWindow.postMessage(
    {
      type: "USER_ID_READY",
      userId: userId.value
    },
    origin
  );
}

function onIframeLoaded() {
  clearInterval(postMessageTimer);

  let count = 0;

  postMessageTimer = setInterval(() => {
    sendUserIdToIframe();

    count++;

    if (count >= 6) {
      clearInterval(postMessageTimer);
    }
  }, 500);

  isSwitchingGame.value = false;
}

function onIframeError() {
  clearInterval(postMessageTimer);
  isSwitchingGame.value = false;
}

/* STORAGE */
function setCurrentSequence(seq) {
  localStorage.setItem("current_sequence_no", Number(seq));
}

/* SWITCH GAME */
async function switchGame(direction, scrollDir) {
  if (!games.value.length) return;
  if (isSwitchingGame.value) return;

  if (direction === "up" && !canGoUp.value) return;
  if (direction === "down" && !canGoDown.value) return;

  transitionName.value =
    direction === "down" ? "slide-up" : "slide-down";

  isSwitchingGame.value = true;
  iframeKey.value++;

  const currentSequence = Number(
    currentGameData.value.publish_sequence_no
  );

  try {
    const res = await axios.get(
      "https://aqada.online/games/get-my-games",
      {
        params: {
          sequence: currentSequence,
          scroll: scrollDir
        }
      }
    );

    const newGame = res.data;

    gameStore.games = [newGame];
    currentGame.value = 0;

    localStorage.setItem("gameId", newGame._id);

    const newSeq = Number(newGame.publish_sequence_no);

    setCurrentSequence(newSeq);

    canGoUp.value = newSeq !== initialSequence.value;
    canGoDown.value = newSeq !== 1;

    await nextTick();

  } catch (error) {
    console.error(error);
  } finally {
    isSwitchingGame.value = false;
  }
}

/* MOUNT */
onMounted(async () => {
  checkFirstVisit();

  if (!localStorage.getItem("completed")) {
    localStorage.setItem("completed", "[]");
  }

  await userStore.createUnsignedUser();

  userId.value =
    userStore.userId ||
    localStorage.getItem("userId");

  await gameStore.fetchGames();

  const firstGame = games.value[0];
  if (!firstGame) return;

  localStorage.setItem("gameId", firstGame._id);

  const seq = Number(firstGame.publish_sequence_no);

  initialSequence.value = seq;

  setCurrentSequence(seq);

  canGoUp.value = false;
  canGoDown.value = seq !== 1;

  /* check every second (works fine now because reactive state added) */
  completedCheckTimer = setInterval(() => {
    checkCompletedGame();
  }, 1000);
});

/* UNMOUNT */
onBeforeUnmount(() => {
  clearInterval(postMessageTimer);
  clearInterval(completedCheckTimer);
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.45s ease;
  position: absolute;
  inset: 0;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-enter-to {
  transform: translateY(0%);
}

.slide-up-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-from {
  transform: translateY(-100%);
}

.slide-down-enter-to {
  transform: translateY(0%);
}

.slide-down-leave-to {
  transform: translateY(100%);
}
</style>