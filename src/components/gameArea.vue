<template>
  <div class="w-screen h-screen flex flex-col overflow-hidden relative bg-white min-h-[100vh]">

    <!-- FIRST TIME HELP OVERLAY -->
    <div v-if="showHelpOverlay" class="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <h2 class="text-xl font-bold text-center mb-5">
          Welcome to Aqada 🎮
        </h2>

        <div class="space-y-4 text-sm text-gray-700">
          <div class="border rounded-xl p-4">
            <div class="font-semibold mb-1">📘 Game Instructions</div>
            <div>
              Tap the
              <span class="inline-flex items-center whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0
        1.172 1.025 1.172 2.687 0 3.712
        -.203.179-.43.326-.67.442
        -.745.361-1.45.999-1.45 1.827v.75
        M21 12a9 9 0 1 1-18 0
        9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>

              </span>
              icon beside the game title to view how to play.
            </div>
          </div>

          <div class="border rounded-xl p-4">
            <div class="font-semibold mb-1 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0
      9 9 0 0 1 18 0Z" />
              </svg>

              <span>Browse More Games</span>
            </div>
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

      <!-- SETTINGS + SHARE -->
      <div class="absolute top-4 right-4 z-50 flex items-center gap-2">

        <!-- SETTINGS -->
        <button @click="openSettings" class="p-2 active:scale-95 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>

        </button>

        <!-- SHARE -->
        <button @click="shareGame" class="p-2 active:scale-95 transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
        </button>

      </div>

      <div class="w-full h-full relative overflow-hidden">

        <transition :name="transitionName" mode="out-in">

          <div :key="iframeKey" class="w-full h-full absolute inset-0">

            <div class="absolute inset-0">

              <iframe v-if="iframeUrl" ref="iframeRef" :src="iframeUrl" class="w-full h-full border-0"
                style="touch-action: manipulation;" @load="onIframeLoaded" @error="onIframeError" />

            </div>

          </div>

        </transition>

        <div v-if="isLoading || isSwitchingGame"
          class="absolute inset-0 flex items-center justify-center bg-white z-50">
          <img :src="AqadaImage" class="animate-pulse" />
        </div>

      </div>

    </div>

    <!-- BOTTOM BAR -->
    <div class="absolute bottom-16 left-0 w-full z-40 px-4 pb-2">
      <div class="bg-black/70 text-sm rounded-lg px-3 py-2 text-center text-white">

        <!-- 🔴 OFFLINE OR GAME NOT LOADED -->
        <span v-if="isOffline || (!isLoading && !iframeUrl)" class="text-white">
          Uh oh! No internet, no aqada 😕
        </span>

        <!-- 🟢 EXISTING LOGIC (unchanged) -->
        <template v-else>
          <span v-if="isCurrentGameCompleted" class="text-white">
            You have finished this game 🎉
          </span>

          <span v-else class="text-white">
            Click <span class="text-white">
              <button @click="showHowToPlay = true"> ? </button></span> to know How To Play
          </span>
        </template>

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

        <!-- <p v-html="currentGameData?.game_type_how_to?.content || 'Instructions not available'"></p> -->

        <div class="how-to-content" v-html="currentGameData?.game_type_how_to?.content || 'Instructions not available'">
        </div>
      </div>
    </div>

    <!-- SETTINGS POPUP -->
    <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
      <div class="bg-white rounded-xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden" @click.stop>

        <!-- HEADER -->
        <div class="flex items-center justify-between border-b px-5 py-4">

          <div class="flex items-center gap-3">

            <button v-if="activeSettingsComponent" @click="goBackSettingsMenu" class="font-medium">
              ← Back
            </button>

            <h2 class="text-xl font-bold">
              {{ settingsTitle || "Settings" }}
            </h2>

          </div>

          <button @click="closeSettings">
            ✕
          </button>

        </div>

        <!-- BODY -->
        <div class="overflow-y-auto max-h-[75vh] p-5">

          <!-- SETTINGS MENU -->
          <div v-if="!activeSettingsComponent" class="space-y-3">

            <button @click="openPrivacyPolicy" class="w-full text-left border rounded-xl p-4 hover:bg-gray-50">
              Privacy Policy
            </button>

            <button @click="openTermsConditions" class="w-full text-left border rounded-xl p-4 hover:bg-gray-50">
              Terms & Conditions
            </button>

          </div>

          <!-- DYNAMIC COMPONENT -->
          <component v-else :is="activeSettingsComponent" />

        </div>

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
  nextTick,
  markRaw
} from "vue";

import axios from "axios";
import AqadaImage from "/Aqada.jpg";

import PrivacyPolicy from "./privacy-policy.vue";
import TermsAndConditions from "./terms-and-conditions.vue";

import { useGameStore } from "../stores/useGameStore";
import { useUserStore } from "../stores/useUserStore";
import { useAppStore } from "../stores/useAppStore";

const isOffline = ref(!navigator.onLine);

const gameStore = useGameStore();
const userStore = useUserStore();
const appStore = useAppStore();

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

const showSettings = ref(false);
const activeSettingsComponent = ref(null);
const settingsTitle = ref("");

const transitionName = ref("slide-up");
const initialSequence = ref(null);

let postMessageTimer = null;
let completedCheckTimer = null;

const showNoInternetScreen = computed(() => {
  return isOffline.value || (!isLoading.value && !iframeUrl.value);
});


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

function openSettings() {
  showSettings.value = true;
  activeSettingsComponent.value = null;
  settingsTitle.value = "";
}

function closeSettings() {
  showSettings.value = false;
  activeSettingsComponent.value = null;
  settingsTitle.value = "";
}

function openPrivacyPolicy() {
  settingsTitle.value = "Privacy Policy";
  activeSettingsComponent.value = markRaw(PrivacyPolicy);
}

function openTermsConditions() {
  settingsTitle.value = "Terms & Conditions";
  activeSettingsComponent.value = markRaw(TermsAndConditions);
}

function goBackSettingsMenu() {
  activeSettingsComponent.value = null;
  settingsTitle.value = "";
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

// NETWORK STATUS
function updateNetworkStatus() {
  isOffline.value = !navigator.onLine;
}

onMounted(() => {
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateNetworkStatus);
  window.removeEventListener("offline", updateNetworkStatus);
});

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

/* SHARE GAME */
async function shareGame() {
  try {
    const game = currentGameData.value;

    if (!game) return;

    // Share actual game URL
    const shareUrl = iframeUrl.value;

    const shareData = {
      title: game.game_type_name || "Aqada Game",
      text: `Play ${game.game_type_name} on Aqada 🎮`,
      url: shareUrl
    };

    // Mobile native share
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Desktop fallback
      await navigator.clipboard.writeText(shareUrl);

      alert("Game link copied to clipboard");
    }

  } catch (error) {
    console.error("Share failed:", error);
  }
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
  // Refresh once per day after 6:30 AM
  appStore.checkMorningRefresh();

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

  // Check completed games every second
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
  transition: all 0.5s ease;
  position: absolute;
  inset: 0;
}

iframe {
  touch-action: manipulation;
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

.how-to-content {
  white-space: normal;
  word-break: break-word;
}

.how-to-content em {
  font-style: italic;
}

.how-to-content br {
  display: block;
}
</style>