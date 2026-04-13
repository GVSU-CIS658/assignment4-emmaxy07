<template>
  <div>
    <!-- Beverage preview -->
    <Beverage
      v-if="beverageStore.currentBase && beverageStore.currentCreamer && beverageStore.currentSyrup"
      :isIced="beverageStore.currentTemp === 'Cold'"
      :base="beverageStore.currentBase"
      :creamer="beverageStore.currentCreamer"
      :syrup="beverageStore.currentSyrup"
    />

    <!-- Controls -->
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`r${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="base in beverageStore.bases" :key="base.id">
          <label>
            <input
              type="radio"
              name="base"
              :id="`r${base.id}`"
              :value="base"
              v-model="beverageStore.currentBase"
            />
            {{ base.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="syrup in beverageStore.syrups" :key="syrup.id">
          <label>
            <input
              type="radio"
              name="syrup"
              :id="`r${syrup.id}`"
              :value="syrup"
              v-model="beverageStore.currentSyrup"
            />
            {{ syrup.name }}
          </label>
        </template>
      </li>
      <li>
        <template v-for="creamer in beverageStore.creamers" :key="creamer.id">
          <label>
            <input
              type="radio"
              name="creamer"
              :id="`r${creamer.id}`"
              :value="creamer"
              v-model="beverageStore.currentCreamer"
            />
            {{ creamer.name }}
          </label>
        </template>
      </li>
    </ul>

    <!-- Auth bar — sits just above the beverage name input -->
    <div id="auth-bar">
      <template v-if="beverageStore.user">
        <span>Signed in as <strong>{{ beverageStore.user.displayName || beverageStore.user.email }}</strong></span>
        <button @click="signOut">Sign out</button>
      </template>
      <template v-else>
        <button @click="withGoogle">Sign in with Google</button>
      </template>
    </div>

    <!-- Beverage name input — no label -->
    <input
      id="beverageName"
      type="text"
      placeholder="Beverage Name"
      v-model="beverageStore.beverageName"
    />
    <button
      @click="handleMakeBeverage"
      :disabled="!beverageStore.user"
    >
      🍺 Make Beverage
    </button>

    <!-- Messages — below the input -->
    <template v-if="!beverageStore.user">
      <p id="signin-hint">Please sign in to save your beverage.</p>
      <p v-if="signedOut" id="signout-notice">Signed out</p>
    </template>
    <p v-if="message" id="message">{{ message }}</p>
  </div>

  <!-- Saved beverages -->
  <div
    v-if="beverageStore.user && beverageStore.savedBeverages.length"
    id="beverage-container"
  >
    <label
      v-for="beverage in beverageStore.savedBeverages"
      :key="beverage.id"
    >
      <input
        type="radio"
        name="savedBeverage"
        :value="beverage"
        @change="beverageStore.showBeverage(beverage)"
      />
      {{ beverage.name }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { app } from "./firebase";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";

const beverageStore = useBeverageStore();
const message = ref<string | null>(null);
const signedOut = ref(false);

onMounted(() => {
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    beverageStore.setUser(user);
  });
});

async function withGoogle() {
  message.value = null;
  try {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    if (err instanceof Error) {
      message.value = `Sign-in failed: ${err.message}`;
    } else {
      message.value = "Sign-in failed. Please try again.";
    }
  }
}

async function signOut() {
  message.value = null;
  await firebaseSignOut(getAuth(app));
  signedOut.value = true;
  setTimeout(() => { signedOut.value = false; }, 2000);
}

async function handleMakeBeverage() {
  message.value = await beverageStore.makeBeverage();
}
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
}

#auth-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

#signin-hint {
  color: #000000;
  font-size: 0.9rem;
  margin-top: 6px;
  margin-bottom: 0;
}

#signout-notice {
  color: #000000;
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 2px;
}

#message {
  color: #000000;
  font-size: 0.9rem;
  margin-top: 6px;
}

#beverage-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 20px;
}
</style>
