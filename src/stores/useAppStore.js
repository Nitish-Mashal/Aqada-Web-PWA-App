import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    lastOpenDate: localStorage.getItem("lastOpenDate") || ""
  }),

  actions: {
    checkMorningRefresh() {
      const now = new Date();

      const today = now.toISOString().split("T")[0];

      // 6:30 AM
      const refreshTime = new Date();
      refreshTime.setHours(6, 30, 0, 0);

      // First open after 6:30 AM
      if (now >= refreshTime && this.lastOpenDate !== today) {
        this.lastOpenDate = today;

        localStorage.setItem("lastOpenDate", today);

        // prevent refresh loop
        if (!sessionStorage.getItem("morning_refresh_done")) {
          sessionStorage.setItem("morning_refresh_done", "true");

          window.location.reload();
        }
      }
    }
  }
});