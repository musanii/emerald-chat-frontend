import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import ChatView from "../views/ChatView.vue";
import RegisterView from "../views/RegisterView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  { path: "/register",
    name: "register",
    component: RegisterView
   },
  {
    path: "/app",
    name: "chat",
    component: ChatView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
