<script setup>
import { storeToRefs } from "pinia";
import { useFileStore } from "../store/fileStore.js";
import Layout from "./Layout.vue";
import { ref, watch } from "vue";

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

const { processFile, downloadJson, downloadExcel } = fileStore;

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
            <label for="docNo" class="form-label">Document Number</label>
            <input
              v-model="docNo"
              class="form-control"
              :class="{ 'is-invalid': docNoError }"
              type="text"
              id="docNo"
              placeholder="Contoh: 020125R000582"
              maxlength="12"
              @input="handleDocNoInput"
            />
            <div v-if="docNoError" class="invalid-feedback">
              {{ docNoError }}
            </div>
            <div class="small text-muted mt-1">Format: (12 karakter total)</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Select File Type</label>
            <select v-model="fileType" class="form-select">
              <option value="JSON">JSON</option>
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

          <div class="card mt-4">
            <div class="card-header">
              <div>Setting Properties</div>
            </div>
            <div class="card-body">
              <div class="mb-2">
                <strong>File processed:</strong>
                {{ fileName || "File didn't process yet" }}
              </div>

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

          <div v-if="fileData" class="mt-4">
            <h5>Result Upload Data ({{ fileData.type.toUpperCase() }})</h5>
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

          <div v-if="fileData && fileData.type === 'json'" class="mt-3">
            <h5>Raw JSON Data</h5>
            <pre class="bg-light p-3 rounded">{{
              JSON.stringify(fileData.data, null, 2)
            }}</pre>
          </div>

          <div v-if="fileData" class="mt-4 d-flex gap-2">
            <button
              @click="downloadJson"
              class="btn btn-success"
              :disabled="isProses"
            >
              Download JSON Template
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

pre {
  max-height: 300px;
  overflow-y: auto;
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
