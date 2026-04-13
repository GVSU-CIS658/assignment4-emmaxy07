import { defineStore } from "pinia";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { app } from "../firebase";
import type { User } from "firebase/auth";
import tempretures from "../data/tempretures.json";
import basesData from "../data/bases.json";
import creamersData from "../data/creamers.json";
import syrupsData from "../data/syrups.json";
import type { BaseBeverageType, CreamerType, SyrupType, BeverageType } from "../types/beverage";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    // Auth
    user: null as User | null,

    // Ingredient lists — start from JSON so the cup renders correctly
    // before Firestore responds; init() will override with Firestore data
    temps: tempretures as string[],
    bases: basesData as BaseBeverageType[],
    creamers: creamersData as CreamerType[],
    syrups: syrupsData as SyrupType[],

    // Current selections — JSON[0] matches what Beverage.vue checks against
    // ("No Creamer", "No Syrup") so the cup looks correct immediately
    currentTemp: tempretures[0] as string,
    currentBase: basesData[0] as BaseBeverageType,
    currentCreamer: creamersData[0] as CreamerType,
    currentSyrup: syrupsData[0] as SyrupType,

    // Beverage builder
    beverageName: "",
    currentBeverage: null as BeverageType | null,
    savedBeverages: [] as BeverageType[],

    // Internal — active Firestore listener handle
    _unsubscribeBeverages: null as (() => void) | null,
  }),

  actions: {
    async init() {
      const db = getFirestore(app);

      const [basesSnap, creamersSnap, syrupsSnap] = await Promise.all([
        getDocs(collection(db, "bases")),
        getDocs(collection(db, "creamers")),
        getDocs(collection(db, "syrups")),
      ]);

      if (!basesSnap.empty) {
        this.bases = basesSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<BaseBeverageType, "id">),
        }));
        this.currentBase = this.bases[0];
      }

      if (!creamersSnap.empty) {
        this.creamers = creamersSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CreamerType, "id">),
        }));
        this.currentCreamer = this.creamers[0];
      }

      if (!syrupsSnap.empty) {
        this.syrups = syrupsSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<SyrupType, "id">),
        }));
        this.currentSyrup = this.syrups.find((s) => s.name === "No Syrup") ?? syrupsData[0];
      }
    },

    
    setUser(user: User | null) {
      this.user = user;

      if (this._unsubscribeBeverages) {
        this._unsubscribeBeverages();
        this._unsubscribeBeverages = null;
      }

      if (!user) {
        this.savedBeverages = [];
        this.currentBeverage = null;
        return;
      }

      const db = getFirestore(app);
      const beveragesQuery = query(
        collection(db, "beverages"),
        where("uid", "==", user.uid)
      );

      this._unsubscribeBeverages = onSnapshot(beveragesQuery, (snapshot) => {
        this.savedBeverages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<BeverageType, "id">),
        }));

        if (this.currentBeverage) {
          const updated = this.savedBeverages.find(
            (b) => b.id === this.currentBeverage!.id
          );
          this.currentBeverage = updated ?? null;
        }

        if (!this.currentBeverage && this.savedBeverages.length) {
          this.currentBeverage = this.savedBeverages[this.savedBeverages.length - 1];
        }
      });
    },

   
    async makeBeverage(): Promise<string> {
      if (!this.user) {
        return "No user logged in, please sign in first.";
      }

      if (!this.beverageName.trim()) {
        return "Please complete all beverage options and the name before making a beverage.";
      }

      const db = getFirestore(app);
      const name = this.beverageName.trim();
      const uniqueId = `${this.user.uid}_${Date.now()}`;

      const newBeverage: BeverageType = {
        id: uniqueId,
        name,
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
      };

      await addDoc(collection(db, "beverages"), {
        ...newBeverage,
        uid: this.user.uid,
      });

      this.savedBeverages.push(newBeverage);
      this.currentBeverage = newBeverage;
      this.beverageName = "";

      return `Beverage ${name} made successfully!`;
    },

    
    showBeverage(beverage: BeverageType) {
      this.currentBeverage = beverage;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentSyrup = beverage.syrup;
      this.currentCreamer = beverage.creamer;
    },
  },
});
