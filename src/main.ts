import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useBeverageStore } from "./stores/beverageStore";
import "./firebase";
import "./styles/mug.scss";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

app.mount("#app");  

const store = useBeverageStore();
store.init();       
