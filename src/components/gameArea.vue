<template>
  <div class="w-screen h-[100dvh] flex flex-col overflow-hidden relative bg-white">

    <!-- 🔥 SPLASH SCREEN -->
    <div v-if="isLoading || isSwitchingGame"
      class="absolute inset-0 flex flex-col items-center justify-center bg-white z-50">

      <img :src="AqadaImage" class="animate-pulse mb-4" />
      <p class="text-gray-500 text-sm">Loading game...</p>
    </div>

    <!-- GAME AREA -->
    <div class="flex-1 relative overflow-hidden">
      <transition enter-active-class="transition-transform duration-500 ease-in-out"
        enter-from-class="-translate-y-full" leave-active-class="transition-transform duration-500 ease-in-out"
        leave-to-class="translate-y-full" mode="out-in">
        <iframe v-if="iframeUrl" :key="iframeKey" :src="iframeUrl" class="w-full h-full border-0"
          @load="onIframeLoaded" />
      </transition>
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

          <!-- ❓ How to play -->
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

    <!-- ✅ HOW TO PLAY MODAL -->
    <div v-if="showHowToPlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      <div class="bg-white rounded-xl w-11/12 max-w-lg p-6 relative" @click.stop>

        <button @click="showHowToPlay = false" class="absolute top-3 right-3 text-lg">✕</button>

        <h2 class="text-xl font-bold mb-4">How to Play</h2>

        <p>
          {{ currentGameData?.game_type_how_to?.content || 'Instructions not available' }}
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useGameStore } from "../stores/useGameStore";
import { useUserStore } from "../stores/useUserStore";
import axios from "axios";
import AqadaImage from "/Aqada.jpg";

/* stores */
const gameStore = useGameStore();
const userStore = useUserStore();

/* state */
const currentGame = ref(0);
const iframeKey = ref(0);
const isSwitchingGame = ref(false);
const userId = ref(null);
const initialSequence = ref(null);

const canGoUp = ref(false);
const canGoDown = ref(true);
const showHowToPlay = ref(false);

/* computed */
const games = computed(() => gameStore.games);
const isLoading = computed(() => gameStore.isLoading);

const currentGameData = computed(() => {
  return games.value[currentGame.value] || {};
});

const iframeUrl = computed(() => {
  if (!games.value.length || !userId.value) {
    console.warn("⚠️ Missing data for iframe:", {
      games: games.value.length,
      userId: userId.value
    });
    return "";
  }

  return getGameUrl(games.value[currentGame.value], userId.value);
});

/* lifecycle */
onMounted(async () => {
  // ✅ STEP 1: Create user
  await userStore.createUnsignedUser();

  // ✅ STEP 2: Get userId
  userId.value =
    userStore.userId || localStorage.getItem("userId");

  // ✅ fallback safety
  if (userId.value) {
    localStorage.setItem("currentUserId", userId.value);
  }

  // ❗ STOP if no userId
  if (!userId.value) {
    console.error("❌ userId missing");
    return;
  }

  // ✅ STEP 3: Fetch games
  await gameStore.fetchGames();

  const seq = games.value[0]?.publish_sequence_no;

  // ✅ store initial sequence
  initialSequence.value = seq;

  canGoUp.value = false;
  canGoDown.value = seq !== 1;

  localStorage.setItem("current_sequence_no", seq);
});

/* URL BUILDER */
const getGameUrl = (game, userId) => {
  const url = new URL(game.game_url);

  if (!url.searchParams.has("quiz") && game.game_url.includes("trivia")) {
    url.searchParams.set("quiz", game._id);
  }

  if (!url.searchParams.has("seek") && game.game_url.includes("seek")) {
    url.searchParams.set("seek", game._id);
  }

  url.searchParams.set("user", userId);
  url.searchParams.set("game_id", game._id);

  const finalUrl = url.toString();

  console.log("🎯 IFRAME URL:", finalUrl);

  return finalUrl;
};

/* iframe loaded */
function onIframeLoaded() {
  setTimeout(() => {
    const iframe = document.querySelector("iframe");

    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "USER_ID_READY", userId: userId.value },
        "*"
      );
    }

    isSwitchingGame.value = false;
  }, 100);
}

/* date */
function formatPublishDate(dateTime) {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* SWITCH GAME */
async function switchGame(direction, scrollDir) {
  if (!games.value.length) return;

  if (isSwitchingGame.value) return;

  if (direction === "up" && !canGoUp.value) return;
  if (direction === "down" && !canGoDown.value) return;

  isSwitchingGame.value = true;

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

    if (res.data) {
      const newGame = res.data;

      gameStore.games = [newGame];
      currentGame.value = 0;
      iframeKey.value++;

      const seq = newGame.publish_sequence_no;

      // ✅ store sequence
      localStorage.setItem("current_sequence_no", seq);

      // ✅ DOWN logic
      canGoDown.value = seq !== 1;

      // ✅ UP logic (🔥 FIX)
      if (seq === initialSequence.value) {
        canGoUp.value = false; // back to first game
      } else {
        canGoUp.value = true;
      }

      console.log("✅ Loaded sequence:", seq);
    }

  } catch (error) {
    console.error("❌ Navigation failed:", error?.response?.status);

    if (error.response?.status === 503 || error.response?.status === 404) {

      if (direction === "up") {
        // ❌ No more newer games
        canGoUp.value = false;
        canGoDown.value = true; // still can go down
      }

      if (direction === "down") {
        // ❌ No more older games
        canGoDown.value = false;
        canGoUp.value = true; // still can go up
      }

      console.log(`🛑 No more games in ${direction.toUpperCase()}`);
    }
  } finally {
    isSwitchingGame.value = false;
  }
}
</script>