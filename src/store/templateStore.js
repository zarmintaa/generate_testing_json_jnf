import { defineStore } from "pinia";
import { Utils } from "../utils/Utils.js";

const userNik = "1000082742";

export const useTemplateStore = defineStore("templateStore", {
  state: () => ({
    docNoApp: Utils.generateDocNoApp(),
    jumlahRow: 0,
    jumlahAmout: 0,
    userNik: userNik,
    data: [],
    fastSeqNo: "1",
    jsonName: "MASTER",
    sourceSystem: "AMAN",
    senderDocNo: Utils.generateSenderDocNo(),
  }),
  getters: {},
  actions: {
    setTemplatePenerusan({ docNoApp, userNik }) {
      this.docNoApp = docNoApp;
      this.userNik = userNik;
      return this.generateTemplatePenerusan();
    },

    setTemplateDisburse({ jsonName, sourceSystem, senderDocNo }) {
      this.jsonName = jsonName;
      this.sourceSystem = sourceSystem;
      this.senderDocNo = senderDocNo;
      return this.generateTemplateDisburse();
    },

    generateTemplatePenerusan() {
      return {
        docNoApp: this.docNoApp,
        jumlahRow: 0,
        jumlahAmount: 0,
        userNik: this.userNik,
        data: [],
      };
    },

    generateTemplateDisburse() {
      return {
        data: [
          {
            fastSeqNo: this.fastSeqNo,
            msgContent: [],
            jsonName: this.jsonName,
            sourceSystem: this.sourceSystem,
            senderDocNo: this.senderDocNo,
          },
        ],
      };
    },

    setDocNoApp() {
      this.data.forEach((item) => {
        if (item.AIT_DOC_NO_APP) {
          this.docNoApp = item.AIT_DOC_NO_APP;
        }
      });

      if (!this.docNoApp || this.docNoApp.value.length === 0) {
        this.docNoApp = generateDocNoApp();
      }
    },

    setData(data, type = "disburse") {
      if (type === "disburse") {
        if (!data) this.data = [];
        this.data = data.map((record) => JSON.stringify(record));
      }

      this.data = data.map((record) => record);
      this.setJumlahRow();
      this.setJumlahAmount();
      this.setDocNoApp();
    },

    setJumlahRow() {
      this.jumlahRow = this.data.length;
    },

    setJumlahAmount() {
      let amount = 0;

      if (this.data) {
        this.data.forEach((item) => {
          if (item.AIT_AMOUNT1) {
            amount += item.AIT_AMOUNT1;
          } else {
            amount += 0;
          }
        });
      } else {
        amount = 0;
      }
      this.jumlahAmount = amount;
    },

    getPenerusanRequest() {
      return JSON.stringify(
        {
          docNoApp: this.docNoApp,
          jumlahRow: this.jumlahRow,
          jumlahAmount: this.jumlahAmount,
          userNik: this.userNik,
          data: this.data,
        },
        null,
        2,
      );
    },

    getDisburseRequest() {
      return JSON.stringify(
        {
          data: [
            {
              fastSeqNo: this.fastSeqNo,
              msgContent: this.data,
              jsonName: this.jsonName,
              sourceSystem: this.sourceSystem,
              senderDocNo: this.senderDocNo,
            },
          ],
        },
        null,
        2,
      );
    },
  },
});
