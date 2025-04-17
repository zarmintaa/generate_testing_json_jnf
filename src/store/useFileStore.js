// stores/fileStore.js
import { defineStore } from "pinia";
import * as ExcelJS from "exceljs";

export const useFileStore = defineStore("file", {
  state: () => ({
    fileType: "JSON",
    isProcessing: false,
    fileData: null,
    errorMessage: null,
    fileName: "",
  }),
  actions: {
    async processFile(file) {
      this.isProcessing = true;
      this.errorMessage = null;

      try {
        if (this.fileType === "EXCEL") {
          await this.processExcelFile(file);
        } else {
          await this.processJsonFile(file);
        }
      } catch (error) {
        this.errorMessage = error.message || "Failed to process file";
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },

    async processExcelFile(file) {
      const data = await this.readExcelFile(file);
      this.fileData = {
        type: "excel",
        data: data,
        headers: data.length > 0 ? Object.keys(data[0]) : [],
      };
      this.fileName = file.name;
    },

    async processJsonFile(file) {
      const data = await this.readJsonFile(file);
      this.fileData = {
        type: "json",
        data: Array.isArray(data) ? data : [data],
        headers:
          Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [],
      };
      this.fileName = file.name;
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

            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell, colNumber) => {
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

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    },

    async readJsonFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            resolve(JSON.parse(e.target.result));
          } catch (error) {
            reject(new Error("Invalid JSON file format"));
          }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    },

    setFileType(type) {
      this.fileType = type;
    },
  },
});
