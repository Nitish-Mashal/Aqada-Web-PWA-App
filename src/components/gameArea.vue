<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden relative">

    <!-- Splash / Loading -->
    <div v-if="isLoading || isSwitchingGame" class="absolute inset-0 flex items-center justify-center bg-white z-50">
      <img :src="AqadaImage" alt="Loading..." class="animate-bounce" />
    </div>

    <!-- Game Area -->
    <div class="flex-grow flex items-center justify-center w-full h-full relative overflow-hidden">
      <transition enter-active-class="transition-transform duration-500 ease-in-out opacity-100"
        enter-from-class="-translate-y-full opacity-0"
        leave-active-class="transition-transform duration-500 ease-in-out opacity-100"
        leave-to-class="translate-y-full opacity-0" mode="out-in">
        <iframe v-if="games.length" :key="currentGame" :src="games[currentGame].game_url"
          class="w-full h-full border-none absolute" @load="onIframeLoaded" />
      </transition>
    </div>

    <!-- Bottom Controls -->
    <hr class="mb-4 mt-0" />
    <div class="mt-auto mb-3 w-full">
      <div class="flex justify-between items-center px-4 relative">

        <!-- Previous Game (UP) -->
        <button @click="switchGame('prev', 'up')" class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>

        <!-- Game Title -->
        <div v-if="games.length" class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center">

          <div class="flex items-center gap-2">
            <div class="text-lg font-semibold">
              {{ games[currentGame].game_type_name }}
            </div>

            <!-- How To Play Button -->
            <button @click="showHowToPlay = true" class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0
                 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442
                 -.745.361-1.45.999-1.45 1.827v.75
                 M21 12a9 9 0 1 1-18 0
                 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </button>
          </div>

          <div class="text-sm text-gray-500 leading-tight">
            {{ formatPublishDate(games[currentGame].publish_date_time) }}
          </div>

        </div>

        <!-- Next Game (DOWN) -->
        <button @click="switchGame('next', 'down')" class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-10 h-10">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0
               9 9 0 0 1 18 0Z" />
          </svg>
        </button>

      </div>
    </div>

    <!-- How To Play Modal -->
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
import Cookies from "js-cookie";
import axios from "axios";
import AqadaImage from "/Aqada.jpg";

/* stores */
const gameStore = useGameStore();
const userStore = useUserStore();

/* state */
const currentGame = ref(0);
const showHowToPlay = ref(false);
const isSwitchingGame = ref(false);

/* computed */
const games = computed(() => gameStore.games);
const isLoading = computed(() => gameStore.isLoading);
const currentGameData = computed(() => games.value[currentGame.value] || {});

/* lifecycle */
onMounted(async () => {
  await userStore.createUnsignedUser();
  await gameStore.fetchGames();
  updateLocalSequence();
});

/* methods */

function onIframeLoaded() {
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

function updateLocalSequence() {
  const savedSequence = localStorage.getItem("current_sequence_no");
  if (!savedSequence || !games.value.length) return;

  const index = games.value.findIndex(
    g => g.publish_sequence_no == savedSequence
  );

  if (index !== -1) {
    currentGame.value = index;
  }
}

async function switchGame(direction, scrollDir = "none") {
  if (!games.value.length) return;

  isSwitchingGame.value = true;

  if (direction === "next") {
    currentGame.value = (currentGame.value + 1) % games.value.length;
  } else {
    currentGame.value =
      (currentGame.value - 1 + games.value.length) % games.value.length;
  }

  const sequence = games.value[currentGame.value].publish_sequence_no;

  localStorage.setItem("current_sequence_no", sequence);
  Cookies.set("gameStatus", "active", { expires: 7 });

  try {
    const res = await axios.get(
      "https://aqada.online/games/get-my-games",
      {
        params: {
          sequence,
          scroll: scrollDir
        }
      }
    );

    console.log("API GAME RESPONSE:", res.data);

    // ✅ update store at current index
    if (res.data) {
      gameStore.games[currentGame.value] = res.data;
    }

  } catch (e) {
    console.error("API error:", e);
    isSwitchingGame.value = false;
  }
}

</script>
