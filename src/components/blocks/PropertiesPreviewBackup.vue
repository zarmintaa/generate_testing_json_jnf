<script setup>
const {
  docNo,
  jsonName,
  sourceSystem,
  docNoError,
  jsonNameError,
  sourceSystemError,
  fileName,
} = defineProps({
  docNo: String,
  jsonName: String,
  sourceSystem: String,
  docNoError: Boolean,
  jsonNameError: Boolean,
  sourceSystemError: Boolean,
});
</script>

<template>
  <div class="card mt-4">
    <div class="card-header">
      <div>Setting Properties</div>
    </div>
    <div class="card-body">
      <div v-if="fileName" class="mb-2">
        <strong>File processed: </strong>
        {{ fileName || "File didn't process yet" }}
      </div>

      <div class="mb-2">
        <strong>Document Number:</strong>
        <span :class="{ 'text-danger': docNoError }">
          {{ docNo || "Not specified" }}
        </span>
      </div>

      <div class="mb-2">
        <strong>JSON Name:</strong>
        <span :class="{ 'text-danger': jsonNameError }">
          {{ jsonName || "Not specified" }}
        </span>
      </div>

      <div class="mb-2">
        <strong>Source System:</strong>
        <span :class="{ 'text-danger': sourceSystemError }">
          {{ sourceSystem || "Not specified" }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
