import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import PpdBaru from "./components/PpdBaru.vue";
import Layout from "./components/Layout.vue";

const pinia = createPinia();
const router = createRouter({
  routes: [
    {
      path: "/",
      component: () => import("./components/Home.vue"),
      name: "setting-template",
      props: {
        title: "Setting Template",
      },
    },
    {
      path: "/ppd-baru",
      component: () => import("./components/PpdBaru.vue"),
      name: "ppd-baru",
      props: {
        title: "Generate JSON",
      },
    },
  ],
  history: createWebHistory(),
});

createApp(App).use(pinia).use(router).mount("#app");
