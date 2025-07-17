<script setup lang="ts">
import Layout from "../components/Layout.vue";
import { computed, ref } from "vue";
import { Utils } from "../utils/Utils";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";
import * as ExcelJS from "exceljs";

const { title } = defineProps({
  title: String,
});

const senderDocNo = ref(Utils.generateSenderDocNo());
const jsonName = ref("SCHED");
const sourceSystem = ref("AMAN");
const fileType = ref("EXCEL");

const docNoError = ref("");
const jsonNameError = ref("");
const sourceSystemError = ref("");

const fileData = ref(null);
const errorMessage = ref(null);
const isFileNotReady = ref(true);

const fileInput = ref(null);
const fileName = ref(null);

const template = ref(null);

const isPreviewJsonTemplate = ref(false);
const isProses = ref(false);

const getSenderDocNo = () => {
  return docNoError.value;
};

const getJsonName = computed(() => {
  return jsonName.value;
});

const getSourceSystem = computed(() => {
  return sourceSystem.value;
});

// Template preview untuk struktur JSON saja (tanpa data file)
const templatePreview = computed(() => {
  if (validateDocNo() && validateJsonName() && validateSourceSystem()) {
    return (template.value = {
      data: [
        {
          fastSeqNo: "1",
          msgContent: [],
          jsonName: jsonName.value,
          sourceSystem: sourceSystem.value,
          senderDocNo: senderDocNo.value,
        },
      ],
    });
  } else {
    template.value = null;
  }
});

// Template dengan data hasil scan file untuk download
const templateWithFileData = computed(() => {
  let data = [];
  if (validateDocNo() && validateJsonName() && validateSourceSystem()) {
    if (fileData.value) {
      data = fileData.value.data.map((record) =>
        JSON.stringify({ data: { ...record } }),
      );
    }
    return {
      data: [
        {
          fastSeqNo: "1",
          msgContent: data,
          jsonName: jsonName.value,
          sourceSystem: sourceSystem.value,
          senderDocNo: senderDocNo.value,
        },
      ],
    };
  } else {
    return null;
  }
});

const previewJsonTemplate = computed(() => {
  return JSON.stringify(templateWithFileData.value, null, 2);
});

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

const handleDocNoInput = () => {
  if (senderDocNo.value.length > 12) {
    senderDocNo.value = senderDocNo.value.slice(0, 12);
  }
  validateDocNo();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileInput.value = file;
    fileName.value = file.name;
    isFileNotReady.value = false;
  } else {
    fileInput.value = null;
    fileName.value = null;
    isFileNotReady.value = true;
  }
};

const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet(1); // Get first worksheet
        const jsonData = [];
        const headers = [];

        if (!worksheet) {
          throw new Error("No worksheet found in Excel file");
        }

        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          headers.push(cell.value?.toString() || `Column ${colNumber}`);
        });

        // Get data from rows (starting from row 2)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            // Skip header row
            const rowData = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber - 1];
              rowData[header] = cell.value;
            });
            jsonData.push(rowData);
          }
        });

        resolve({
          headers,
          data: jsonData,
          type: "excel",
        });
      } catch (error) {
        reject(new Error(`Error reading Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsArrayBuffer(file);
  });
};

const readJsonFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // If it's an array of objects, extract headers
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          resolve({
            headers,
            data: jsonData,
            type: "json",
          });
        } else {
          resolve({
            headers: [],
            data: jsonData,
            type: "json",
          });
        }
      } catch (error) {
        reject(new Error("Invalid JSON file format"));
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const processFile = async () => {
  isProses.value = true;
  errorMessage.value = null;
  fileData.value = null;

  try {
    if (!fileInput.value) {
      throw new Error(`Please select a ${fileType.value} file first`);
    }

    let data;
    if (fileType.value === "EXCEL") {
      data = await readExcelFile(fileInput.value);
    } else if (fileType.value === "JSON") {
      data = await readJsonFile(fileInput.value);
    } else {
      throw new Error("Unsupported file type");
    }

    fileData.value = data;
  } catch (error) {
    console.error("Error processing file:", error);
    errorMessage.value = error.message || "Failed to process file";
  } finally {
    isProses.value = false;
  }
};

const fileProsesUpload = async () => {
  await processFile();
};

const downloadJson = () => {
  if (!templateWithFileData.value) {
    errorMessage.value = "No template data available for download";
    return;
  }

  const blob = new Blob([JSON.stringify(templateWithFileData.value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_${new Date().toISOString()}_${fileType.value}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadJsonHandler = () => {
  downloadJson();
};

const handlePreviewJsonTemplate = () => {
  isPreviewJsonTemplate.value = !isPreviewJsonTemplate.value;
};

const copyStatus = ref("");
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(templateWithFileData.value, null, 2),
    );
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
              <!--              <option value="JSON">JSON</option>-->
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

          <!-- Modal for JSON Preview -->
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
