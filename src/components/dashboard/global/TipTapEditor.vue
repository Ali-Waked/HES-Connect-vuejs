<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Start writing...' },
  dir: { type: String, default: 'ltr' },
  noFocusBorder: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-brand-primary underline' },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML());
  },
  editorProps: {
    attributes: {
      dir: props.dir,
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 text-slate-900 dark:text-slate-100',
    },
  },
});

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val || '', false);
  }
});

watch(() => props.dir, (dir) => {
  if (editor.value?.view?.dom) {
    editor.value.view.dom.setAttribute('dir', dir);
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function setLink() {
  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl || 'https://');
  if (url === null) return;
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

function addImage() {
  const url = window.prompt('Enter image URL:', 'https://');
  if (url === null || !url.trim()) return;
  editor.value.chain().focus().setImage({ src: url.trim() }).run();
}
</script>

<template>
  <div class="tiptap-editor border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition" :class="noFocusBorder ? '' : 'focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/10'">
    <div class="flex flex-wrap gap-0.5 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <button type="button" @click="editor.chain().focus().toggleBold().run()" :class="editor?.isActive('bold') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm font-bold min-w-[30px] flex items-center justify-center" title="Bold">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" :class="editor?.isActive('italic') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm italic font-serif min-w-[30px] flex items-center justify-center" title="Italic">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" :class="editor?.isActive('underline') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm underline min-w-[30px] flex items-center justify-center" title="Underline">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
      </button>
      <span class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center"></span>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="editor?.isActive('heading', { level: 1 }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-xs font-bold min-w-[30px] flex items-center justify-center" title="Heading 1">H1</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="editor?.isActive('heading', { level: 2 }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-xs font-bold min-w-[30px] flex items-center justify-center" title="Heading 2">H2</button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="editor?.isActive('heading', { level: 3 }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-xs font-bold min-w-[30px] flex items-center justify-center" title="Heading 3">H3</button>
      <span class="w-px h-6 bg-slate-200 dark:border-slate-700 mx-0.5 self-center"></span>
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" :class="editor?.isActive('bulletList') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Bullet List">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" :class="editor?.isActive('orderedList') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Numbered List">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().toggleBlockquote().run()" :class="editor?.isActive('blockquote') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Blockquote">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
      </button>
      <span class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center"></span>
      <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" :class="editor?.isActive({ textAlign: 'left' }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Align Left">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" :class="editor?.isActive({ textAlign: 'center' }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Align Center">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
      </button>
      <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" :class="editor?.isActive({ textAlign: 'right' }) ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Align Right">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
      </button>
      <span class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center"></span>
      <button type="button" @click="setLink" :class="editor?.isActive('link') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'" class="p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Link">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
      </button>
      <button type="button" @click="addImage" class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-lg transition cursor-pointer text-sm min-w-[30px] flex items-center justify-center" title="Insert Image">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}
.tiptap-editor .ProseMirror blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #64748b;
  font-style: italic;
}
.dark .tiptap-editor .ProseMirror blockquote {
  border-left-color: #475569;
  color: #94a3b8;
}
.tiptap-editor .ProseMirror ul,
.tiptap-editor .ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.tiptap-editor .ProseMirror ul { list-style-type: disc; }
.tiptap-editor .ProseMirror ol { list-style-type: decimal; }
.tiptap-editor .ProseMirror h1 { font-size: 1.5rem; font-weight: 800; margin: 1rem 0 0.5rem; }
.tiptap-editor .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
.tiptap-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; }
.tiptap-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.tiptap-editor .ProseMirror a { color: #0891b2; text-decoration: underline; }
.tiptap-editor .ProseMirror p { margin: 0.25rem 0; min-height: 1.25rem; }
</style>
