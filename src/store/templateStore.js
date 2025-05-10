import { defineStore } from "pinia";

function generateSenderDocNo() {
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

function generateDocNoApp(prefix = "J") {
  const year = new Date().getFullYear().toString().slice(-2); // "25"
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random
  const paddedNum = randomNum.toString().padStart(12, "0"); // "000000123456"
  return year + prefix + paddedNum;
}

export const useTemplateStore = defineStore("templateStore", {
  state: () => ({
    docNoApp: generateDocNoApp(),
    jumlahRow: 0,
    jumlahAmout: 0,
    userNik: "1000082742",
    data: [],
    fastSeqNo: "1",
    jsonName: "MASTER",
    sourceSystem: "AMAN",
    senderDocNo: generateSenderDocNo(),
  }),
  getters: {},
  actions: {
    setTemplatePenerusan({ docNoApp, userNik }) {
      return {
        docNoApp: docNoApp || this.docNoApp,
        jumlahRow: this.jumlahRow,
        jumlahAmount: this.jumlahAmount,
        userNik: userNik || this.userNik,
        data: [],
      };
    },
    setTemplateDisburse({ jsonName, sourceSystem, senderDocNo }) {
      return {
        data: [
          {
            fastSeqNo: this.fastSeqNo,
            msgContent: [],
            jsonName: jsonName || this.jsonName,
            sourceSystem: sourceSystem || this.sourceSystem,
            senderDocNo: senderDocNo || this.senderDocNo,
          },
        ],
      };
    },
    generateTemplatePenerusan() {
      return {
        docNoApp: this.docNoApp,
        jumlahRow: this.jumlahRow,
        jumlahAmount: this.jumlahAmount,
        userNik: this.userNik,
        data: this.data,
      };
    },

    setData(data, type = "disburse") {
      if (type === "disburse") {
        if (!data) this.data = [];
        this.data = data.map((record) => JSON.stringify(record));
      }

      this.data = data.map((record) => record);
      this.setJumlahRow();
      this.setJumlahAmount();
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
