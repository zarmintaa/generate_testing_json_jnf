<script setup>
import { ref, computed } from "vue";
import * as ExcelJS from "exceljs";

// Reactive state
const fileType = ref("JSON");
const docNo = ref("");
const isProses = ref(false);
const fileData = ref(null);
const errorMessage = ref(null);
const fileName = ref("");
const jsonFileInput = ref(null);
const excelFileInput = ref(null);

// Computed property untuk type
const type = computed(() => fileType.value);

const transformObjectToString = (data) => {
  if (!data.value?.data) return { data: [] };

  const msgContent = data.value.data.map((result) =>
    JSON.stringify({ data: { ...result } }),
  );

  return {
    data: [
      {
        fastSeqNo: "1",
        msgContent,
        jsonName: "MASTER",
        sourceSystem: "AMAN",
        senderDocNo: docNo.value || "121213",
      },
    ],
  };
};

const onProses = async () => {
  isProses.value = true;
  errorMessage.value = null;
  fileData.value = null;

  try {
    const file =
      type.value === "EXCEL" ? excelFileInput.value : jsonFileInput.value;
    if (!file) {
      throw new Error(`Please select a ${type.value} file first`);
    }

    fileName.value = file.name;
    const data =
      type.value === "EXCEL"
        ? await readExcelFile(file)
        : await readJsonFile(file);

    processFileData(data);
  } catch (error) {
    console.error("Error processing file:", error);
    errorMessage.value = error.message || "Failed to process file";
  } finally {
    isProses.value = false;
  }
};

const processFileData = (data) => {
  const isArray = Array.isArray(data);
  const dataArray = isArray ? data : [data];

  const headers = new Set();
  dataArray.forEach((item) => {
    Object.keys(item).forEach((key) => headers.add(key));
  });

  fileData.value = {
    type: type.value.toLowerCase(),
    data: dataArray,
    headers: Array.from(headers),
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
        const headers = [];

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value;
        });

        // Process data rows
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

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch (error) {
        reject(new Error("Invalid JSON file format"));
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const downloadJson = () => {
  if (!fileData.value) return;

  const dataJsonFormat = transformObjectToString(fileData);
  console.log("Data to download:", dataJsonFormat);

  const blob = new Blob([JSON.stringify(dataJsonFormat, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_${new Date().toISOString().slice(0, 10)}_${docNo.value || "data"}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadExcel = async () => {
  if (!fileData.value) return;

  try {
    isProses.value = true;
    errorMessage.value = null;

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Add headers with style
    const headerRow = worksheet.addRow(fileData.value.headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0070C0" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    fileData.value.data.forEach((row) => {
      const rowData = fileData.value.headers.map((header) => {
        const value = row[header];
        // Convert objects/arrays to string for better Excel display
        return typeof value === "object" ? JSON.stringify(value) : value;
      });
      worksheet.addRow(rowData);
    });

    // Style data rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header row
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Auto fit columns with limits
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export_${new Date().toISOString().slice(0, 10)}_${docNo.value || "data"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating Excel file:", error);
    errorMessage.value = "Failed to generate Excel file: " + error.message;
  } finally {
    isProses.value = false;
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
            @change="
              fileType === 'JSON'
                ? (jsonFileInput = $event.target.files[0])
                : (excelFileInput = $event.target.files[0])
            "
          />
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>

        <button
          @click="onProses"
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
            v-if="fileData.type === 'json'"
            @click="downloadJson"
            class="btn btn-success"
            :disabled="isProses"
          >
            Download JSON
          </button>
          <button
            v-else
            @click="downloadExcel"
            class="btn btn-success"
            :disabled="isProses"
          >
            <span v-if="isProses" class="d-flex align-items-center gap-2">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              Generating...
            </span>
            <span v-else>Download Excel</span>
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
