export const downloadJson = (jsonData) => {
  if (!this.fileData) return;

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_${new Date().toISOString().slice(0, 10)}_${
    this.fileName
  }.json`;
  a.click();
  URL.revokeObjectURL(url);
};
