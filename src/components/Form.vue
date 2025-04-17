<script setup>
import { reactive, ref, watchEffect } from "vue";
import * as ExcelJS from "exceljs";

const inputRef = reactive({
  fileType: "JSON",
});

const templateObject = {
  data: [
    {
      fastSeqNo: "1",
      msgContent: [],
      jsonName: "MASTER",
      sourceSystem: "AMAN",
      senderDocNo: "121213",
    },
  ],
};

const transformObjectToString = (data) => {
  const tempData = [];
  console.log(data.value.data);
  data.value.data.map((result) => {
    tempData.push(
      JSON.stringify({
        data: { ...result },
      }),
    );
  });

  return {
    data: [
      {
        fastSeqNo: "1",
        msgContent: [...tempData],
        jsonName: "MASTER",
        sourceSystem: "AMAN",
        senderDocNo: "121213",
      },
    ],
  };
};

const type = ref("JSON");
const docNo = ref("");
const isProses = ref(false);
const fileData = ref(null); // To store parsed file data
const errorMessage = ref(null); // To store any error messages
const fileName = ref(""); // To store the uploaded file name

const onProses = async () => {
  isProses.value = true;
  errorMessage.value = null;
  fileData.value = null;

  try {
    if (type.value === "EXCEL") {
      const fileInput = document.getElementById("file-excel");
      await handleExcelUpload(fileInput);
    } else {
      const fileInput = document.getElementById("file-json");
      await handleJsonUpload(fileInput);
    }
  } catch (error) {
    console.error("Error processing file:", error);
    errorMessage.value = error.message || "Failed to process file";
  } finally {
    isProses.value = false;
  }

  /* console.log({
    data: fileData?.value?.data,
    headers: fileData?.value?.headers,
    type: fileData?.value?.type,
  });*/
};

const handleExcelUpload = async (fileInput) => {
  if (fileInput.files.length === 0) {
    throw new Error("Please select an Excel file first");
  }

  const file = fileInput.files[0];
  fileName.value = file.name;

  const data = await readExcelFile(file);

  fileData.value = {
    type: "excel",
    data: data,
    headers: data.length > 0 ? Object.keys(data[0]) : [],
  };
};

const handleJsonUpload = async (fileInput) => {
  if (fileInput.files.length === 0) {
    throw new Error("Please select a JSON file first");
  }

  const file = fileInput.files[0];
  fileName.value = file.name;

  const data = await readJsonFile(file);

  const allKeys = new Set();
  const jsonArray = Array.isArray(data) ? data : [data];

  jsonArray.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  fileData.value = {
    type: "json",
    data: jsonArray,
    headers: Array.from(allKeys),
  };
};

const readExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.worksheets[0];
        const data = [];

        // Get headers from first row
        const headers = [];
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value;
        });

        // Process remaining rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          data.push(rowData);
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const jsonData = JSON.parse(content);
        resolve(jsonData);
      } catch (error) {
        reject(new Error("Invalid JSON file format"));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const downloadJson = () => {
  const dataJsonFormat = transformObjectToString(fileData);
  console.log(dataJsonFormat);
};

watchEffect(() => {
  type.value = inputRef.fileType;
});
</script>

<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-body">
        <div>
          <div class="mb-3">
            <label for="docNo" class="form-label">Document Number</label>
            <input
              v-model="docNo"
              class="form-control"
              type="text"
              id="docNo"
              name="docNo"
              placeholder="Enter Document Number"
            />
          </div>
        </div>

        <div class="mb-3">
          <label for="formFile" class="form-label">Pilih file upload</label>

          <select
            v-model="inputRef.fileType"
            class="form-select"
            aria-label="File type"
          >
            <option selected value="JSON">JSON</option>
            <option value="EXCEL">Excel</option>
          </select>
        </div>

        <form @submit.prevent>
          <div v-if="type === 'JSON'">
            <label for="formFile" class="form-label">Upload Json</label>
            <input
              class="form-control"
              type="file"
              id="file-json"
              accept=".json"
              placeholder="Upload JSON"
            />
          </div>
          <div v-else>
            <label for="formFile" class="form-label">Upload Excel</label>
            <input
              class="form-control"
              type="file"
              id="file-excel"
              accept=".xlsx, .xls, .xlsm"
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger mt-3">
            {{ errorMessage }}
          </div>

          <button
            @click="onProses"
            :disabled="isProses"
            class="btn btn-primary mt-3"
            id="download"
          >
            <div v-if="isProses" class="px-2 d-flex align-items-center gap-2">
              <div
                class="spinner-border spinner-border-sm text-white"
                role="status"
              ></div>
              Processing...
            </div>
            <div v-if="!isProses" id="text-download">Proses</div>
          </button>
        </form>

        <!-- Display uploaded file info -->
        <div v-if="fileName" class="mt-3">
          <strong>File processed:</strong> {{ fileName }}
        </div>

        <!-- Display Document Number -->
        <div class="mt-3"><strong>Document Number: </strong> {{ docNo }}</div>

        <!-- Display data in table format -->
        <div v-if="fileData" class="mt-4">
          <h5>File Data ({{ fileData.type.toUpperCase() }}):</h5>
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

        <!-- Display raw JSON data for debugging -->
        <div v-if="fileData && fileData.type === 'json'" class="mt-3">
          <h5>Raw JSON Data:</h5>
          <pre class="bg-light p-3 rounded">{{
            JSON.stringify(fileData.data, null, 2)
          }}</pre>
        </div>

        <!-- JSON Download Button -->
        <div v-if="fileData" class="mt-4">
          <button @click="downloadJson" class="btn btn-success">
            Download JSON
          </button>
        </div>
      </div>
    </div>
  </div>
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
}
</style>
