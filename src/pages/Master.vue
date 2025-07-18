<script setup>
import { storeToRefs } from "pinia";
import { useFileStore } from "../store/fileStore.js";
import Layout from "../components/Layout.vue";
import { ref } from "vue";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";
import { useTemplateStore } from "../store/templateStore.js";
import { constant } from "../utils/Constant.js";

const fileStore = useFileStore();
const templateStore = useTemplateStore();
const { title } = defineProps({
  title: String,
});

const { senderDocNo, jsonName, sourceSystem } = storeToRefs(templateStore);

// Extract state and actions from the store
const { fileType, isProses, fileData, errorMessage, fileName } =
  storeToRefs(fileStore);

const { processFile, downloadJson } = fileStore;

const isFileNotReady = ref(true);

// Handle file input changes
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (fileType.value === "JSON") {
    fileStore.jsonFileInput = file;
  } else {
    fileStore.excelFileInput = file;
  }
  isFileNotReady.value = !isFileNotReady.value;
};

const previewJsonTemplate = ref(null);
const isPreviewJsonTemplate = ref(false);
const copyStatus = ref("");

const handlePreviewJsonTemplate = () => {
  previewJsonTemplate.value = templateStore.getDisburseRequest();
  isPreviewJsonTemplate.value = !isPreviewJsonTemplate.value;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(previewJsonTemplate.value);
    copyStatus.value = "Copied!";
    setTimeout(() => {
      copyStatus.value = "";
    }, 2000);
  } catch (err) {
    copyStatus.value = "Failed to copy";
    setTimeout(() => {
      copyStatus.value = "";
    }, 2000);
  }
};

const setIntegerValue = (data) => {
  console.log("set integer value called!");
  return data.map((item) => {
    if (item.LTV) {
      item.LTV = +item.LTV;
    }
    if (item.DSR) {
      item.DSR = +item.DSR;
    }

    if (item.FUND_REASON_TYPE) {
      item.FUND_REASON_TYPE = +item.FUND_REASON_TYPE;
    }

    if (item.FUND_OBJT_PRICE) {
      item.FUND_OBJT_PRICE = +item.FUND_OBJT_PRICE;
    }

    if (item.FUND_NET_DP) {
      item.FUND_NET_DP = +item.FUND_NET_DP;
    }

    if (item.FUND_ADMF_PRIN) {
      item.FUND_ADMF_PRIN = +item.FUND_ADMF_PRIN;
    }

    if (item.FUND_ADMF_TOP) {
      item.FUND_ADMF_TOP = +item.FUND_ADMF_TOP;
    }

    if (item.FUND_OBJT_CODE) {
      item.FUND_OBJT_CODE = +item.FUND_OBJT_CODE;
    }

    if (item.AREC_CONT_VER) {
      item.AREC_CONT_VER = +item.AREC_CONT_VER;
    }

    if (item.AREC_INST_NO) {
      item.AREC_INST_NO = +item.AREC_INST_NO;
    }

    if (item.AREC_INST_PRIN) {
      item.AREC_INST_PRIN = +item.AREC_INST_PRIN;
    }

    if (item.AREC_INST_INTR) {
      item.AREC_INST_INTR = +item.AREC_INST_INTR;
    }

    if (item.AREC_PNLT_CALC) {
      item.AREC_PNLT_CALC = +item.AREC_PNLT_CALC;
    }
    return item;
  });
};

const fileProsesUpload = async () => {
  processFile().then(() => {
    if (fileData) {
      // const formatedInt = setIntegerValue(fileData.value.data);
      // console.log({ formatedInt });
      // templateStore.setData(formatedInt, constant.disburse);
      templateStore.setData(fileData.value.data, constant.disburse);
    }
  });
  isFileNotReady.value = !isFileNotReady.value;
};

const downloadJsonHandler = () => {
  downloadJson(JSON.parse(templateStore.getDisburseRequest()));
};
</script>

<template>
  <Layout>
    <div class="card">
      <div class="card-header">
        <h5>{{ title }}</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Select File Type</label>
          <select v-model="fileType" class="form-select">
            <option value="EXCEL">Excel</option>
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

        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>

        <button
          :disabled="isFileNotReady"
          class="btn btn-primary mt-3"
          @click="fileProsesUpload"
        >
          <span v-if="isProses" class="d-flex align-items-center gap-2">
            <span class="spinner-border spinner-border-sm" role="status"></span>
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

        <div v-if="fileData" class="card mt-4">
          <div class="card-header">
            Result Upload Data ({{ fileData.type.toUpperCase() }})
          </div>
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
              :disabled="isProses"
              class="btn btn-success"
              @click="downloadJsonHandler"
            >
              Download JSON Template
            </button>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button
              :disabled="isProses"
              class="btn btn-primary"
              @click="handlePreviewJsonTemplate"
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

                <div class="d-flex gap-2 align-items-center">
                  <span v-show="copyStatus" class="text-success">{{
                    copyStatus
                  }}</span>
                  <button class="btn btn-secondary" @click="copyToClipboard">
                    <span class="fw-bold"
                      ><svg
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
                      Copy</span
                    >
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="isPreviewJsonTemplate = false"
                  >
                    <span class="fw-bold"
                      ><svg
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
  white-space: pre-wrap;
  overflow: auto;
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
