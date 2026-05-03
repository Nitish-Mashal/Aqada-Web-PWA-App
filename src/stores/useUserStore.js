import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        userId: localStorage.getItem("userId") || null,
    }),

    actions: {
        async createUnsignedUser() {
            try {
                if (this.userId) {
                    console.log("✅ Existing User:", this.userId);
                    return this.userId;
                }

                const response = await axios.post(
                    "https://aqada.online/users/create-unsigned-user"
                );

                if (response?.data) {
                    this.userId = response.data;

                    /* Only one localStorage key */
                    localStorage.setItem(
                        "userId",
                        this.userId
                    );

                    /* remove old duplicate key once */
                    localStorage.removeItem(
                        "currentUserId"
                    );

                    console.log(
                        "✅ Unsigned user created:",
                        this.userId
                    );

                    return this.userId;
                }
            } catch (error) {
                console.error(
                    "❌ User creation failed:",
                    error
                );
            }
        },
    },
});