import { ref, computed } from 'vue'

export function useCalendar() {
  const currentDate = ref(new Date())
  const startHour = 7
  const endHour = 22
  const slotMinutes = 30

  const weekStart = computed(() => {
    const d = new Date(currentDate.value)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const weekEnd = computed(() => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + 6)
    d.setHours(23, 59, 59, 999)
    return d
  })

  const weekLabel = computed(() => {
    const opts = { month: 'short', day: 'numeric' }
    const s = weekStart.value.toLocaleDateString('en-US', opts)
    const e = weekEnd.value.toLocaleDateString('en-US', opts)
    return `Week of ${s} - ${e}`
  })

  const weekDays = computed(() => {
    const days = []
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.value)
      d.setDate(d.getDate() + i)
      days.push({
        date: d,
        name: dayNames[i],
        short: dayNames[i].slice(0, 3),
        isToday: isSameDay(d, new Date()),
        dayOfWeek: i + 1,
      })
    }
    return days
  })

  const timeSlots = computed(() => {
    const slots = []
    for (let h = startHour; h < endHour; h++) {
      slots.push({ hour: h, minute: 0, label: formatHour(h) })
      slots.push({ hour: h, minute: 30, label: '' })
    }
    return slots
  })

  const hours = computed(() => {
    const arr = []
    for (let h = startHour; h < endHour; h++) {
      arr.push(h)
    }
    return arr
  })

  function nextWeek() {
    const d = new Date(currentDate.value)
    d.setDate(d.getDate() + 7)
    currentDate.value = d
  }

  function prevWeek() {
    const d = new Date(currentDate.value)
    d.setDate(d.getDate() - 7)
    currentDate.value = d
  }

  function goToToday() {
    currentDate.value = new Date()
  }

  function getEventPosition(startAt, endAt) {
    const start = new Date(startAt)
    const end = new Date(endAt)
    const startMinutes = (start.getHours() - startHour) * 60 + start.getMinutes()
    const duration = (end.getTime() - start.getTime()) / 60000
    const top = (startMinutes / (slotMinutes * 2)) * 48
    const height = (duration / (slotMinutes * 2)) * 48
    return { top: Math.max(0, top), height: Math.max(24, height) }
  }

  function getSchedulePosition(startTime, endTime) {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const startMinutes = (sh - startHour) * 60 + sm
    const duration = (eh * 60 + em) - (sh * 60 + sm)
    const top = (startMinutes / (slotMinutes * 2)) * 48
    const height = (duration / (slotMinutes * 2)) * 48
    return { top: Math.max(0, top), height: Math.max(24, height) }
  }

  function formatHour(h) {
    return `${String(h).padStart(2, '0')}:00`
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  return {
    currentDate,
    startHour,
    endHour,
    slotMinutes,
    weekStart,
    weekEnd,
    weekLabel,
    weekDays,
    timeSlots,
    hours,
    nextWeek,
    prevWeek,
    goToToday,
    getEventPosition,
    getSchedulePosition,
    isSameDay,
  }
}
