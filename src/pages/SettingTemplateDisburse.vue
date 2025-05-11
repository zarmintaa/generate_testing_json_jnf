<script setup>
import { ref, watch } from "vue";
import { useFileStore } from "../store/fileStore.js";
import { storeToRefs } from "pinia";
import Layout from "../components/Layout.vue";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";
import { useTemplateStore } from "../store/templateStore.js";

const { title } = defineProps({
  title: String,
});
const templateStore = useTemplateStore();
const { jsonName, sourceSystem, senderDocNo } = storeToRefs(templateStore);

// const { senderDocNo, jsonName, sourceSystem } = storeToRefs(fileStore);
const templatePreview = ref(null);

// Validation states
const docNoError = ref("");
const jsonNameError = ref("");
const sourceSystemError = ref("");

const validateDocNo = () => {
  if (senderDocNo.value.length > 12) {
    docNoError.value = "Document Number cannot exceed 12 characters";
    senderDocNo.value = senderDocNo.value.slice(0, 12);
    return false;
  }
  if (!senderDocNo.value) {
    docNoError.value = "Document Number is required";
    return false;
  }
  docNoError.value = "";
  return true;
};

const validateJsonName = () => {
  if (!jsonName.value) {
    jsonNameError.value = "JSON Name is required";
    return false;
  }
  jsonNameError.value = "";
  return true;
};

const validateSourceSystem = () => {
  if (!sourceSystem.value) {
    sourceSystemError.value = "Source System is required";
    return false;
  }
  sourceSystemError.value = "";
  return true;
};

const updateTemplatePreview = () => {
  if (validateDocNo() && validateJsonName() && validateSourceSystem()) {
    templatePreview.value = templateStore.setTemplateDisburse({
      senderDocNo: senderDocNo.value,
      jsonName: jsonName.value,
      sourceSystem: sourceSystem.value,
    });
  } else {
    templatePreview.value = null;
  }
};

const handleDocNoInput = (event) => {
  if (event.target.value.length >= 12 && event.data) {
    event.preventDefault();
  }
};

watch(
  [senderDocNo, jsonName, sourceSystem],
  () => {
    updateTemplatePreview();
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <Layout>
    <div class="card">
      <div class="card-header">
        <h5 class="text-black">{{ title }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent>
          <div class="mb-3">
            <label class="form-label" for="senderDocNo">Document Number</label>
            <input
              id="senderDocNo"
              v-model="senderDocNo"
              :class="{ 'is-invalid': docNoError }"
              class="form-control"
              maxlength="12"
              placeholder="Format: DDMMYYR###### (12 characters)"
              type="text"
              @blur="validateDocNo"
              @input="handleDocNoInput"
            />
            <div v-if="docNoError" class="invalid-feedback">
              {{ docNoError }}
            </div>
            <div class="small text-muted mt-1">
              Fomat: (12 characters total)
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="jsonName">JSON Name</label>
            <input
              id="jsonName"
              v-model="jsonName"
              :class="{ 'is-invalid': jsonNameError }"
              class="form-control"
              placeholder="Enter JSON Name"
              type="text"
              @blur="validateJsonName"
            />
            <div v-if="jsonNameError" class="invalid-feedback">
              {{ jsonNameError }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="sourceSystem">Source System</label>
            <input
              id="sourceSystem"
              v-model="sourceSystem"
              :class="{ 'is-invalid': sourceSystemError }"
              class="form-control"
              placeholder="Enter Source System"
              type="text"
              @blur="validateSourceSystem"
            />
            <div v-if="sourceSystemError" class="invalid-feedback">
              {{ sourceSystemError }}
            </div>
          </div>
        </form>

        <Properties>
          <PropertiesItem
            :input-properties="senderDocNo"
            input-label="Document Number"
            input-properties-error="Not specified"
          />
          <PropertiesItem
            :input-properties="jsonName"
            input-label="JSON Name"
            input-properties-error="Not specified"
          />
          <PropertiesItem
            :input-properties="sourceSystem"
            input-label="Source System"
            input-properties-error="Not specified"
          />
        </Properties>

        <div v-if="templatePreview" class="mt-4">
          <div class="card">
            <div class="card-header">Template JSON Structure</div>
            <div class="card-body p-0">
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
.card-header-tabs {
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

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.small {
  font-size: 0.875em;
}

.text-muted {
  color: #6c757d !important;
}
</style>
