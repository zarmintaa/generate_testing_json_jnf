<script setup>
import Layout from "../components/Layout.vue";
import { useTemplateStore } from "../store/templateStore.js";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
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

onMounted(() => {
  templatePreview.value = templateStore.generateTemplatePenerusan();
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
            <label class="form-label" for="docNoApp">DocNo App</label>
            <input
              v-model="localDocNoApp"
              :class="{ 'is-invalid': docNoError }"
              class="form-control"
              maxlength="16"
              placeholder="DocNo App"
              type="text"
              @blur="validateDocNo"
              @input="handleDocNoInput"
            />
            <div v-if="docNoError" class="invalid-feedback">
              {{ docNoError }}
            </div>
            <div class="small text-muted mt-1">
              Fomat: (16 characters total)
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="user nik">User NIK</label>
            <input
              id="userNik"
              v-model="localUserNik"
              class="form-control"
              placeholder="Enter Nik User"
              type="number"
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

        <div class="mt-4">
          <div class="card">
            <div class="card-header">Template JSON Structure</div>
            <div class="card-body p-0">
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

<style scoped>
.card-header-tabs {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  padding: 0.75rem 1.25rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.rounded {
  border-radius: 0.25rem !important;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-bottom: 0;
}

.text-danger {
  color: #dc3545;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.small {
  font-size: 0.875em;
}

.text-muted {
  color: #6c757d !important;
}
</style>
