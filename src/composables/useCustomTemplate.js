// composables/useCustomTemplate.js
import { useJsonTemplate } from "./useJsonTemplate";

export function useCustomTemplate() {
  const baseTemplate = useJsonTemplate();

  // Custom template generator untuk format yang berbeda
  const generateCustomTemplate = (config, fileData = null) => {
    const { senderDocNo, jsonName, sourceSystem } = config;

    let records = [];
    if (fileData?.value) {
      records = fileData.value.data.map((record, index) => ({
        id: index + 1,
        timestamp: new Date().toISOString(),
        payload: record,
        status: "pending",
      }));
    }

    return {
      metadata: {
        version: "1.0",
        generated: new Date().toISOString(),
        source: sourceSystem,
        documentNumber: senderDocNo,
        templateName: jsonName,
      },
      payload: {
        totalRecords: records.length,
        records: records,
      },
    };
  };

  // Template untuk format invoice
  const generateInvoiceTemplate = (config, fileData = null) => {
    const { senderDocNo, jsonName, sourceSystem } = config;

    let invoiceItems = [];
    if (fileData?.value) {
      invoiceItems = fileData.value.data.map((item, index) => ({
        lineNumber: index + 1,
        itemCode: item.itemCode || "",
        description: item.description || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
      }));
    }

    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + tax;

    return {
      invoice: {
        documentNumber: senderDocNo,
        templateType: jsonName,
        sourceSystem: sourceSystem,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        items: invoiceItems,
        summary: {
          subtotal: subtotal,
          tax: tax,
          total: total,
        },
      },
    };
  };

  // Template untuk format purchase order
  const generatePurchaseOrderTemplate = (config, fileData = null) => {
    const { senderDocNo, jsonName, sourceSystem } = config;

    let orderItems = [];
    if (fileData?.value) {
      orderItems = fileData.value.data.map((item, index) => ({
        lineItem: index + 1,
        productCode: item.productCode || "",
        productName: item.productName || "",
        requestedQuantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        expectedDeliveryDate:
          item.deliveryDate ||
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      }));
    }

    return {
      purchaseOrder: {
        orderNumber: senderDocNo,
        orderType: jsonName,
        requestingSystem: sourceSystem,
        orderDate: new Date().toISOString().split("T")[0],
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "draft",
        items: orderItems,
        totalItems: orderItems.length,
        approvalRequired: orderItems.some((item) => item.unitPrice > 10000),
      },
    };
  };

  return {
    ...baseTemplate,
    generateCustomTemplate,
    generateInvoiceTemplate,
    generatePurchaseOrderTemplate,
  };
}

// Example usage in component:
/*
import { useCustomTemplate } from '../composables/useCustomTemplate'

const {
  generateCustomTemplate,
  generateInvoiceTemplate,
  generatePurchaseOrderTemplate,
  downloadJson,
  copyToClipboard,
  handlePreviewJsonTemplate,
  isPreviewJsonTemplate,
  copyStatus
} = useCustomTemplate()

// In computed:
const templateWithFileData = computed(() => {
  if (validateAll()) {
    const config = {
      senderDocNo: senderDocNo.value,
      jsonName: jsonName.value,
      sourceSystem: sourceSystem.value
    }

    // Choose template based on jsonName or other criteria
    switch (jsonName.value) {
      case 'INVOICE':
        return generateInvoiceTemplate(config, fileData)
      case 'PURCHASE_ORDER':
        return generatePurchaseOrderTemplate(config, fileData)
      case 'CUSTOM':
        return generateCustomTemplate(config, fileData)
      default:
        return generateTemplate(config, fileData) // fallback to default
    }
  }
  return null
})
*/
