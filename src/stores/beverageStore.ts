import { defineStore } from "pinia";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import creamers from "../data/creamers.json";
import syrups from "../data/syrups.json";
import type { BeverageType } from "../types/beverage";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: bases,
    creamers: creamers,
    syrups: syrups,
    currentBase: bases[0],
    currentCreamer: creamers[0],
    currentSyrup: syrups[0],
    beverageName: "",
    savedBeverages: [] as BeverageType[],
  }),

  actions: {
    makeBeverage() {
      if (!this.beverageName.trim()) return;
      const newBeverage: BeverageType = {
        id: Date.now().toString(),
        name: this.beverageName.trim(),
        temp: this.currentTemp,
        base: this.currentBase,
        syrup: this.currentSyrup,
        creamer: this.currentCreamer,
      };
      this.savedBeverages.push(newBeverage);
      this.beverageName = "";
    },

    showBeverage(beverage: BeverageType) {
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentSyrup = beverage.syrup;
      this.currentCreamer = beverage.creamer;
    },
  },
  persist: false,
});
