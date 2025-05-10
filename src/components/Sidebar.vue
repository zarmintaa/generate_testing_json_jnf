<script setup></script>

<template>
  <div class="col-md-3">
    <div class="list-group gap-2">
      <RouterLink
        :to="{ name: 'setting-template-disburse' }"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >Setting Template Disburse</RouterLink
      >
      <RouterLink
        :to="{ name: 'setting-template-penerusan' }"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >Setting Template Penerusan</RouterLink
      >
      <RouterLink
        :to="{ name: 'ppd-baru' }"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >PPD Baru</RouterLink
      >
      <RouterLink
        :to="{ name: 'penerusan' }"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >Penerusan</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
.active_page {
  color: #1e4db7;
  font-weight: bold;
}
</style>
