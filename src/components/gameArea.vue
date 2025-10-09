<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden relative">
    <!-- Splash / Loading Screen -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white z-50">
      <img src="/Aqada.jpg" alt="Loading..." class="animate-bounce" />
    </div>

    <!-- Main Content Start -->
    <div class="flex-grow flex items-center justify-center w-full h-full relative overflow-hidden">
      <transition enter-active-class="transition-transform duration-500 ease-in-out opacity-100"
        enter-from-class="-translate-y-full opacity-0"
        leave-active-class="transition-transform duration-500 ease-in-out opacity-100"
        leave-to-class="translate-y-full opacity-0" mode="out-in">
        <iframe v-if="games.length" :key="currentGame" :src="games[currentGame].game_url"
          class="w-full h-full border-none absolute"></iframe>
      </transition>
    </div>
    <!-- Main Content End -->

    <!-- Bottom Content Start -->
    <hr />
    <div class="mt-auto mb-3 w-full">
      <div class="flex justify-between items-center px-4 relative">
        <!-- Back Button -->
        <button @click="showPreviousGame" class="flex justify-center items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-10">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>

        <!-- Game Name with "How to Play" Icon -->
        <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2" v-if="games.length">
          <!-- Question Mark Icon -->
          <button @click="showHowToPlay = true" class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"
              class="w-6 h-6 text-blue-600 hover:text-blue-800 cursor-pointer">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.25 14.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-2.25-7a2.75 2.75 0 1 1 4.75 2.03c-.46.45-.85.78-1.11 1.04-.32.32-.39.5-.39.88v.25a.75.75 0 0 1-1.5 0v-.25c0-.96.39-1.56.86-2.04.22-.22.52-.48.92-.87a1.25 1.25 0 1 0-2.28-.84.75.75 0 0 1-1.4-.5Z" />
            </svg>
          </button>

          <!-- Game Name -->
          <div class="text-lg font-semibold">
            {{ games[currentGame].game_type_name }}
          </div>
        </div>

        <!-- Next Button -->
        <button @click="showNextGame" class="flex justify-center items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-10">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      </div>
    </div>
    <!-- Bottom Content End -->

    <!-- "How to Play" Popup Modal -->
    <div v-if="showHowToPlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg max-h-[60vh] p-6 overflow-y-auto shadow-lg relative">
        <!-- Close Button (top-right) -->
        <button @click="showHowToPlay = false"
          class="absolute top-3 right-3 text-gray-700 hover:text-black text-xl font-bold">
          ✕
        </button>

        <h2 class="text-xl font-bold mb-4">How to Play</h2>

        <!-- Example Content (text + image) -->
        <p class="mb-2">
          Follow these instructions to play the game. Use the controls to navigate and score points.
        </p>

        <img src="/Aqada.jpg" alt="Game Instructions" class="rounded-lg mb-4" />
        <p class="mb-2">1. Use arrow keys or swipe gestures to move.</p>
        <p class="mb-2">2. Collect coins and avoid obstacles.</p>
        <p class="mb-2">3. Reach the highest score possible!</p>

        <img src="/Aqada.jpg" alt="Game Instructions" class="rounded-lg mb-4" />
        <p class="mb-2">1. Use arrow keys or swipe gestures to move.</p>
        <p class="mb-2">2. Collect coins and avoid obstacles.</p>
        <p class="mb-2">3. Reach the highest score possible!</p>

        <img src="/Aqada.jpg" alt="Game Instructions" class="rounded-lg mb-4" />
        <p class="mb-2">1. Use arrow keys or swipe gestures to move.</p>
        <p class="mb-2">2. Collect coins and avoid obstacles.</p>
        <p class="mb-2">3. Reach the highest score possible!</p>

      </div>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
  name: "GameArea",
  data() {
    return {
      currentGame: 0,
      games: [],
      isLoading: true,
      showHowToPlay: false, // NEW state for popup
    };
  },
  async mounted() {
    await this.fetchGames();
    this.showLoader();
  },
  watch: {
    currentGame(newIndex, oldIndex) {
      if (this.games.length > 0) {
        this.updateGameStatus(oldIndex, "inactive");
        this.updateGameStatus(newIndex, "active");
      }
    },
  },
  methods: {
    async fetchGames() {
      try {
        const response = await axios.get("http://localhost:5000/games");
        if (response.data && response.data.length) {
          this.games = response.data;
          this.updateGameStatus(this.currentGame, "active");
        } else {
          console.error("No games found in API response.");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    },
    updateGameStatus(index, status) {
      if (this.games.length > 0 && this.games[index]) {
        const gameId = this.games[index]._id;
        Cookies.set("_id", gameId, { expires: 7, path: "/" });
        Cookies.set("gameStatus", status, { expires: 7, path: "/" });
        console.log(`Stored game ID: ${gameId} with status: ${status}`);
      }
    },
    showLoader() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 3000);
    },
    showPreviousGame() {
      const oldIndex = this.currentGame;
      this.currentGame = (this.currentGame - 1 + this.games.length) % this.games.length;
      this.updateGameStatus(oldIndex, "inactive");
      this.showLoader();
    },
    showNextGame() {
      const oldIndex = this.currentGame;
      this.currentGame = (this.currentGame + 1) % this.games.length;
      this.updateGameStatus(oldIndex, "inactive");
      this.showLoader();
    },
  },
};
</script>
