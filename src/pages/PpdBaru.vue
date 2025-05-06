<script setup>
import { storeToRefs } from "pinia";
import { useFileStore } from "../store/fileStore.js";
import Layout from "../components/Layout.vue";
import { ref, watch } from "vue";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";

const fileStore = useFileStore();
const { title } = defineProps({
  title: String,
});

// Extract state and actions from the store
const {
  fileType,
  docNo,
  isProses,
  fileData,
  errorMessage,
  fileName,
  type,
  template,
  jsonName,
  sourceSystem,
} = storeToRefs(fileStore);

const { processFile, downloadJson, previewJson, downloadExcel } = fileStore;

// State untuk validasi
const docNoError = ref("");

// Watch perubahan pada docNo
watch(docNo, (newValue) => {
  if (newValue.length > 12) {
    docNoError.value = "Document Number tidak boleh lebih dari 12 karakter";
    // Potong ke 12 karakter
    docNo.value = newValue.slice(0, 12);
  } else {
    docNoError.value = "";
  }
});

// Handle file input changes
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (fileType.value === "JSON") {
    fileStore.jsonFileInput = file;
  } else {
    fileStore.excelFileInput = file;
  }
};

// Handle input untuk mencegah lebih dari 12 karakter
const handleDocNoInput = (event) => {
  if (event.target.value.length >= 12 && event.data) {
    event.preventDefault();
  }
};

const previewJsonTemplate = ref(null);
const isPreviewJsonTemplate = ref(false);

const handlePreviewJsonTemplate = () => {
  previewJsonTemplate.value = previewJson();
  isPreviewJsonTemplate.value = !isPreviewJsonTemplate.value;
};
</script>

<template>
  <Layout>
    <div class="container-fluid">
      <div class="card">
        <div class="card-header card-header-tabs">
          <h5 class="text-black">{{ title }}</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Select File Type</label>
            <select v-model="fileType" class="form-select">
              <!-- <option value="JSON">JSON</option> -->
              <option value="EXCEL">Excel</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Upload {{ fileType }} File</label>
            <input
              class="form-control"
              type="file"
              :accept="fileType === 'JSON' ? '.json' : '.xlsx, .xls, .xlsm'"
              @change="handleFileChange"
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>

          <button
            @click="processFile"
            :disabled="isProses"
            class="btn btn-primary mt-3"
          >
            <span v-if="isProses" class="d-flex align-items-center gap-2">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              Processing...
            </span>
            <span v-else>Process</span>
          </button>

          <Properties>
            <PropertiesItem
              :input-properties="fileName"
              input-label="File Name"
              input-properties-error="File didn't process yet"
            />
            <PropertiesItem
              :input-properties="docNo"
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

          <div v-if="fileData" class="card mt-4">
            <div class="card-header">
              Result Upload Data ({{ fileData.type.toUpperCase() }})
            </div>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th
                      v-for="(header, index) in fileData.headers"
                      :key="index"
                    >
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in fileData.data" :key="rowIndex">
                    <td v-for="(value, key) in row" :key="key">
                      {{ value === null ? "null" : value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="fileData && fileData.type === 'json'" class="card mt-3">
            <div class="card">
              <div class="card-header">Raw JSON Data</div>
              <pre class="bg-light p-3 rounded">{{
                JSON.stringify(fileData.data, null, 2)
              }}</pre>
            </div>
          </div>

          <div v-if="fileData" class="d-flex gap-4">
            <div class="mt-4 d-flex gap-2">
              <button
                @click="downloadJson"
                class="btn btn-success"
                :disabled="isProses"
              >
                Download JSON Template
              </button>
            </div>

            <div class="mt-4 d-flex gap-2">
              <button
                @click="handlePreviewJsonTemplate"
                class="btn btn-primary"
                :disabled="isProses"
              >
                Preview JSON Template
              </button>
            </div>
          </div>

          <div
            v-if="isPreviewJsonTemplate"
            class="modal-overlay"
            @click="isPreviewJsonTemplate = false"
          >
            <div class="modal-dialog" @click.stop>
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Preview JSON Data</h5>
                  <button
                    class="btn btn-primary"
                    @click="isPreviewJsonTemplate = false"
                  >
                    <span class="fw-bold">Close</span>
                  </button>
                </div>
                <div class="modal-body">
                  <pre class="bg-light p-3 rounded">{{
                    previewJsonTemplate
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  width: 90%;
  //max-width: 1500px;
  margin: 1.75rem auto;
}

.modal-content {
  position: relative;
  background-color: #fff;
  border-radius: 0.3rem;
  outline: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.btn-close {
  padding: 0.5rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  cursor: pointer;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

pre {
  max-height: 600px;
  overflow: auto;
  width: 100%;
  white-space: pre-wrap;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.15em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
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
</style>
