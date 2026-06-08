import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const STORIES = [
  {
    id: 1,
    patientFirstName: 'Lina',
    patientAge: 9,
    patientGender: 'female',
    location: 'Gaza City',
    images: null,
    title: 'Help Lina recover from her surgery',
    content: `Lina is a 9-year-old girl from Gaza City who was injured during the conflict and requires urgent reconstructive surgery. Her family cannot afford the cost of treatment. She has been waiting for 3 months for a surgical slot at Al-Shifa Hospital, but the ongoing shortage of medical supplies and staff has caused repeated delays. Lina's mother, Mariam, stays by her bedside every day, hoping for a miracle. The family has sold most of their belongings just to cover basic living expenses. The surgery costs $5,000 — an impossible sum for them. Your donation can give Lina a chance to walk again without pain. Every contribution, no matter how small, brings her one step closer to recovery. The doctors have confirmed that the surgery has a high success rate if performed within the next few weeks. After the surgery, Lina will need physical therapy and follow-up visits, which the hospital has agreed to provide at a reduced cost if we can raise the full surgical fee. Please help us restore Lina's hope and her health. Share her story with your friends and family. Together, we can make a difference in the life of this brave little girl.`,
    category: 'Surgery',
    tags: ['Children', 'Surgery', 'Urgent'],
    status: 'approved',
    isFundraising: true,
    targetAmount: 5000,
    collectedAmount: 3200,
    donorCount: 47,
    createdAt: '2026-04-10',
    updatedAt: '2026-05-01',
    updates: [
      { id: 1, date: '2026-04-20', text: 'Lina has been admitted to Al-Shifa hospital and pre-op tests are done.' },
      { id: 2, date: '2026-05-01', text: 'Surgery is scheduled for next week. Thank you for your support!' }
    ],
    relatedStories: [2, 3]
  },
  {
    id: 2,
    patientFirstName: 'Mohammed',
    patientAge: 34,
    patientGender: 'male',
    location: 'Khan Younis',
    images: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop'
    ],
    title: 'Road to Recovery After Emergency Surgery',
    content: `Mohammed is a 34-year-old father of three from Khan Younis. Two months ago, he suffered a severe abdominal infection that required emergency surgery. The operation was successful, but Mohammed now faces a long and costly recovery process. He needs daily medication, follow-up appointments, and specialized physiotherapy. Before his illness, Mohammed was the sole breadwinner for his family, working as a small shopkeeper. The prolonged recovery has left his family without a source of income. The medical bills continue to pile up, and Mohammed's health insurance covers only a fraction of the costs. His wife, Aisha, has been forced to borrow money from neighbors and relatives just to buy food for their children. The doctors say Mohammed will need at least three more months of treatment before he can return to work. The total cost of his remaining treatment is $5,000, including medications, physiotherapy sessions, and specialist consultations. Your donation will directly fund Mohammed's recovery and help his family get back on their feet. No father should have to choose between his health and feeding his children. Please support Mohammed's journey back to health.`,
    category: 'Surgery',
    tags: ['Adults', 'Surgery', 'Recovery'],
    status: 'approved',
    isFundraising: true,
    targetAmount: 5000,
    collectedAmount: 3200,
    donorCount: 47,
    createdAt: '2026-03-15',
    updatedAt: '2026-04-28',
    updates: [
      { id: 1, date: '2026-03-20', text: 'Mohammed has been discharged from the hospital and is recovering at home.' },
      { id: 2, date: '2026-04-10', text: 'Physical therapy sessions have begun. Mohammed is showing good progress.' },
      { id: 3, date: '2026-04-28', text: 'Follow-up appointment showed positive results. Continuing treatment plan.' }
    ],
    relatedStories: [1, 4]
  },
  {
    id: 3,
    patientFirstName: 'Layla',
    patientAge: 14,
    patientGender: 'female',
    location: 'Rafah',
    images: [
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=450&fit=crop'
    ],
    title: 'My Journey with Asthma — Breathing Again',
    content: `Layla is a 14-year-old girl from Rafah who has been living with severe asthma since early childhood. The dusty environment and poor air quality in Gaza have made her condition progressively worse over the years. She has been hospitalized multiple times for acute asthma attacks, each time requiring emergency treatment. Despite her condition, Layla is a bright student who dreams of becoming a doctor. She has missed over 60 days of school this year due to her health. Her parents have spent their life savings on medications and hospital visits. The family recently learned about a specialized treatment program that could significantly improve Layla's quality of life. The program includes advanced inhalers, allergy testing, and regular consultations with a pulmonologist. The total cost is beyond what her family can afford. While we are primarily sharing this story for awareness, any funds raised will go directly towards Layla's treatment and medication supplies. Your support can help this young girl breathe easier and pursue her dream of becoming a doctor.`,
    category: 'Pulmonology',
    tags: ['Children', 'Asthma', 'Awareness'],
    status: 'approved',
    isFundraising: false,
    targetAmount: 0,
    collectedAmount: 0,
    donorCount: 0,
    createdAt: '2026-02-20',
    updatedAt: '2026-04-15',
    updates: [
      { id: 1, date: '2026-03-01', text: 'Layla visited the pulmonology specialist. New treatment plan prescribed.' },
      { id: 2, date: '2026-04-15', text: 'Layla has started her new medication regimen and is responding well.' }
    ],
    relatedStories: [1, 5]
  },
  {
    id: 4,
    patientFirstName: 'Rania',
    patientAge: 28,
    patientGender: 'female',
    location: 'Jabalia',
    images: [
      'https://images.unsplash.com/photo-1555252333-9f8e92a65df4?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1571772102486-b0f37aba4f0b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop'
    ],
    title: 'A New Beginning for My Baby',
    content: `Rania, a 28-year-old mother from Jabalia, gave birth to her baby boy prematurely at 32 weeks. Baby Youssef weighed only 1.8 kilograms at birth and was immediately admitted to the neonatal intensive care unit (NICU). For the past six weeks, Youssef has been fighting for his life in an incubator. The medical team at the NICU has been providing round-the-clock care, and Youssef is now slowly gaining weight and growing stronger. However, the cost of neonatal intensive care is enormous. Rania's husband works as a day laborer and their income has been severely disrupted by the ongoing situation. The hospital has agreed to continue treatment, but the family needs help covering the remaining NICU costs, which amount to $8,000. Rania spends every day at the hospital, praying for her baby's recovery while worrying about how to pay the bills. Your donation will directly cover the cost of Youssef's NICU stay, medications, and specialized feeding supplies. Help give this newborn a fighting chance at life. Every dollar brings Youssef closer to going home with his loving family.`,
    category: 'Pediatrics',
    tags: ['Newborn', 'Pediatrics', 'Urgent'],
    status: 'approved',
    isFundraising: true,
    targetAmount: 8000,
    collectedAmount: 6100,
    donorCount: 83,
    createdAt: '2026-01-25',
    updatedAt: '2026-05-10',
    updates: [
      { id: 1, date: '2026-02-10', text: 'Baby Youssef has reached 2.2kg. Doctors are encouraged by his progress.' },
      { id: 2, date: '2026-03-15', text: 'Youssef has been moved from intensive care to the step-down unit. Great news!' },
      { id: 3, date: '2026-05-10', text: 'Youssef is now 3.1kg and breathing on his own. Discharge expected soon Insha\'Allah.' }
    ],
    relatedStories: [1, 2]
  },
  {
    id: 5,
    patientFirstName: 'Amir',
    patientAge: 42,
    patientGender: 'male',
    location: 'Deir Al-Balah',
    images: null,
    title: 'Mental Health Matters — My Story',
    content: `Amir is a 42-year-old teacher from Deir Al-Balah who has been silently struggling with anxiety, depression, and post-traumatic stress disorder (PTSD) for the past two years. The ongoing conflict, loss of colleagues, and constant fear for his family's safety have taken a severe toll on his mental health. In Gaza, mental health services are severely limited, and the stigma surrounding psychological care prevents many from seeking help. Amir decided to share his story publicly in the hope of breaking the silence around mental health in his community. He has started attending a support group organized by a local NGO, and he is also seeing a counselor when funding allows. This story is shared primarily for awareness purposes — to let others know they are not alone and that seeking help is a sign of strength. If you or someone you know is struggling, please reach out. Mental health matters, and every conversation helps reduce the stigma. Together, we can build a more compassionate and understanding community.`,
    category: 'Mental Health',
    tags: ['Adults', 'Mental Health', 'Awareness'],
    status: 'approved',
    isFundraising: false,
    targetAmount: 0,
    collectedAmount: 0,
    donorCount: 0,
    createdAt: '2026-05-05',
    updatedAt: '2026-05-20',
    updates: [
      { id: 1, date: '2026-05-20', text: 'Amir shared his story at a community event. The response was overwhelmingly supportive.' }
    ],
    relatedStories: [3]
  }
];

export const useStoriesStore = defineStore('stories', () => {
  const stories = ref(STORIES);
  const toasts = ref([]);
  let toastId = 0;

  const storyById = (id) => computed(() => stories.value.find(s => s.id === Number(id)));

  function showToast(message, type = 'success') {
    const id = ++toastId;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, type === 'error' ? 4000 : 3000);
  }

  function donate(storyId, amount, donorName) {
    const story = stories.value.find(s => s.id === storyId);
    if (!story || !story.isFundraising || amount <= 0) return;
    story.collectedAmount += amount;
    story.donorCount += 1;
    if (story.collectedAmount > story.targetAmount) {
      story.collectedAmount = story.targetAmount;
    }
  }

  return { stories, toasts, storyById, showToast, donate };
});
