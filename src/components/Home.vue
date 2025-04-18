<script setup>
import { ref, watch } from "vue";
import { useFileStore } from "../store/fileStore";
import { storeToRefs } from "pinia";
import Layout from "./Layout.vue";
import Sidebar from "./Sidebar.vue";
import Content from "./Content.vue";

const fileStore = useFileStore();
const { docNo, jsonName, sourceSystem } = storeToRefs(fileStore);
const templatePreview = ref(null);
const uploadError = ref(null);

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    uploadError.value = null;
    await fileStore.setNewTemplate(file);
    updateTemplatePreview();
  } catch (error) {
    console.error("Template upload failed:", error);
    uploadError.value = error.message || "Invalid template file";
  }
};

const updateTemplatePreview = () => {
  templatePreview.value = fileStore.setJsonTemplateProperties({
    docNo: docNo.value,
    jsonName: jsonName.value,
    sourceSystem: sourceSystem.value,
  });
};

watch([docNo, jsonName, sourceSystem], () => updateTemplatePreview(), {
  immediate: true,
});
</script>

<template>
  <Layout>
    <div class="card">
      <div class="card-header card-header-tabs">
        <h5 class="text-black">Setting Template</h5>
      </div>
      <div class="card-body">
        <!-- Form inputs remain the same -->
        <div class="mb-3">
          <label for="docNo" class="form-label">Document Number</label>
          <input
            v-model="docNo"
            class="form-control"
            type="text"
            id="docNo"
            placeholder="Enter Document Number"
          />
        </div>
        <form @submit.prevent>
          <div class="mb-3">
            <label for="jsonName" class="form-label">JSON Name</label>
            <input
              v-model="jsonName"
              class="form-control"
              type="text"
              id="jsonName"
              placeholder="Enter JSON Name"
            />
          </div>

          <div class="mb-3">
            <label for="sourceSystem" class="form-label">Source System</label>
            <input
              v-model="sourceSystem"
              class="form-control"
              type="text"
              id="sourceSystem"
              placeholder="Enter Source System"
            />
          </div>
        </form>

        <!--          <form>-->
        <!--            <div class="mb-3">-->
        <!--              <label for="newTemplate" class="form-label"-->
        <!--                >Upload Template</label-->
        <!--              >-->
        <!--              <input-->
        <!--                class="form-control"-->
        <!--                type="file"-->
        <!--                id="newTemplate"-->
        <!--                accept=".json"-->
        <!--                @change="handleFileChange"-->
        <!--              />-->
        <!--              <div v-if="uploadError" class="text-danger mt-2">-->
        <!--                {{ uploadError }}-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </form>-->

        <div class="card mt-4">
          <div class="card-header">
            <div>Setting Properties</div>
          </div>
          <div class="card-body">
            <div class="mb-2">
              <strong>Document Number:</strong> {{ docNo || "Not specified" }}
            </div>

            <div class="mb-2">
              <strong>JSON Name:</strong> {{ jsonName || "Not specified" }}
            </div>

            <div class="mb-2">
              <strong>Source System:</strong>
              {{ sourceSystem || "Not specified" }}
            </div>
          </div>
        </div>

        <div v-if="templatePreview" class="mt-4">
          <div class="card">
            <div class="card-header">Template JSON Structure</div>
            <div class="card-body">
              <pre class="bg-light p-3 rounded">{{
                JSON.stringify(templatePreview, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
/* Your existing styles remain the same */
.card-header-pills {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  padding: 0.75rem 1.25rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.rounded {
  border-radius: 0.25rem !important;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-bottom: 0;
}

.text-danger {
  color: #dc3545;
}
</style>
