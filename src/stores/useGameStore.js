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

        const response = await axios.get(
          "https://aqada.online/games/get-my-games"
        );

        if (!response.data) return;

        this.games = Array.isArray(response.data)
          ? response.data
          : [response.data];

        this.games.sort(
          (a, b) => a.publish_sequence_no - b.publish_sequence_no
        );

        // ✅ STORE sequence
        if (this.games.length) {
          const sequence = this.games[0].publish_sequence_no;
          localStorage.setItem("current_sequence_no", sequence);
        }

      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});