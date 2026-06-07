<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: { type: [Object, Array], required: true },
  expanded: { type: Boolean, default: true }
});

const formattedJson = computed(() => {
  return JSON.stringify(props.data, null, 2);
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(formattedJson.value);
};

const downloadJson = () => {
  const blob = new Blob([formattedJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report-${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
    <div class="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JSON Output</span>
      <div class="flex gap-2">
        <button 
          @click="copyToClipboard"
          class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1.5 text-xs font-semibold"
          title="Copy to clipboard"
        >
          <span class="material-symbols-outlined text-sm">content_copy</span>
          Copy
        </button>
        <button 
          @click="downloadJson"
          class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1.5 text-xs font-semibold"
          title="Download JSON"
        >
          <span class="material-symbols-outlined text-sm">download</span>
          Download
        </button>
      </div>
    </div>
    <pre class="p-4 text-xs font-mono text-emerald-400 overflow-auto max-h-[500px] leading-relaxed"><code>{{ formattedJson }}</code></pre>
  </div>
</template>
