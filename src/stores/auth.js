import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "../api/axios";

export const useAuthStore = defineStore("auth", () => {
  //state
  const user = ref(JSON.parse(localStorage.getItem("emerald_user")) || null);
  const token = ref(localStorage.getItem("emerald_token") || null);

  //Getters
  const isAuthenticated = computed(() => !!token.value);

  //Actions
  async function login(credentials) {
    try {
      const response = await apiClient.post( '/auth/login', credentials);

      token.value = response.data.access_token;
      user.value = response.data.user;

      localStorage.setItem("emerald_token", token.value);
      localStorage.setItem("emerald_user", JSON.stringify(user.value));

      return { success: true };
    } catch (error) {

      const apiMessage = error.response?.data?.errors?.email?.[0] 
      || error.response?.data?.message 
      || 'Invalid email or password.'
      return {
        success: false,
        message:
          apiMessage ||
          "Authentication failed. Please check your credentials.",
      }
    }
  }

  async function register(payload){
    try {

      const response = await apiClient.post('/register', payload)
      token.value = response.data.access_token
      token.user = response.data.user

      localStorage.setItem("emerald_token", token.value);
      localStorage.setItem("emerald_user", JSON.stringify(user.value));

      return {success:true}
      
    } catch (error) {
      return {
        success:false,
        message: error.response?.data?.message || 'Registration failed'
      }
      
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
    register,
    logout,
  };
});
