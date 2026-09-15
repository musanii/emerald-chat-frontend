import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useAuthStore = defineStore("auth", () => {
  //state
  const user = ref(JSON.parse(localStorage.getItem("emerald_user")) || null);
  const token = ref(localStorage.getItem("emerald_token") || null);

  //Getters
  const isAuthenticated = computed(() => !!token.value);

  //Actions
  async function login(credentials) {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/login",
        credentials,
      );

      token.value = response.data.token;
      user.value = response.data.user;

      localStorage.setItem("emerald_token", token.value);
      localStorage.setItem("emerald_user", JSON.stringify(user.value));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Authentication failed. Please check your credentials.",
      };
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("emerald_token");
    localStorage.removeItem("emerald_user");
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
});
