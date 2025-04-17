<script setup>
import Content from "./Content.vue";
import Form from "./Form.vue";
import Layout from "./Layout.vue";
import Sidebar from "./Sidebar.vue";
</script>

<template>
  <Layout>
    <Sidebar />
    <Content>
      <Form />
    </Content>
  </Layout>
</template>

<style scoped></style>
