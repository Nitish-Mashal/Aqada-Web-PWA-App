// src/stores/useGameStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGameStore = defineStore("gameStore", {
  state: () => ({
    games: [],
    isLoading: false,
  }),

  actions: {
    async fetchGames() {
      try {
        this.isLoading = true;

        // ✅ Check if data already exists in localStorage
        const storedGames = localStorage.getItem("aqada_games");
        if (storedGames) {
          this.games = JSON.parse(storedGames);
          console.log("Loaded games from localStorage ✅");
          this.isLoading = false;
          return;
        }

        // ✅ API call if not in localStorage
        const response = await axios.get("https://aqada.online/games/get-my-games");
        if (response.data && Array.isArray(response.data)) {
          // Sort by publish_sequence_no ascending (optional but clean)
          this.games = response.data.sort((a, b) => a.publish_sequence_no - b.publish_sequence_no);

          // Save to localStorage for caching
        //   localStorage.setItem("aqada_games", JSON.stringify(this.games));

          console.log("Fetched games from API ✅");
        } else {
          console.error("Invalid game data format");
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        this.isLoading = false;
      }
    },

    getGameBySequence(sequenceNo) {
      return this.games.find(game => game.publish_sequence_no === sequenceNo);
    },
  },
});
