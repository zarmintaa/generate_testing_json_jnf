import { createWebHistory } from "vue-router";

export const routes = {
  routes: [
    {
      path: "/",
      component: () => import("./components/Form.vue"),
      children: [
        {
          path: "",
          components: {
            default: () => import("./components/PpdBaru.vue"),
            sidebar: () => import("./components/Sidebar.vue"),
          },
          name: "home",
        },
      ],
    },
  ],
  history: createWebHistory(),
};
