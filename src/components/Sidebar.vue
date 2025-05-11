<script setup>
import { Utils } from "../utils/Utils.js";

const configSidebar = Utils.sideBarConfig();
</script>

<template>
  <div class="col-md-3">
    <div class="list-group gap-2">
      <template v-for="config in configSidebar" :key="config.routeName.name">
        <RouterLink
          :to="config.routeName"
          class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
          active-class="active_page"
        >
          {{ config.pageTitle }}
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
.active_page {
  color: #1e4db7;
  font-weight: bold;
}
</style>
