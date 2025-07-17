<script setup lang="ts">
import Layout from "../components/Layout.vue";
import { computed } from "vue";
import { Utils } from "../utils/Utils";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";

// Import composables
import { useFormValidation } from "../composables/useFormValidation";
import { useFileUpload } from "../composables/useFileUpload";
import { useCustomTemplate } from "../composables/useCustomTemplate";

const { title } = defineProps({
  title: String,
});

// Use composables
const {
  senderDocNo,
  jsonName,
  sourceSystem,
  docNoError,
  jsonNameError,
  sourceSystemError,
  validateAll,
  handleDocNoInput,
  validateDocNo,
  validateJsonName,
  validateSourceSystem,
} = useFormValidation();

const {
  fileInput,
  fileName,
  fileData,
  errorMessage,
  isFileNotReady,
  isProses,
  fileType,
  handleFileChange,
  processFile,
} = useFileUpload();

const {
  generateInvoiceTemplate,
  generatePurchaseOrderTemplate,
  generateCustomTemplate,
  isPreviewJsonTemplate,
  copyStatus,
  downloadJson,
  copyToClipboard,
  handlePreviewJsonTemplate,
} = useCustomTemplate();

// Initialize default values for Invoice
senderDocNo.value = Utils.generateSenderDocNo();
jsonName.value = "INVOICE";
sourceSystem.value = "FINANCE";

// Template types
const templateTypes = [
  { value: "INVOICE", label: "Invoice Template" },
  { value: "PURCHASE_ORDER", label: "Purchase Order Template" },
  { value: "CUSTOM", label: "Custom Template" },
];

// Template preview untuk struktur JSON saja (tanpa data file)
const templatePreview = computed(() => {
  if (validateAll()) {
    const config = {
      senderDocNo: senderDocNo.value,
      jsonName: jsonName.value,
      sourceSystem: sourceSystem.value,
    };

    // Choose template based on jsonName
    switch (jsonName.value) {
      case "INVOICE":
        return generateInvoiceTemplate(config);
      case "PURCHASE_ORDER":
        return generatePurchaseOrderTemplate(config);
      case "CUSTOM":
        return generateCustomTemplate(config);
      default:
        return generateInvoiceTemplate(config); // fallback
    }
  }
  return null;
});

// Template dengan data hasil scan file untuk download
const templateWithFileData = computed(() => {
  if (validateAll()) {
    const config = {
      senderDocNo: senderDocNo.value,
      jsonName: jsonName.value,
      sourceSystem: sourceSystem.value,
    };

    // Choose template based on jsonName
    switch (jsonName.value) {
      case "INVOICE":
        return generateInvoiceTemplate(config, fileData);
      case "PURCHASE_ORDER":
        return generatePurchaseOrderTemplate(config, fileData);
      case "CUSTOM":
        return generateCustomTemplate(config, fileData);
      default:
        return generateInvoiceTemplate(config, fileData); // fallback
    }
  }
  return null;
});

const previewJsonTemplate = computed(() => {
  return JSON.stringify(templateWithFileData.value, null, 2);
});

// File processing
const fileProsesUpload = async () => {
  await processFile();
};

// Download handler
const downloadJsonHandler = () => {
  try {
    downloadJson(templateWithFileData.value, fileType.value);
  } catch (error) {
    errorMessage.value = error.message;
  }
};

// Copy handler
const copyToClipboardHandler = async () => {
  await copyToClipboard(templateWithFileData.value);
};

// Handle template type change
const handleTemplateTypeChange = () => {
  // You can add specific logic here when template type changes
  validateJsonName();
};
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
              Format: (12 characters total)
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="jsonName">Template Type</label>
            <select
              id="jsonName"
              v-model="jsonName"
              :class="{ 'is-invalid': jsonNameError }"
              class="form-select"
              @change="handleTemplateTypeChange"
            >
              <option value="">Select Template Type</option>
              <option
                v-for="template in templateTypes"
                :key="template.value"
                :value="template.value"
              >
                {{ template.label }}
              </option>
            </select>
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
            input-label="Template Type"
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
            <div class="card-header">
              Template JSON Structure - {{ jsonName }}
            </div>
            <div class="card-body p-0">
              <pre class="bg-light p-3 rounded">{{
                JSON.stringify(templatePreview, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section>
      <div class="card">
        <div class="card-header">
          <h5>File Upload - {{ title }}</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Select File Type</label>
            <select v-model="fileType" class="form-select">
              <option value="EXCEL">Excel</option>
              <option value="JSON">JSON</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Upload {{ fileType }} File</label>
            <input
              :accept="fileType === 'JSON' ? '.json' : '.xlsx, .xls, .xlsm'"
              class="form-control"
              type="file"
              @change="handleFileChange"
            />
          </div>

          <!-- Template-specific file format hints -->
          <div v-if="jsonName" class="alert alert-info">
            <strong>{{ jsonName }} Template Expected Columns:</strong>
            <ul class="mb-0 mt-2">
              <li v-if="jsonName === 'INVOICE'">
                itemCode, description, quantity, unitPrice
              </li>
              <li v-if="jsonName === 'PURCHASE_ORDER'">
                productCode, productName, quantity, unitPrice, deliveryDate
              </li>
              <li v-if="jsonName === 'CUSTOM'">
                Any columns (will be processed as generic data)
              </li>
            </ul>
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>

          <button
            :disabled="isFileNotReady || isProses"
            class="btn btn-primary mt-3"
            @click="fileProsesUpload"
          >
            <span v-if="isProses" class="d-flex align-items-center gap-2">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              Processing...
            </span>
            <span v-else>Process File</span>
          </button>

          <Properties>
            <PropertiesItem
              :input-properties="fileName"
              input-label="File Name"
              input-properties-error="File didn't process yet"
            />
            <PropertiesItem
              :input-properties="senderDocNo"
              input-label="Document Number"
              input-properties-error="Not specified"
            />
            <PropertiesItem
              :input-properties="jsonName"
              input-label="Template Type"
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

          <div v-if="fileData" class="d-flex gap-4">
            <div class="mt-4 d-flex gap-2">
              <button
                :disabled="isProses"
                class="btn btn-success"
                @click="downloadJsonHandler"
              >
                Download {{ jsonName }} Template
              </button>
            </div>

            <div class="mt-4 d-flex gap-2">
              <button
                :disabled="isProses"
                class="btn btn-primary"
                @click="handlePreviewJsonTemplate"
              >
                Preview {{ jsonName }} Template
              </button>
            </div>
          </div>

          <!-- Modal for JSON Preview -->
          <div
            v-if="isPreviewJsonTemplate"
            class="modal-overlay"
            @click="isPreviewJsonTemplate = false"
          >
            <div class="modal-dialog" @click.stop>
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Preview {{ jsonName }} Template</h5>

                  <div class="d-flex gap-2 align-items-center">
                    <span v-show="copyStatus" class="text-success">{{
                      copyStatus
                    }}</span>
                    <button
                      class="btn btn-secondary"
                      @click="copyToClipboardHandler"
                    >
                      <span class="fw-bold">
                        <svg
                          aria-hidden="true"
                          class="w-6 h-6 text-gray-800 dark:text-white"
                          fill="currentColor"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clip-rule="evenodd"
                            d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                            fill-rule="evenodd"
                          />
                          <path
                            clip-rule="evenodd"
                            d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                            fill-rule="evenodd"
                          />
                        </svg>
                        Copy
                      </span>
                    </button>
                    <button
                      class="btn btn-primary"
                      @click="isPreviewJsonTemplate = false"
                    >
                      <span class="fw-bold">
                        <svg
                          aria-hidden="true"
                          class="w-6 h-6 text-gray-800 dark:text-white"
                          fill="none"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 18 17.94 6M18 18 6.06 6"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
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
    </section>
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
  width: 95%;
  height: 95%;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.modal-content {
  position: relative;
  background-color: #fff;
  border-radius: 0.3rem;
  outline: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
}

.modal-body {
  padding: 1rem;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body pre {
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}
</style>
