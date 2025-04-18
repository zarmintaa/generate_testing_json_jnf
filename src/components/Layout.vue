<script setup>
import Sidebar from "./Sidebar.vue";
import Content from "./Content.vue";

console.log("Home");
</script>

<template>
  <div class="container-fluid my-5">
    <div class="container">
      <div class="row">
        <Sidebar />
        <Content>
          <slot />
        </Content>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
