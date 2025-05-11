import { createRouter, createWebHistory } from "vue-router";

export const routes = createRouter({
  routes: [
    {
      path: "/",
      redirect: "/setting-template-disburse",
    },
    {
      path: "/setting-template-disburse",
      component: () => import("./pages/SettingTemplateDisburse.vue"),
      name: "setting-template-disburse",
      props: {
        title: "Setting Template Disburse",
      },
    },
    {
      path: "/setting-template-penerusan",
      component: () => import("./pages/SettingTemplatePenerusan.vue"),
      name: "setting-template-penerusan",
      props: {
        title: "Setting Template Penerusan",
      },
    },
    {
      path: "/ppd-baru",
      component: () => import("./pages/PpdBaru.vue"),
      name: "ppd-baru",
      props: {
        title: "PPD Baru",
      },
    },
    {
      path: "/penerusan",
      component: () => import("./pages/Penerusan.vue"),
      name: "penerusan",
      props: {
        title: "Penerusan",
      },
    },
  ],
  history: createWebHistory(),
});
