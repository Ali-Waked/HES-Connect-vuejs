<script setup>
import { useI18n } from 'vue-i18n';
import { useFormatDate } from '../../../composables/useFormatDate';

const { t } = useI18n();
const { formatDate } = useFormatDate();

defineProps({
  files: { type: Array, default: () => [] },
});

function getFileType(file) {
  if (file.type) return file.type;
  const name = file.name || file.original_name || '';
  const ext = name.split('.').pop()?.toLowerCase();
  const mimeMap = {
    pdf: 'PDF',
    doc: 'DOC',
    docx: 'DOCX',
    xls: 'XLS',
    xlsx: 'XLSX',
    jpg: 'JPG',
    jpeg: 'JPEG',
    png: 'PNG',
    txt: 'TXT',
  };
  return mimeMap[ext] || 'File';
}

function getFileName(file) {
  return file.name || file.original_name || 'Untitled';
}

function getFileUrl(file) {
  return file.url || file.path || file.file_url || file.original_url || file.download_url || '#';
}
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ t('facilities.documents') }}
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ files.length }}</span>
      </h3>
    </div>
    <div v-if="files.length === 0" class="p-6 flex flex-col items-center justify-center py-8 text-center gap-3">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">{{ t('common.noData') || 'No documents' }}</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left rtl:text-right">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-800">
            <th class="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('common.name') }}</th>
            <th class="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('common.file') }}</th>
            <th class="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ t('reviews.createdAt') }}</th>
            <th class="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right rtl:text-left">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="(file, index) in files" :key="index" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-slate-900 dark:text-white">{{ getFileName(file) }}</span>
              </div>
            </td>
            <td class="px-6 py-3.5">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {{ getFileType(file) }}
              </span>
            </td>
            <td class="px-6 py-3.5 text-sm text-slate-500 dark:text-slate-400">{{ formatDate(file.created_at) }}</td>
            <td class="px-6 py-3.5 text-right rtl:text-left">
              <div class="flex justify-end rtl:justify-start gap-1">
                <a
                  :href="getFileUrl(file)"
                  target="_blank"
                  class="p-1.5 rounded-lg transition"
                  :class="getFileUrl(file) !== '#'
                    ? 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none'"
                  :title="t('common.view')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
                <a
                  :href="getFileUrl(file)"
                  download
                  class="p-1.5 rounded-lg transition"
                  :class="getFileUrl(file) !== '#'
                    ? 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none'"
                  :title="t('facilityDetail.download')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
