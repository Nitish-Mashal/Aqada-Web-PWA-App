<template>
    <div class="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div class="rounded-2xl p-8 w-full max-w-md text-center">
            <!-- Top Icon -->
            <div class="flex justify-center mb-4">
                <img src="/Aqada.jpg" alt="App Icon" class="" />
            </div>

            <h2 class="text-2xl font-semibold mb-6 text-gray-800">Login</h2>

            <!-- Login with Google -->
            <button
                class="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2 mb-4 hover:bg-gray-50 transition">
                <img src="https://www.svgrepo.com/show/355037/google.svg" class="w-5 h-5" alt="Google" />
                <span class="text-gray-700">Login with Google</span>
            </button>

            <div class="flex items-center mb-6">
                <div class="flex-grow h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">or</span>
                <div class="flex-grow h-px bg-gray-300"></div>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <input type="text" v-model="username" placeholder="Username"
                        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <input type="password" v-model="password" placeholder="Password"
                        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="flex justify-end text-sm">
                    <a href="#" class="text-blue-600 hover:underline">Forgot Password?</a>
                </div>

                <button type="submit"
                    class="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition">
                    Login
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");

const handleLogin = () => {
    console.log("Username:", username.value);
    console.log("Password:", password.value);
    router.push("/gameArea");
};
</script>
  
