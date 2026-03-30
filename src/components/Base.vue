<template>
  <div class="baseBeverage" :style="{ backgroundColor: base.color }"></div>
</template>

<script setup lang="ts">
import type { BaseBeverageType } from "../stores/beverage";

defineProps<{
  base: BaseBeverageType;
}>();
</script>

<style scoped>
.baseBeverage {
  position: relative;
  width: 100%;
  height: 100%;
  bottom: 0;
  animation: pour-tea 2s;
  z-index: 300;
}
</style>