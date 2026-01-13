import { createApp } from "vue";
import App from "./app/App.vue";
import pinia from "./app/pinia";
import router from "./router/index";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount("#app");

