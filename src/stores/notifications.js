import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationsStore = defineStore('notifications', () => {

  // ── Seed data ──────────────────────────────────────────────────────────────
  const seed = [
    { id: 1,  type: 'story',       title: 'New story submitted',       message: 'Khalid Abu Amr submitted "Help Me Continue Physical Therapy"',         timeAgo: '2 min ago',   read: false },
    { id: 2,  type: 'fundraising', title: 'Fundraising milestone',      message: '"A New Beginning for My Baby" reached 76% of its fundraising goal',    timeAgo: '15 min ago',  read: false },
    { id: 3,  type: 'story',       title: 'Story approved',             message: 'Mohammed Al-Masri\'s story was approved by the review team',           timeAgo: '1 hour ago',  read: false },
    { id: 4,  type: 'user',        title: 'New patient registered',     message: 'Layla Ibrahim created a new patient account in the system',            timeAgo: '2 hours ago', read: true  },
    { id: 5,  type: 'org',         title: 'Organization updated',       message: 'Al-Awda Hospital Foundation profile details were updated',              timeAgo: '3 hours ago', read: true  },
    { id: 6,  type: 'facility',    title: 'New facility added',         message: 'European Gaza Hospital was successfully added to the system',           timeAgo: '5 hours ago', read: true  },
    { id: 7,  type: 'story',       title: 'Story rejected',             message: 'Amir Zaki\'s mental health story was rejected by the reviewer',        timeAgo: '1 day ago',   read: false },
    { id: 8,  type: 'system',      title: 'System maintenance done',    message: 'Scheduled maintenance completed. All services are back online',         timeAgo: '2 days ago',  read: true  },
    { id: 9,  type: 'fundraising', title: 'Donation received',          message: '"Road to Recovery" campaign received a new $500 donation',             timeAgo: '2 days ago',  read: true  },
    { id: 10, type: 'user',        title: 'Staff member added',         message: 'Dr. Youssef Nasser was assigned as Internal Medicine department head',  timeAgo: '3 days ago',  read: true  },
    { id: 11, type: 'org',         title: 'New organization joined',    message: 'Islamic Relief Worldwide was added to the health ecosystem',            timeAgo: '4 days ago',  read: true  },
    { id: 12, type: 'facility',    title: 'Facility location updated',  message: 'Kamal Adwan Hospital GPS coordinates were updated',                    timeAgo: '5 days ago',  read: true  },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  const notifications = ref([]);

  // ── Init from localStorage ─────────────────────────────────────────────────
  const stored = localStorage.getItem('hes_notifications');
  if (stored) {
    try { notifications.value = JSON.parse(stored); }
    catch { notifications.value = [...seed]; }
  } else {
    notifications.value = [...seed];
    save();
  }

  function save() {
    localStorage.setItem('hes_notifications', JSON.stringify(notifications.value));
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  const unreadCount   = computed(() => notifications.value.filter(n => !n.read).length);
  const last5         = computed(() => notifications.value.slice(0, 5));
  const unreadOnly    = computed(() => notifications.value.filter(n => !n.read));
  const hasUnread     = computed(() => unreadCount.value > 0);

  // ── Actions ────────────────────────────────────────────────────────────────
  function markRead(id) {
    const n = notifications.value.find(n => n.id === id);
    if (n) { n.read = true; save(); }
  }

  function markAllRead() {
    notifications.value.forEach(n => n.read = true);
    save();
  }

  function dismiss(id) {
    notifications.value = notifications.value.filter(n => n.id !== id);
    save();
  }

  // ── Icon & colour config per type ─────────────────────────────────────────
  const typeConfig = {
    story:       { bg: 'bg-blue-100',    icon: 'text-blue-600',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>` },
    fundraising: { bg: 'bg-rose-100',    icon: 'text-rose-600',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>` },
    user:        { bg: 'bg-indigo-100',  icon: 'text-indigo-600', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>` },
    org:         { bg: 'bg-purple-100',  icon: 'text-purple-600', svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>` },
    facility:    { bg: 'bg-teal-100',    icon: 'text-teal-600',   svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"/>` },
    system:      { bg: 'bg-slate-100',   icon: 'text-slate-500',  svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>` },
  };

  function getConfig(type) {
    return typeConfig[type] || typeConfig.system;
  }

  return {
    notifications,
    unreadCount,
    last5,
    unreadOnly,
    hasUnread,
    markRead,
    markAllRead,
    dismiss,
    getConfig,
  };
});
