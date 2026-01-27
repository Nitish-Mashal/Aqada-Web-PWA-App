// src/stores/useUserStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: localStorage.getItem('userId') || null, // persist from localStorage
    }),

    actions: {
        async createUnsignedUser() {
            try {
                // Only create if not already present
                if (!this.userId) {
                    const response = await axios.post('https://aqada.online/users/create-unsigned-user');
                    if (response.data) {
                        this.userId = response.data; // API returns userId as plain string
                        localStorage.setItem('userId', this.userId);
                        console.log('Unsigned User Created:', this.userId);
                    }
                } else {
                    console.log('Existing Unsigned User ID:', this.userId);
                }
            } catch (error) {
                console.error('Error creating unsigned user:', error);
            }
        
        },
    },
})
