<template>
  <!-- ROOT -->
  <div class="w-screen h-[100dvh] flex flex-col overflow-hidden relative bg-white">

    <!-- 🔥 Splash / Loading -->
    <div v-if="isLoading || isSwitchingGame"
      class="absolute inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-300">
      <img :src="AqadaImage" alt="Loading..." class="animate-bounce" />
    </div>

    <!-- GAME AREA -->
    <div class="flex-1 relative overflow-hidden">
      <transition enter-active-class="transition-transform duration-500 ease-in-out opacity-100"
        enter-from-class="-translate-y-full opacity-0"
        leave-active-class="transition-transform duration-500 ease-in-out opacity-100"
        leave-to-class="translate-y-full opacity-0" mode="out-in">
        <iframe v-if="iframeUrl" :key="iframeKey" :src="iframeUrl" class="w-full h-full border-0"
          @load="onIframeLoaded" />
      </transition>
    </div>

    <!-- DIVIDER -->
    <hr class="flex-none m-0" />

    <!-- BOTTOM CONTROLS -->
    <div class="flex-none h-16 w-full px-4 flex items-center justify-between bg-white relative">

      <!-- Previous -->
      <button @click="switchGame('prev', 'up')" class="flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <!-- Title -->
      <div v-if="games.length" class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
        <div class="flex items-center gap-2">
          <div class="text-lg font-semibold">
            {{ currentGameData.game_type_name }}
          </div>

          <!-- How to play -->
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

      <!-- Next -->
      <button @click="switchGame('next', 'down')" class="flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0
            9 9 0 0 1 18 0Z" />
        </svg>
      </button>
    </div>

    <!-- HOW TO PLAY MODAL -->
    <div v-if="showHowToPlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg p-6 relative">
        <button @click="showHowToPlay = false" class="absolute top-3 right-3">✕</button>
        <h2 class="text-xl font-bold mb-4">How to Play</h2>
        <p>{{ currentGameData?.game_type_how_to?.content }}</p>
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
const showHowToPlay = ref(false);
const isSwitchingGame = ref(false);
const userId = ref(null);

/* computed */
const games = computed(() => gameStore.games);
const isLoading = computed(() => gameStore.isLoading);

const currentGameData = computed(() => {
  return games.value[currentGame.value] || {};
});

const iframeUrl = computed(() => {
  if (!games.value.length) return "";

  if (!userId.value) {
    console.warn("⚠️ Warning: userId not available yet");
    return "";
  }

  return getGameUrl(games.value[currentGame.value], userId.value);
});

/* lifecycle */
onMounted(async () => {
  // ✅ Step 1: Create user first
  await userStore.createUnsignedUser();

  // ✅ Step 2: Get userId from store
  userId.value = userStore.userId || localStorage.getItem("userId");

  console.log("✅ GameArea mounted - userId:", userId.value);

  // ✅ Step 3: Store userId in localStorage
  if (userId.value) {
    localStorage.setItem("currentUserId", userId.value);
    console.log("✅ userId stored in localStorage as 'currentUserId':", userId.value);
  }

  // ✅ Step 4: Fetch games
  await gameStore.fetchGames();
});

/* URL BUILDER */
/* URL BUILDER */
const getGameUrl = (game, userId) => {
  if (!userId) {
    console.error("❌ getGameUrl: userId is empty");
    return "";
  }

  const url = new URL(game.game_url);

  if (!url.searchParams.has("quiz") && game.game_url.includes("trivia")) {
    url.searchParams.set("quiz", game._id);
  }

  if (!url.searchParams.has("seek") && game.game_url.includes("seek")) {
    url.searchParams.set("seek", game._id);
  }

  // ✅ CRITICAL: Pass user in URL
  url.searchParams.set("user", userId);
  url.searchParams.set("game_id", game._id);

  const finalUrl = url.toString();

  // ✅ Debug: Log the exact URL being generated
  console.log("✅ Generated iframe URL:", finalUrl);
  console.log("   Includes user param?", url.searchParams.has("user"));
  console.log("   user value:", url.searchParams.get("user"));

  return finalUrl;
};

/* iframe loaded → stop loader */
function onIframeLoaded() {
  console.log("🔥 Iframe loaded, notifying child component");

  setTimeout(() => {
    const iframe = document.querySelector("iframe");

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "USER_ID_READY", userId: userId.value },
        "*"
      );
      console.log("✅ Sent userId to iframe via postMessage");
    }

    isSwitchingGame.value = false;
  }, 100);
}

function formatPublishDate(dateTime) {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* 🔥 SWITCH GAME */
async function switchGame(direction, scrollDir = "none") {
  if (!games.value.length) return;

  isSwitchingGame.value = true;

  const currentSequence = games.value[currentGame.value]?.publish_sequence_no;

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
      gameStore.games = [res.data];
      currentGame.value = 0;
      iframeKey.value++;
    }

  } catch (e) {
    console.error("❌ API error:", e);
    isSwitchingGame.value = false;
  }
}
</script>