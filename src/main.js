import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { routes } from "./routes.js";

const pinia = createPinia();

createApp(App).use(pinia).use(routes).mount("#app");
