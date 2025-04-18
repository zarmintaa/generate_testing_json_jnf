<script setup>
import Form from "./Form.vue";
import Sidebar from "./Sidebar.vue";
import Content from "./Content.vue";
import Layout from "./Layout.vue";
</script>

<template>
  <Layout>
    <Sidebar />
    <Content>
      <div class="card">
        <div class="card-header card-header-pills">
          <h5 class="text-black">Manual Template</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent>
            <div class="mb-3">
              <label for="formFile" class="form-label"
                >Upload Json Template</label
              >
              <input
                class="form-control"
                type="file"
                name="file_templae_json"
                id="file-json"
                accept=".json"
              />
            </div>
            <div class="mb-3">
              <label for="formFile" class="form-label">Upload Json Data</label>
              <input
                class="form-control"
                type="file"
                name="json_date"
                id="file-json"
                accept=".json"
              />
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </Content>
  </Layout>
</template>

<style scoped></style>
