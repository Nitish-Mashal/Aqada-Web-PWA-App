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

        // 🔹 normalize response (API may return object)
        this.games = Array.isArray(response.data)
          ? response.data
          : [response.data];

        // 🔹 sort by sequence
        this.games.sort(
          (a, b) => a.publish_sequence_no - b.publish_sequence_no
        );

        // 🔹 save sequence to localStorage
        if (this.games.length) {
          const firstSequence = this.games[0].publish_sequence_no;
          localStorage.setItem("current_sequence_no", firstSequence);
        }

        console.log("Games loaded ✅", this.games);

      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        this.isLoading = false;
      }
    },

    getGameBySequence(sequenceNo) {
      return this.games.find(
        g => g.publish_sequence_no === sequenceNo
      );
    },
  },
});