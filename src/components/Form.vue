<script setup>
import { storeToRefs } from "pinia";
import { useFileStore } from "../store/fileStore.js";

const fileStore = useFileStore();

// Extract state and actions from the store
const { fileType, docNo, isProses, fileData, errorMessage, fileName, type } =
  storeToRefs(fileStore);

const { processFile, downloadJson, downloadExcel } = fileStore;

// Handle file input changes
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (fileType.value === "JSON") {
    fileStore.jsonFileInput = file;
  } else {
    fileStore.excelFileInput = file;
  }
};
</script>

<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-body">
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
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Processing...
          </span>
          <span v-else>Process</span>
        </button>

        <div v-if="fileName" class="mt-3">
          <strong>File processed:</strong> {{ fileName }}
        </div>

        <div class="mt-3">
          <strong>Document Number:</strong> {{ docNo || "Not specified" }}
        </div>

        <div v-if="fileData" class="mt-4">
          <h5>File Data ({{ fileData.type.toUpperCase() }})</h5>
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th v-for="(header, index) in fileData.headers" :key="index">
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
            Download JSON
          </button>
          <!--          <button-->
          <!--            v-else-->
          <!--            @click="downloadExcel"-->
          <!--            class="btn btn-success"-->
          <!--            :disabled="isProses"-->
          <!--          >-->
          <!--            <span v-if="isProses" class="d-flex align-items-center gap-2">-->
          <!--              <span-->
          <!--                class="spinner-border spinner-border-sm"-->
          <!--                role="status"-->
          <!--              ></span>-->
          <!--              Generating...-->
          <!--            </span>-->
          <!--            <span v-else>Download Excel</span>-->
          <!--          </button>-->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Your existing styles remain the same */
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
</style>
