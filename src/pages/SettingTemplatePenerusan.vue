<script setup>
import Layout from "../components/Layout.vue";
import { useTemplateStore } from "../store/templateStore.js";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import PropertiesItem from "../components/blocks/PropertiesItem.vue";
import Properties from "../components/blocks/Properties.vue";

const { title } = defineProps({
  title: String,
});

const templateStore = useTemplateStore();
const { docNoApp, userNik } = storeToRefs(templateStore);
const templatePreview = ref(null);

const docNoError = ref("");
const nikError = ref("");
const localDocNoApp = ref(docNoApp.value);
const localUserNik = ref(userNik.value);

const validateDocNo = () => {
  if (localDocNoApp.value.length > 16) {
    docNoError.value = "Document Number cannot exceed 16 characters";
    localDocNoApp.value = localDocNoApp.value.slice(0, 16);
    return false;
  }
  if (!localDocNoApp.value) {
    docNoError.value = "Document Number is required";
    return false;
  }
  docNoError.value = "";
  return true;
};

const validateNik = () => {
  if (localUserNik.value.length > 8) {
    nikError.value = "NIK cannot exceed 8 characters";
    localUserNik.value = localUserNik.value.slice(0, 8);
    return false;
  }
  if (!localUserNik.value || !localUserNik.value.length < 1) {
    nikError.value = "NIK is required";
    return false;
  }
  nikError.value = "";
  console.log("validate nik called");
  return true;
};

const updateTemplatePreview = () => {
  if (validateDocNo() && validateNik()) {
    docNoApp.value = localDocNoApp.value;
    userNik.value = localUserNik.value;
    templatePreview.value = templateStore.setTemplatePenerusan({
      docNoApp: localDocNoApp.value,
      userNik: localUserNik.value,
    });
  } else {
    templatePreview.value = null;
  }
};

const handleDocNoInput = (event) => {
  if (event.target.value.length >= 16 && event.data) {
    event.preventDefault();
  }
};

watch([localDocNoApp, localUserNik], () => {
  updateTemplatePreview();
});
</script>

<template>
  <Layout>
    <div class="card">
      <div class="card-header">
        <h5>{{ title }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent>
          <div class="mb-3">
            <label for="docNoApp" class="form-label">DocNo App</label>
            <input
              type="text"
              v-model="localDocNoApp"
              class="form-control"
              :class="{ 'is-invalid': docNoError }"
              placeholder="DocNo App"
              maxlength="16"
              @input="handleDocNoInput"
              @blur="validateDocNo"
            />
            <div v-if="docNoError" class="invalid-feedback">
              {{ docNoError }}
            </div>
            <div class="small text-muted mt-1">
              Fomat: (16 characters total)
            </div>
          </div>
          <div class="mb-3">
            <label for="user nik" class="form-label">User NIK</label>
            <input
              type="number"
              v-model="localUserNik"
              class="form-control"
              id="userNik"
              placeholder="Enter Nik User"
              @blur="validateNik"
            />
            <div v-if="nikError" class="invalid-feedback">
              {{ nikError }}
            </div>
          </div>
        </form>

        <Properties>
          <PropertiesItem
            :input-properties="docNoApp"
            input-label="Document Number"
            input-properties-error="Not specified"
          />
          <PropertiesItem
            :input-properties="userNik"
            input-label="JSON Name"
            input-properties-error="Not specified"
          />
        </Properties>

        <div v-if="templatePreview" class="mt-4">
          <div class="card">
            <div class="card-header">Template JSON Structure</div>
            <div class="card-body">
              <pre class="bg-light p-3 rounded">{{
                JSON.stringify(templatePreview, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped></style>
