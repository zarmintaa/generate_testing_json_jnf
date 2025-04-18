// stores/fileStore.js
import { defineStore } from "pinia";
import * as ExcelJS from "exceljs";

// Fungsi untuk generate nomor dokumen dengan format DDMMYYR######
function generateDocNo() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const randomNum = String(Math.floor(Math.random() * 999999) + 1).padStart(
    6,
    "0",
  );
  return `${day}${month}${year}R${randomNum}`;
}

export const useFileStore = defineStore("file", {
  state: () => ({
    fileType: "JSON",
    docNo: generateDocNo(),
    isProses: false,
    fileData: null,
    errorMessage: null,
    fileName: "",
    jsonFileInput: null,
    excelFileInput: null,
    jsonName: "MASTER",
    sourceSystem: "AMAN",
    template: {
      data: [
        {
          fastSeqNo: "1",
          msgContent: [],
          jsonName: "MASTER",
          sourceSystem: "AMAN",
          senderDocNo: generateDocNo(),
        },
      ],
    },
    uploadedTemplate: null,
  }),

  getters: {
    type: (state) => state.fileType,
    currentTemplate: (state) => state.uploadedTemplate || state.template,
    formattedData: (state) => {
      if (!state.fileData?.data) return { data: [] };

      const currentTemplate = JSON.parse(JSON.stringify(state.currentTemplate));
      currentTemplate.data[0].msgContent = state.fileData.data;
      return currentTemplate;
    },
  },

  actions: {
    async setNewTemplate(file) {
      try {
        const content = await this.readJsonFile(file);
        this.uploadedTemplate = content;
        return content;
      } catch (error) {
        console.error("Error loading template:", error);
        throw error;
      }
    },

    setJsonTemplateProperties(payload) {
      const currentTemplate = JSON.parse(JSON.stringify(this.currentTemplate));

      const updatedTemplate = {
        data: currentTemplate.data.map((item) => ({
          ...item,
          jsonName: payload.jsonName || this.jsonName,
          sourceSystem: payload.sourceSystem || this.sourceSystem,
          senderDocNo: payload.docNo || generateDocNo(),
        })),
      };

      if (this.uploadedTemplate) {
        this.uploadedTemplate = updatedTemplate;
      } else {
        this.template = updatedTemplate;
      }

      return updatedTemplate;
    },

    async processFile() {
      this.isProses = true;
      this.errorMessage = null;
      this.fileData = null;

      try {
        const file =
          this.type === "EXCEL" ? this.excelFileInput : this.jsonFileInput;
        if (!file) {
          throw new Error(`Please select a ${this.type} file first`);
        }

        this.fileName = file.name;
        const data =
          this.type === "EXCEL"
            ? await this.readExcelFile(file)
            : await this.readJsonFile(file);

        this.processFileData(data);
      } catch (error) {
        console.error("Error processing file:", error);
        this.errorMessage = error.message || "Failed to process file";
      } finally {
        this.isProses = false;
      }
    },

    processFileData(data) {
      const isArray = Array.isArray(data);
      const dataArray = isArray ? data : [data];

      const headers = new Set();
      dataArray.forEach((item) => {
        Object.keys(item).forEach((key) => headers.add(key));
      });

      this.fileData = {
        type: this.type.toLowerCase(),
        data: dataArray,
        headers: Array.from(headers),
      };
    },

    async readExcelFile(file) {
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

            worksheet.getRow(1).eachCell((cell, colNumber) => {
              headers[colNumber - 1] = cell.value;
            });

            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return;

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
    },

    readJsonFile(file) {
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
    },

    downloadJson() {
      if (!this.fileData) return;

      const blob = new Blob([JSON.stringify(this.formattedData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${new Date().toISOString().slice(0, 10)}_${this.docNo}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    async downloadExcel() {
      if (!this.fileData) return;

      try {
        this.isProses = true;
        this.errorMessage = null;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Data");

        // Add headers with style
        const headerRow = worksheet.addRow(this.fileData.headers);
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
        this.fileData.data.forEach((row) => {
          const rowData = this.fileData.headers.map((header) => {
            const value = row[header];
            return typeof value === "object" ? JSON.stringify(value) : value;
          });
          worksheet.addRow(rowData);
        });

        // Style data rows
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber > 1) {
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

        // Auto fit columns
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

        // Generate and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${new Date().toISOString().slice(0, 10)}_${this.docNo}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating Excel file:", error);
        this.errorMessage = "Failed to generate Excel file: " + error.message;
      } finally {
        this.isProses = false;
      }
    },
  },
});
