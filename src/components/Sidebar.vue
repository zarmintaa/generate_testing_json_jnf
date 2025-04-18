<script setup></script>

<template>
  <div class="col-md-3">
    <div class="list-group gap-2">
      <RouterLink
        to="/"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >Setting Template</RouterLink
      >
      <RouterLink
        to="ppd-baru"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        active-class="active_page"
        >PPD Baru</RouterLink
      >
      <!--      <RouterLink
        to="#"
        class="p-3 bg-white border list-group-item list-group-item-action text-decoration-none"
        >Angsuran</RouterLink
      >-->
    </div>
  </div>
</template>

<style scoped>
.active_page {
  color: #1e4db7;
  font-weight: bold;
}
</style>
