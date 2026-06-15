
const FACILITY_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=500&fit=crop'
];

const FACILITY_IMAGES_META = [
  { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=600&fit=crop', alt: 'Hospital building exterior', caption: 'Main Entrance' },
  { url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=600&fit=crop', alt: 'Hospital lobby interior', caption: 'Reception Area' },
  { url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&h=600&fit=crop', alt: 'Modern operating room', caption: 'Operating Theater' },
  { url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=600&fit=crop', alt: 'Patient room with modern equipment', caption: 'Patient Ward' },
  { url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=600&fit=crop', alt: 'Pharmacy interior', caption: 'Pharmacy' },
  { url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop', alt: 'Medical equipment in clinic', caption: 'Diagnostics Lab' },
  { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop', alt: 'Doctor consulting patient', caption: 'Consultation Room' },
  { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=600&fit=crop', alt: 'Hospital corridor', caption: 'Hospital Wing' },
];

const ARTICLE_COVERS = [
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop',
];

const DOCTOR_PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612531386530-97286d97c2b2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
];

const FACILITIES = [
  { id: 1, name: 'Nasser Medical Point', facility_type: 'medical_point', organization_name: 'Ministry of Health Gaza', latitude: 31.3478, longitude: 34.3012, rating: 4.2, review_count: 18, image: FACILITY_IMAGES[0], city: 'Rafah', doctor_count: 5, department_count: 3, head_doctor: 'Dr. Salem Ahmed', description: 'Essential primary healthcare services including general consultations and vaccinations.' },
  { id: 2, name: 'Al-Shifa Emergency Unit', facility_type: 'medical_point', organization_name: 'Ministry of Health Gaza', latitude: 31.5195, longitude: 34.4370, rating: 4.5, review_count: 42, image: FACILITY_IMAGES[1], city: 'Gaza City', doctor_count: 12, department_count: 2, head_doctor: 'Dr. Ibrahim Khalil', description: 'Dedicated emergency response center handling urgent medical cases 24/7.' },
  { id: 3, name: 'MSF Emergency Pharmacy', facility_type: 'pharmacy', organization_name: 'Doctors Without Borders', latitude: 31.4990, longitude: 34.4601, rating: 4.7, review_count: 31, image: FACILITY_IMAGES[2], city: 'Deir al-Balah', doctor_count: 0, department_count: 1, head_doctor: null, description: 'Providing essential medications and pharmaceutical services in partnership with MSF.' },
  { id: 4, name: 'Al-Awda Clinic Jabalia', facility_type: 'clinic', organization_name: 'Al-Awda Hospital Foundation', latitude: 31.5310, longitude: 34.4826, rating: 4.6, review_count: 27, image: FACILITY_IMAGES[3], city: 'Jabalia', doctor_count: 8, department_count: 4, head_doctor: 'Dr. Amira Yousef', description: 'Comprehensive outpatient services including general medicine and pediatrics.' },
  { id: 5, name: 'UNRWA Health Center Rafah', facility_type: 'clinic', organization_name: 'UNRWA Health Department', latitude: 31.2963, longitude: 34.2545, rating: 4.3, review_count: 15, image: FACILITY_IMAGES[4], city: 'Rafah', doctor_count: 6, department_count: 3, head_doctor: 'Dr. Rami Saleh', description: 'Primary healthcare services for refugees, including maternal health and immunization.' },
  { id: 6, name: 'European Gaza Hospital', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.3430, longitude: 34.2987, rating: 4.8, review_count: 56, image: FACILITY_IMAGES[0], city: 'Khan Younis', doctor_count: 45, department_count: 12, head_doctor: 'Dr. Mahmoud Zaki', head_staff_id: 2, description: 'Large medical facility providing comprehensive surgery, pediatrics, and maternity services.' },
  { id: 7, name: 'Kamal Adwan Hospital', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.5560, longitude: 34.4965, rating: 4.9, review_count: 63, image: FACILITY_IMAGES[1], city: 'Beit Lahia', doctor_count: 38, department_count: 10, head_doctor: 'Dr. Kamal Nasser', head_staff_id: 1, description: 'Full range of medical services featuring advanced emergency and surgical wards.' },
  { id: 8, name: 'Al-Shifa Medical Complex', facility_type: 'hospital', organization_name: 'Ministry of Health Gaza', latitude: 31.5200, longitude: 34.4375, rating: 4.9, review_count: 89, image: FACILITY_IMAGES[2], city: 'Gaza City', doctor_count: 120, department_count: 25, head_doctor: 'Dr. Mohammed Al-Rifi', head_staff_id: 4, description: 'The largest medical facility in Gaza, offering specialized care across multiple departments.' }
];

const STORIES = [
  { id: 1, title: 'Help Me Continue Physical Therapy', patient_first_name: 'Khalid', content_excerpt: 'I suffered a serious leg injury last year and the doctors advised intensive physical therapy to regain full mobility. We have completed 4 of the 12 required sessions but can no longer afford to continue.', collected_amount: 850, target_amount: 2000, cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop' },
  { id: 2, title: 'Road to Recovery After Emergency Surgery', patient_first_name: 'Mohammed', content_excerpt: 'Following an emergency appendectomy, I was left with significant hospital bills and post-operative care costs. The surgery was successful but the road to full recovery requires medication and follow-up visits.', collected_amount: 3200, target_amount: 5000, cover_image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
  { id: 3, title: 'My Journey with Asthma – Breathing Again', patient_first_name: 'Layla', content_excerpt: 'I have been living with severe asthma since childhood. The dust and air quality in Gaza has made my condition much worse this year. I wanted to share my story to raise awareness.', collected_amount: 0, target_amount: 0, cover_image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop' },
  { id: 4, title: 'A New Beginning for My Baby', patient_first_name: 'Rania', content_excerpt: 'My baby was born premature at 32 weeks. The neonatal team has been incredible. We are raising funds to cover the remaining hospital costs and bring our baby home safely.', collected_amount: 6100, target_amount: 8000, cover_image: 'https://images.unsplash.com/photo-1555252333-9f8e92a65df4?w=600&h=400&fit=crop' },
  { id: 5, title: 'Mental Health Matters – My Story', patient_first_name: 'Amir', content_excerpt: 'I have been struggling with anxiety and depression for the past two years due to the ongoing conflict. I wanted to share my experience to break the stigma around mental health in our community.', collected_amount: 0, target_amount: 0, cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop' }
];

const ALL_CATEGORIES = [
  { id: 1, name: { en: 'Cardiology', ar: 'أمراض القلب' }, slug: 'cardiology', article_count: 3 },
  { id: 2, name: { en: 'Pediatrics', ar: 'طب الأطفال' }, slug: 'pediatrics', article_count: 2 },
  { id: 3, name: { en: 'Nutrition', ar: 'التغذية' }, slug: 'nutrition', article_count: 2 },
  { id: 4, name: { en: 'Mental Health', ar: 'الصحة النفسية' }, slug: 'mental-health', article_count: 1 },
  { id: 5, name: { en: 'Emergency Medicine', ar: 'الطب الطارئ' }, slug: 'emergency-medicine', article_count: 2 },
  { id: 6, name: { en: 'Maternal Health', ar: 'صحة الأم' }, slug: 'maternal-health', article_count: 1 },
  { id: 7, name: { en: 'Diabetes', ar: 'السكري' }, slug: 'diabetes', article_count: 1 },
];

const ALL_TAGS = [
  { id: 1, name: { en: 'Heart Health', ar: 'صحة القلب' }, slug: 'heart-health', article_count: 3 },
  { id: 2, name: { en: 'Prevention', ar: 'الوقاية' }, slug: 'prevention', article_count: 5 },
  { id: 3, name: { en: 'Wellness', ar: 'العافية' }, slug: 'wellness', article_count: 4 },
  { id: 4, name: { en: 'Nutrition', ar: 'التغذية' }, slug: 'nutrition', article_count: 2 },
  { id: 5, name: { en: 'Mental Health', ar: 'الصحة النفسية' }, slug: 'mental-health', article_count: 1 },
  { id: 6, name: { en: 'COVID-19', ar: 'كوفيد-19' }, slug: 'covid-19', article_count: 2 },
  { id: 7, name: { en: 'Vaccines', ar: 'اللقاحات' }, slug: 'vaccines', article_count: 2 },
  { id: 8, name: { en: 'Pregnancy', ar: 'الحمل' }, slug: 'pregnancy', article_count: 1 },
  { id: 9, name: { en: 'Chronic Disease', ar: 'الأمراض المزمنة' }, slug: 'chronic-disease', article_count: 2 },
  { id: 10, name: { en: 'First Aid', ar: 'الإسعافات الأولية' }, slug: 'first-aid', article_count: 1 },
];

const AUTHORS = [
  { id: 1, name: 'Dr. Ahmed Hassan', avatar: null, specialization: 'Cardiology', bio: 'Senior Cardiologist with 15 years of experience in interventional cardiology. Dedicated to advancing cardiac care in Gaza through innovative treatments and patient education.' },
  { id: 2, name: 'Dr. Fatima Al-Zahroa', avatar: null, specialization: 'Pediatrics', bio: 'Pediatric specialist dedicated to child healthcare and nutrition. Passionate about preventive medicine and community health awareness programs for children.' },
  { id: 3, name: 'Dr. Omar Khalil', avatar: null, specialization: 'General Surgery', bio: 'General surgeon and emergency medicine expert with extensive experience in trauma care and surgical interventions in challenging environments.' },
  { id: 4, name: 'Dr. Samira Hamed', avatar: null, specialization: 'Obstetrics & Gynecology', bio: 'Obstetrician and gynecologist passionate about maternal health. Committed to providing safe childbirth experiences and comprehensive women healthcare services.' },
  { id: 5, name: 'Dr. Youssef Nasser', avatar: null, specialization: 'Cardiology', bio: 'Leading cardiologist introducing advanced cardiac care in Gaza. Published researcher in cardiovascular medicine and advocate for preventive heart health.' },
  { id: 6, name: 'Nour Salman', avatar: null, specialization: 'Clinical Nutrition', bio: 'Clinical dietitian and nutrition specialist focusing on therapeutic nutrition, community health education, and dietary interventions for chronic disease management.' },
];

const ALL_ARTICLES = [
  {
    id: 1,
    title: { en: 'Understanding Heart Disease: Prevention and Early Warning Signs', ar: 'فهم أمراض القلب: الوقاية وعلامات الإنذار المبكر' },
    excerpt: { en: 'Heart disease remains the leading cause of death worldwide. Learn about the risk factors, prevention strategies, and critical warning signs you should never ignore.', ar: 'لا تزال أمراض القلب السبب الرئيسي للوفاة في جميع أنحاء العالم. تعرف على عوامل الخطر واستراتيجيات الوقاية وعلامات التحذير الحرجة التي لا يجب تجاهلها أبداً.' },
    content: { en: 'Heart disease encompasses a range of conditions that affect your heart. Understanding the risk factors is the first step toward prevention. High blood pressure, high cholesterol, smoking, diabetes, and obesity are among the most common contributors. Regular exercise, a balanced diet rich in fruits and vegetables, maintaining a healthy weight, and avoiding tobacco can significantly reduce your risk. Early warning signs include chest discomfort, shortness of breath, pain in the neck or jaw, and irregular heartbeat. If you experience any of these symptoms, seek medical attention immediately.', ar: 'تشمل أمراض القلب مجموعة من الحالات التي تؤثر على قلبك. فهم عوامل الخطر هو الخطوة الأولى نحو الوقاية. ارتفاع ضغط الدم وارتفاع الكوليسترول والتدخين والسكري والسمنة من بين أكثر العوامل شيوعاً. ممارسة الرياضة بانتظام واتباع نظام غذائي متوازن غني بالفواكه والخضروات والحفاظ على وزن صحي وتجنب التبغ يمكن أن يقلل بشكل كبير من خطر الإصابة. تشمل علامات الإنذار المبكر عدم الراحة في الصدر وضيق التنفس والألم في الرقبة أو الفك وعدم انتظام ضربات القلب. إذا واجهت أياً من هذه الأعراض، فاطلب العناية الطبية فوراً.' },
    cover_image: ARTICLE_COVERS[0],
    views: 2840,
    comments_count: 24,
    published_at: '2026-06-10T08:00:00Z',
    status: 'published',
    is_featured: true,
    author: AUTHORS[0],
    category: ALL_CATEGORIES[0],
    tags: [ALL_TAGS[0], ALL_TAGS[1], ALL_TAGS[8]],
    images: [],
  },
  {
    id: 2,
    title: { en: 'Essential Nutrition Tips for a Healthy Ramadan', ar: 'نصائح غذائية أساسية لرمضان صحي' },
    excerpt: { en: 'Maintaining proper nutrition during Ramadan is crucial for energy and health. Discover expert tips for balanced suhoor and iftar meals that keep you nourished all day.', ar: 'الحفاظ على التغذية السليمة خلال رمضان أمر بالغ الأهمية للطاقة والصحة. اكتشف نصائح الخبراء لوجبات سحور وإفطار متوازنة تبقيك مغذى طوال اليوم.' },
    content: { en: 'Ramadan is a month of spiritual reflection and fasting, but it also presents unique nutritional challenges. A balanced diet during this holy month should include complex carbohydrates like whole grains and oats for sustained energy, protein-rich foods such as lean meats, eggs, and legumes, and plenty of fruits and vegetables for essential vitamins and minerals. Stay hydrated by drinking water between iftar and suhoor, and avoid excessive consumption of fried foods and sugary drinks that can lead to energy crashes and weight gain.', ar: 'رمضان شهر للتأمل الروحي والصيام، ولكنه يمثل أيضاً تحديات غذائية فريدة. يجب أن يشمل النظام الغذائي المتوازن خلال هذا الشهر المبارك الكربوهيدرات المعقدة مثل الحبوب الكاملة والشوفان للحصول على طاقة مستدامة، والأطعمة الغنية بالبروتين مثل اللحوم الخالية من الدهون والبيض والبقوليات، والكثير من الفواكه والخضروات للحصول على الفيتامينات والمعادن الأساسية. حافظ على ترطيب جسمك بشرب الماء بين الإفطار والسحور، وتجنب الإفراط في تناول الأطعمة المقلية والمشروبات السكرية التي قد تؤدي إلى انخفاض الطاقة وزيادة الوزن.' },
    cover_image: ARTICLE_COVERS[1],
    views: 1950,
    comments_count: 18,
    published_at: '2026-06-08T10:30:00Z',
    status: 'published',
    is_featured: true,
    author: AUTHORS[5],
    category: ALL_CATEGORIES[2],
    tags: [ALL_TAGS[3], ALL_TAGS[2]],
    images: [],
  },
  {
    id: 3,
    title: { en: 'Childhood Vaccinations: What Every Parent Should Know', ar: 'تطعيمات الأطفال: ما يجب أن يعرفه كل والد' },
    excerpt: { en: 'Vaccinations are one of the most effective ways to protect your child from serious diseases. Here is a comprehensive guide to the recommended immunization schedule.', ar: 'التطعيمات هي واحدة من أكثر الطرق فعالية لحماية طفلك من الأمراض الخطيرة. إليك دليل شامل لجدول التمنيع الموصى به.' },
    content: { en: 'Childhood vaccinations have been one of the greatest public health achievements of the 20th century. They protect children from a range of serious and potentially life-threatening diseases, including measles, polio, whooping cough, and hepatitis B. The recommended immunization schedule starts at birth and continues through adolescence. Vaccines work by stimulating the body\'s immune system to produce antibodies without causing the disease itself. While mild side effects like fever or soreness at the injection site are common, serious side effects are extremely rare.', ar: 'كانت تطعيمات الأطفال واحدة من أعظم إنجازات الصحة العامة في القرن العشرين. إنها تحمي الأطفال من مجموعة من الأمراض الخطيرة التي قد تهدد الحياة، بما في ذلك الحصبة وشلل الأطفال والسعال الديكي والتهاب الكبد B. يبدأ جدول التمنيع الموصى به من الولادة ويستمر حتى سن المراهقة. تعمل اللقاحات عن طريق تحفيز جهاز المناعة في الجسم لإنتاج الأجسام المضادة دون التسبب في المرض نفسه. في حين أن الآثار الجانبية الخفيفة مثل الحمى أو الألم في موقع الحقن شائعة، فإن الآثار الجانبية الخطيرة نادرة للغاية.' },
    cover_image: ARTICLE_COVERS[2],
    views: 3120,
    comments_count: 42,
    published_at: '2026-06-05T09:00:00Z',
    status: 'published',
    is_featured: true,
    author: AUTHORS[1],
    category: ALL_CATEGORIES[1],
    tags: [ALL_TAGS[6], ALL_TAGS[1]],
    images: [],
  },
  {
    id: 4,
    title: { en: 'Managing Diabetes in Gaza: Challenges and Hope', ar: 'إدارة مرض السكري في غزة: التحديات والأمل' },
    excerpt: { en: 'Living with diabetes in a resource-limited setting presents unique challenges. Learn how patients and healthcare providers are working together to manage this chronic condition.', ar: 'العيش مع مرض السكري في بيئة محدودة الموارد يمثل تحديات فريدة. تعرف على كيفية عمل المرضى ومقدمي الرعاية الصحية معاً لإدارة هذه الحالة المزمنة.' },
    content: { en: 'Diabetes management requires consistent access to medication, blood glucose monitoring supplies, and healthcare education. In Gaza, where resources can be scarce, patients face additional obstacles. However, community health programs and telemedicine initiatives are helping bridge the gap. Key management strategies include regular blood sugar monitoring, a balanced diet, physical activity, and medication adherence. Support groups and diabetes education programs have shown promising results in improving patient outcomes.', ar: 'تتطلب إدارة مرض السكري وصولاً مستمراً إلى الأدوية ومستلزمات مراقبة نسبة الجلوكوز في الدم والتثقيف الصحي. في غزة، حيث الموارد قد تكون شحيحة، يواجه المرضى عقبات إضافية. ومع ذلك، فإن برامج الصحة المجتمعية ومبادرات الطب عن بعد تساعد في سد هذه الفجوة. تشمل استراتيجيات الإدارة الرئيسية المراقبة المنتظمة لنسبة السكر في الدم واتباع نظام غذائي متوازن والنشاط البدني والالتزام بتناول الأدوية. أظهرت مجموعات الدعم وبرامج التثقيف حول مرض السكري نتائج واعدة في تحسين نتائج المرضى.' },
    cover_image: ARTICLE_COVERS[3],
    views: 1560,
    comments_count: 12,
    published_at: '2026-06-03T11:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[3],
    category: ALL_CATEGORIES[6],
    tags: [ALL_TAGS[8], ALL_TAGS[2]],
    images: [],
  },
  {
    id: 5,
    title: { en: 'Mental Health Awareness: Breaking the Stigma', ar: 'التوعية بالصحة النفسية: كسر الوصم' },
    excerpt: { en: 'Mental health is just as important as physical health. Explore how our community is working to break the stigma and provide support for those struggling with mental health issues.', ar: 'الصحة النفسية لا تقل أهمية عن الصحة الجسدية. اكتشف كيف يعمل مجتمعنا على كسر الوصم وتقديم الدعم لمن يعانون من مشاكل الصحة النفسية.' },
    content: { en: 'Mental health disorders affect millions of people worldwide, yet stigma and lack of awareness often prevent individuals from seeking help. In many communities, including Gaza, cultural taboos around mental health can lead to silence and suffering. Breaking this stigma begins with education and open conversation. Common conditions include depression, anxiety disorders, and post-traumatic stress disorder (PTSD), which is particularly prevalent in conflict-affected areas. Treatment options include therapy, medication, and community support programs. Seeking help is a sign of strength, not weakness.', ar: 'تؤثر اضطرابات الصحة النفسية على ملايين الأشخاص في جميع أنحاء العالم، ومع ذلك فإن الوصم ونقص الوعي غالباً ما يمنعان الأفراد من طلب المساعدة. في العديد من المجتمعات، بما في ذلك غزة، يمكن أن تؤدي المحرمات الثقافية حول الصحة النفسية إلى الصمت والمعاناة. يبدأ كسر هذا الوصم بالتثقيف والمحادثة المفتوحة. تشمل الحالات الشائعة الاكتئاب واضطرابات القلق واضطراب ما بعد الصدمة (PTSD)، والذي ينتشر بشكل خاص في المناطق المتأثرة بالنزاعات. تشمل خيارات العلاج العلاج النفسي والأدوية وبرامج الدعم المجتمعي. طلب المساعدة هو علامة قوة وليس ضعفاً.' },
    cover_image: ARTICLE_COVERS[4],
    views: 2280,
    comments_count: 35,
    published_at: '2026-06-01T07:00:00Z',
    status: 'published',
    is_featured: true,
    author: AUTHORS[2],
    category: ALL_CATEGORIES[3],
    tags: [ALL_TAGS[4], ALL_TAGS[2]],
    images: [],
  },
  {
    id: 6,
    title: { en: 'Emergency First Aid: Life-Saving Skills Everyone Should Know', ar: 'الإسعافات الأولية الطارئة: مهارات إنقاذ الحياة التي يجب أن يعرفها الجميع' },
    excerpt: { en: 'In emergency situations, knowing basic first aid can mean the difference between life and death. Learn essential techniques that can help you save lives in crisis situations.', ar: 'في حالات الطوارئ، يمكن أن تشكل معرفة الإسعافات الأولية الأساسية الفرق بين الحياة والموت. تعلم التقنيات الأساسية التي يمكن أن تساعدك في إنقاذ الأرواح في حالات الأزمات.' },
    content: { en: 'Basic first aid skills are invaluable, especially in regions affected by conflict and limited healthcare access. Key techniques include CPR (cardiopulmonary resuscitation), the Heimlich maneuver for choking, wound care and bleeding control, recognizing signs of stroke and heart attack, and managing fractures and burns. Organizations like the Red Cross and local healthcare providers offer training courses. Remember the ABCs of first aid: Airway, Breathing, and Circulation. Always call emergency services immediately while providing care.', ar: 'مهارات الإسعافات الأولية الأساسية لا تقدر بثمن، خاصة في المناطق المتأثرة بالنزاعات ومحدودية الوصول إلى الرعاية الصحية. تشمل التقنيات الرئيسية الإنعاش القلبي الرئوي (CPR) ومناورة هيمليك للاختناق والعناية بالجروح والسيطرة على النزيف والتعرف على علامات السكتة الدماغية والنوبة القلبية والتعامل مع الكسور والحروق. تقدم منظمات مثل الصليب الأحمر ومقدمو الرعاية الصحية المحليون دورات تدريبية. تذكر أساسيات الإسعافات الأولية: مجرى الهواء والتنفس والدورة الدموية. اتصل دائماً بخدمات الطوارئ فوراً أثناء تقديم الرعاية.' },
    cover_image: ARTICLE_COVERS[5],
    views: 1890,
    comments_count: 15,
    published_at: '2026-05-28T14:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[2],
    category: ALL_CATEGORIES[4],
    tags: [ALL_TAGS[9], ALL_TAGS[1]],
    images: [],
  },
  {
    id: 7,
    title: { en: 'Prenatal Care: A Complete Guide for Expecting Mothers', ar: 'الرعاية قبل الولادة: دليل شامل للأمهات الحوامل' },
    excerpt: { en: 'Proper prenatal care is essential for a healthy pregnancy and baby. This comprehensive guide covers nutrition, exercise, warning signs, and when to contact your healthcare provider.', ar: 'الرعاية المناسبة قبل الولادة ضرورية لحمل صحي وطفل سليم. يغطي هذا الدليل الشامل التغذية والتمارين الرياضية وعلامات التحذير ومتى يجب الاتصال بمقدم الرعاية الصحية الخاص بك.' },
    content: { en: 'Prenatal care plays a crucial role in ensuring both mother and baby remain healthy throughout pregnancy. Regular check-ups allow healthcare providers to monitor fetal development, screen for potential complications, and provide guidance on nutrition and lifestyle. Key aspects of prenatal care include taking folic acid supplements, maintaining a balanced diet rich in iron and calcium, staying physically active with safe exercises, avoiding harmful substances like alcohol and tobacco, and attending all scheduled appointments. Warning signs that require immediate attention include severe abdominal pain, heavy bleeding, persistent headaches, and reduced fetal movement.', ar: 'تلعب الرعاية قبل الولادة دوراً حاسماً في ضمان بقاء الأم والطفل بصحة جيدة طوال فترة الحمل. تسمح الفحوصات المنتظمة لمقدمي الرعاية الصحية بمراقبة نمو الجنين والكشف عن المضاعفات المحتملة وتقديم الإرشادات حول التغذية ونمط الحياة. تشمل الجوانب الرئيسية للرعاية قبل الولادة تناول مكملات حمض الفوليك والحفاظ على نظام غذائي متوازن غني بالحديد والكالسيوم والبقاء نشطة بدنياً مع تمارين آمنة وتجنب المواد الضارة مثل الكحول والتبغ وحضور جميع المواعيد المقررة. تشمل علامات التحذير التي تتطلب عناية فورية ألماً شديداً في البطن ونزيفاً حاداً وصداعاً مستمراً وانخفاض حركة الجنين.' },
    cover_image: ARTICLE_COVERS[6],
    views: 3450,
    comments_count: 51,
    published_at: '2026-05-25T06:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[3],
    category: ALL_CATEGORIES[5],
    tags: [ALL_TAGS[7], ALL_TAGS[2]],
    images: [],
  },
  {
    id: 8,
    title: { en: 'COVID-19 Update: New Variants and Vaccine Effectiveness', ar: 'تحديث كوفيد-19: السلالات الجديدة وفعالية اللقاح' },
    excerpt: { en: 'Stay informed about the latest COVID-19 developments, including emerging variants, vaccine effectiveness, and public health recommendations for the Gaza Strip.', ar: 'ابق على اطلاع بآخر تطورات كوفيد-19، بما في ذلك السلالات الناشئة وفعالية اللقاح والتوصيات الصحية العامة لقطاع غزة.' },
    content: { en: 'The COVID-19 pandemic continues to evolve with new variants emerging. Current vaccines remain effective against severe disease and hospitalization, though booster doses may be recommended for vulnerable populations. In Gaza, vaccination campaigns continue to increase coverage. Public health measures including mask-wearing in crowded indoor spaces, hand hygiene, and proper ventilation remain important prevention strategies. If you experience symptoms such as fever, cough, or loss of taste or smell, get tested and isolate until you receive your results.', ar: 'لا يزال جائحة كوفيد-19 يتطور مع ظهور سلالات جديدة. تظل اللقاحات الحالية فعالة ضد المرض الشديد والاستشفاء، على الرغم من أن الجرعات المعززة قد تكون موصى بها للفئات الضعيفة. في غزة، تستمر حملات التطعيم في زيادة التغطية. تظل تدابير الصحة العامة بما في ذلك ارتداء الكمامات في الأماكن المغلقة المزدحمة ونظافة اليدين والتهوية المناسبة استراتيجيات وقائية مهمة. إذا كنت تعاني من أعراض مثل الحمى أو السعال أو فقدان التذوق أو الشم، فقم بإجراء الفحص واعزل نفسك حتى تتلقى نتائجك.' },
    cover_image: ARTICLE_COVERS[7],
    views: 4120,
    comments_count: 67,
    published_at: '2026-05-20T12:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[0],
    category: ALL_CATEGORIES[0],
    tags: [ALL_TAGS[5], ALL_TAGS[6], ALL_TAGS[1]],
    images: [],
  },
  {
    id: 9,
    title: { en: 'Pediatric Nutrition: Building Healthy Eating Habits Early', ar: 'تغذية الأطفال: بناء عادات غذائية صحية مبكراً' },
    excerpt: { en: 'Good nutrition in childhood lays the foundation for a lifetime of health. Learn how to introduce balanced meals and develop healthy eating habits for your children.', ar: 'التغذية الجيدة في مرحلة الطفولة تضع الأساس لحياة مليئة بالصحة. تعلم كيفية تقديم وجبات متوازنة وتطوير عادات غذائية صحية لأطفالك.' },
    content: { en: 'Childhood nutrition is critical for growth, development, and long-term health. Establishing healthy eating habits early can prevent obesity, diabetes, and other chronic diseases later in life. Key principles include offering a variety of foods from all food groups, being a role model by eating healthy yourself, involving children in meal planning and preparation, limiting processed foods and sugary drinks, and making mealtimes a positive family experience. Remember that children may need multiple exposures to new foods before accepting them, so patience and persistence are important.', ar: 'تغذية الأطفال ضرورية للنمو والتطور والصحة على المدى الطويل. يمكن أن يمنع إنشاء عادات غذائية صحية مبكراً السمنة والسكري والأمراض المزمنة الأخرى في وقت لاحق من الحياة. تشمل المبادئ الرئيسية تقديم مجموعة متنوعة من الأطعمة من جميع المجموعات الغذائية، وكونك قدوة بتناول الطعام الصحي بنفسك، وإشراك الأطفال في تخطيط الوجبات وإعدادها، والحد من الأطعمة المصنعة والمشروبات السكرية، وجعل أوقات الوجبات تجربة عائلية إيجابية. تذكر أن الأطفال قد يحتاجون إلى تعرض متعدد للأطعمة الجديدة قبل قبولها، لذا فإن الصبر والمثابرة مهمان.' },
    cover_image: ARTICLE_COVERS[8],
    views: 1340,
    comments_count: 9,
    published_at: '2026-05-18T09:30:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[1],
    category: ALL_CATEGORIES[1],
    tags: [ALL_TAGS[3], ALL_TAGS[2]],
    images: [],
  },
  {
    id: 10,
    title: { en: 'Hypertension: The Silent Killer You Can Control', ar: 'ارتفاع ضغط الدم: القاتل الصامت الذي يمكنك السيطرة عليه' },
    excerpt: { en: 'High blood pressure often has no symptoms but can lead to serious health complications. Discover effective strategies to manage and prevent hypertension.', ar: 'ارتفاع ضغط الدم غالباً لا تظهر له أعراض ولكنه يمكن أن يؤدي إلى مضاعفات صحية خطيرة. اكتشف استراتيجيات فعالة للسيطرة على ارتفاع ضغط الدم والوقاية منه.' },
    content: { en: 'Hypertension, or high blood pressure, is often called the silent killer because it typically has no noticeable symptoms until serious damage has occurred. It is a major risk factor for heart disease, stroke, kidney disease, and other health problems. Regular blood pressure monitoring is essential, especially for adults over 40 and those with risk factors such as obesity, family history, or a sedentary lifestyle. Lifestyle modifications including reducing sodium intake, regular exercise, maintaining a healthy weight, limiting alcohol consumption, and stress management can help control blood pressure. In some cases, medication may be necessary.', ar: 'ارتفاع ضغط الدم، يسمى غالباً القاتل الصامت لأنه عادةً لا تظهر له أعراض ملحوظة حتى يحدث ضرر جسيم. وهو عامل خطر رئيسي لأمراض القلب والسكتة الدماغية وأمراض الكلى وغيرها من المشاكل الصحية. المراقبة المنتظمة لضغط الدم ضرورية، خاصة للبالغين فوق سن 40 ولأولئك الذين لديهم عوامل خطر مثل السمنة أو التاريخ العائلي أو نمط الحياة الخامل. يمكن أن تساعد تعديلات نمط الحياة بما في ذلك تقليل تناول الصوديوم وممارسة الرياضة بانتظام والحفاظ على وزن صحي والحد من استهلاك الكحول وإدارة الإجهاد في السيطرة على ضغط الدم. في بعض الحالات، قد تكون الأدوية ضرورية.' },
    cover_image: ARTICLE_COVERS[9],
    views: 2760,
    comments_count: 31,
    published_at: '2026-05-15T10:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[4],
    category: ALL_CATEGORIES[0],
    tags: [ALL_TAGS[0], ALL_TAGS[8], ALL_TAGS[1]],
    images: [],
  },
  {
    id: 11,
    title: { en: 'Telemedicine in Gaza: Connecting Patients with Doctors', ar: 'الطب عن بعد في غزة: ربط المرضى بالأطباء' },
    excerpt: { en: 'Telemedicine is transforming healthcare access in Gaza. Learn how virtual consultations are helping patients receive medical advice without traveling long distances.', ar: 'الطب عن بعد يحول الوصول إلى الرعاية الصحية في غزة. تعرف على كيفية مساعدة الاستشارات الافتراضية للمرضى في تلقي المشورة الطبية دون السفر لمسافات طويلة.' },
    content: { en: 'Telemedicine has emerged as a vital tool for expanding healthcare access in Gaza, where movement restrictions and limited facilities can make in-person visits challenging. Through video consultations, phone calls, and secure messaging, patients can connect with doctors for follow-up visits, medication management, and specialist consultations. This technology is particularly valuable for chronic disease management, mental health support, and reducing unnecessary emergency room visits. As internet connectivity improves, telemedicine is expected to play an increasingly important role in Gaza\'s healthcare system.', ar: 'برز الطب عن بعد كأداة حيوية لتوسيع الوصول إلى الرعاية الصحية في غزة، حيث يمكن لقيود الحركة ومحدودية المرافق أن تجعل الزيارات الشخصية صعبة. من خلال الاستشارات بالفيديو والمكالمات الهاتفية والرسائل الآمنة، يمكن للمرضى التواصل مع الأطباء لزيارات المتابعة وإدارة الأدوية والاستشارات المتخصصة. هذه التكنولوجيا ذات قيمة خاصة لإدارة الأمراض المزمنة ودعم الصحة النفسية وتقليل زيارات غرف الطوارئ غير الضرورية. مع تحسن الاتصال بالإنترنت، من المتوقع أن يلعب الطب عن بعد دوراً متزايد الأهمية في النظام الصحي في غزة.' },
    cover_image: ARTICLE_COVERS[10],
    views: 980,
    comments_count: 7,
    published_at: '2026-05-12T08:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[0],
    category: ALL_CATEGORIES[4],
    tags: [ALL_TAGS[2], ALL_TAGS[1]],
    images: [],
  },
  {
    id: 12,
    title: { en: 'Post-Surgery Recovery: A Guide for Patients and Families', ar: 'التعافي بعد الجراحة: دليل للمرضى والعائلات' },
    excerpt: { en: 'Proper post-operative care is essential for a smooth recovery. This guide covers wound care, pain management, activity restrictions, and when to call your doctor.', ar: 'الرعاية المناسبة بعد الجراحة ضرورية للتعافي السلس. يغطي هذا الدليل العناية بالجروح وإدارة الألم وقيود النشاط ومتى يجب الاتصال بطبيبك.' },
    content: { en: 'Recovery after surgery requires patience, proper care, and following your healthcare provider\'s instructions. Key aspects of post-operative care include keeping the surgical site clean and dry to prevent infection, taking prescribed medications as directed, gradually increasing activity levels as tolerated, and attending follow-up appointments. Signs of complications include increased pain, redness or swelling around the incision, fever, and unusual drainage. Family support plays a crucial role in recovery, from helping with daily tasks to providing emotional encouragement. Most importantly, listen to your body and don\'t rush the healing process.', ar: 'يتطلب التعافي بعد الجراحة الصبر والرعاية المناسبة واتباع تعليمات مقدم الرعاية الصحية الخاص بك. تشمل الجوانب الرئيسية للرعاية بعد الجراحة الحفاظ على موقع الجراحة نظيفاً وجافاً لمنع العدوى وتناول الأدوية الموصوفة حسب التوجيهات وزيادة مستويات النشاط تدريجياً حسب التحمل وحضور مواعيد المتابعة. تشمل علامات المضاعفات زيادة الألم أو الاحمرار أو التورم حول الشق والحمى والإفرازات غير المعتادة. يلعب دعم الأسرة دوراً حاسماً في التعافي، من المساعدة في المهام اليومية إلى تقديم التشجيع العاطفي. الأهم من ذلك، استمع إلى جسدك ولا تعجل بعملية الشفاء.' },
    cover_image: ARTICLE_COVERS[11],
    views: 1120,
    comments_count: 14,
    published_at: '2026-05-10T16:00:00Z',
    status: 'published',
    is_featured: false,
    author: AUTHORS[2],
    category: ALL_CATEGORIES[4],
    tags: [ALL_TAGS[2], ALL_TAGS[8]],
    images: [],
  },
];

const ARTICLES = ALL_ARTICLES.slice(0, 3).map(a => ({
  id: a.id,
  title: a.title.en,
  category: a.category.name.en,
  author_name: a.author.name,
  published_at: new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  views: a.views,
  tags: a.tags.map(t => ({ name: t.name.en, color: 'slate' })),
}));

const JOBS = [
  { id: 1, facility_name: 'Al-Awda Clinic Jabalia', facility_type: 'clinic', title: 'Emergency Registered Nurse', apply_method: 'email', apply_value: 'hr@alawda.org', end_date: '2026-07-01' },
  { id: 2, facility_name: 'European Gaza Hospital', facility_type: 'hospital', title: 'Pediatric Specialist', apply_method: 'link', apply_value: 'https://careers.egh.ps/apply/pediatrics', end_date: '2026-07-15' },
  { id: 4, facility_name: 'Al-Shifa Medical Complex', facility_type: 'hospital', title: 'Senior Trauma Surgeon', apply_method: 'link', apply_value: 'https://alshifa.ps/jobs/trauma-surgeon', end_date: '2026-08-01' }
];

const DOCTORS = [
  { id: 1, name: 'Dr. Ahmed Hassan', specialization: 'Emergency Medicine', experience: 12, fee: 50, rating: 4.9, profile_image: DOCTOR_PROFILE_IMAGES[0], facility_id: 7, department_ids: [1], bio: 'Highly experienced emergency medicine specialist with over 12 years of practice in critical care settings. Known for quick decision-making and compassionate patient care.' },
  { id: 2, name: 'Dr. Fatima Al-Zahroa', specialization: 'Pediatrics', experience: 8, fee: 40, rating: 4.8, profile_image: DOCTOR_PROFILE_IMAGES[1], facility_id: 6, department_ids: [2], bio: 'Dedicated pediatrician with 8 years of experience caring for children in Gaza. Specializes in treating common childhood illnesses and providing preventive care education.' },
  { id: 3, name: 'Dr. Omar Khalil', specialization: 'General Surgery', experience: 15, fee: 60, rating: 4.7, profile_image: DOCTOR_PROFILE_IMAGES[2], facility_id: 8, department_ids: [4], bio: 'Senior general surgeon with 15 years of experience performing a wide range of surgical procedures. Respected by peers and patients for his skill and dedication.' },
  { id: 4, name: 'Dr. Youssef Nasser', specialization: 'Cardiology', experience: 20, fee: 70, rating: 4.9, profile_image: DOCTOR_PROFILE_IMAGES[3], facility_id: 8, department_ids: [3], bio: 'Leading cardiologist with two decades of experience in diagnosing and treating heart conditions. Introduced advanced cardiac care protocols to Gaza healthcare system.' },
  { id: 5, name: 'Dr. Samira Hamed', specialization: 'Obstetrics & Gynecology', experience: 9, fee: 55, rating: 4.6, profile_image: DOCTOR_PROFILE_IMAGES[4], facility_id: 6, department_ids: [7], bio: 'Accomplished obstetrician and gynecologist passionate about maternal health. Has safely delivered thousands of babies in challenging conditions.' },
  { id: 6, name: 'Dr. Khalid Abu Amr', specialization: 'Orthopedics', experience: 14, fee: 45, rating: 4.7, profile_image: DOCTOR_PROFILE_IMAGES[5], facility_id: 7, department_ids: [5], bio: 'Skilled orthopedic surgeon specializing in trauma reconstruction and sports medicine. Committed to restoring mobility and improving quality of life.' },
];

const DOCTOR_FACILITIES = {
  1: [7, 6],
  2: [6],
  3: [8],
  4: [8, 7],
  5: [6],
  6: [7],
};

const FACILITY_STAFF_POSITIONS = {
  '1-7': 'Head of Emergency Medicine',
  '1-6': 'Consultant Emergency Physician',
  '2-6': 'Senior Pediatrician',
  '3-8': 'Chief of General Surgery',
  '4-8': 'Head of Cardiology',
  '4-7': 'Visiting Cardiologist',
  '5-6': 'Consultant Obstetrician & Gynecologist',
  '6-7': 'Senior Orthopedic Surgeon',
};

const ANNOUNCEMENTS = [
  { id: 1, title: 'Free Vaccination Campaign', content: 'Ministry of Health Gaza is running a free vaccination campaign across all clinics this week.', date: 'Jun 5, 2026' }
];


const FACILITY_FILES = [
  { id: 1, name: 'Operating License', type: 'license', file_url: '#', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 2, name: 'Ministry of Health Accreditation', type: 'certificate', file_url: '#', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 3, name: 'WHO Quality Standards', type: 'certificate', file_url: '#', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 4, name: 'Infection Control Certification', type: 'certificate', file_url: '#', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 5, name: 'Emergency Response License', type: 'license', file_url: '#', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
];

const DEPARTMENTS = [
  { id: 1, name: 'Emergency Department', description: '24/7 emergency care and trauma response for critical cases.', head: 'Dr. Ahmed Hassan' },
  { id: 2, name: 'Pediatrics', description: 'Comprehensive child healthcare from infancy through adolescence.', head: 'Dr. Fatima Al-Zahroa' },
  { id: 3, name: 'Cardiology', description: 'Advanced cardiac care including diagnostics, treatment, and rehabilitation.', head: 'Dr. Youssef Nasser' },
  { id: 4, name: 'General Surgery', description: 'Full-spectrum surgical services with modern operating theaters.', head: 'Dr. Omar Khalil' },
  { id: 5, name: 'Orthopedics', description: 'Bone, joint, and musculoskeletal treatment and surgery.', head: 'Dr. Khalid Abu Amr' },
  { id: 6, name: 'Internal Medicine', description: 'Diagnosis and non-surgical treatment of adult diseases.', head: null },
  { id: 7, name: 'Obstetrics & Gynecology', description: 'Maternal health, childbirth, and women\'s reproductive care.', head: 'Dr. Samira Hamed' },
  { id: 8, name: 'Radiology', description: 'Medical imaging services including X-ray, MRI, and CT scans.', head: null },
  { id: 9, name: 'Pharmacy', description: 'Medication dispensing and pharmaceutical care services.', head: null },
  { id: 10, name: 'Laboratory', description: 'Clinical diagnostics and medical laboratory testing.', head: null },
];

function enrichDoctors(docs) {
  return docs.map(d => {
    const facilityIds = DOCTOR_FACILITIES[d.id] || [d.facility_id];
    const facilities = facilityIds.map(id => {
      const f = FACILITIES.find(x => x.id === id);
      if (!f) return null;
      return { ...f, position: FACILITY_STAFF_POSITIONS[`${d.id}-${id}`] || 'Attending Physician' };
    }).filter(Boolean);
    const departments = (d.department_ids || []).map(id => DEPARTMENTS.find(dept => dept.id === id)).filter(Boolean);
    return {
      ...d,
      position: facilities[0]?.position || 'Attending Physician',
      facilities,
      primary_facility: facilities[0] || null,
      facilities_count: facilities.length,
      departments,
      bio: d.bio || (DOCTOR_DETAILS[d.id]?.about || ''),
    };
  });
}

const FACILITY_DETAILS = {
  6: {
    description: 'European Gaza Hospital is one of the largest medical facilities in the southern Gaza Strip, providing comprehensive healthcare services including emergency care, surgery, pediatrics, and maternity services. Equipped with modern medical technology and staffed by highly qualified professionals.',
    location: 'Khan Younis, Gaza Strip',
    phone: '+970 8 205 5000',
    email: 'info@egh.ps',
    website: 'https://egh.ps',
    images: FACILITY_IMAGES.slice(0, 4),
    facilityImages: FACILITY_IMAGES_META.slice(0, 4),
    doctors: enrichDoctors([DOCTORS[1], DOCTORS[4]]),
    departments: [DEPARTMENTS[0], DEPARTMENTS[1], DEPARTMENTS[5], DEPARTMENTS[6], DEPARTMENTS[7], DEPARTMENTS[8], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[1], FACILITY_FILES[3]],
    working_hours: { sat_thu: '8:00 AM - 8:00 PM', fri: 'Closed' },
    features: ['Emergency Department Open 24/7', 'Advanced Surgical Suites', 'Pediatric Intensive Care', 'Maternity Ward', 'Diagnostic Imaging Center'],
  },
  7: {
    description: 'Kamal Adwan Hospital serves the northern Gaza region with a full range of medical services. The hospital features advanced emergency departments, surgical wards, and specialized clinics for internal medicine and orthopedics.',
    location: 'Beit Lahia, Gaza Strip',
    phone: '+970 8 256 4000',
    email: 'contact@kamaladwan.ps',
    website: 'https://kamaladwan.ps',
    images: FACILITY_IMAGES.slice(1, 5),
    facilityImages: FACILITY_IMAGES_META.slice(1, 5),
    doctors: enrichDoctors([DOCTORS[0], DOCTORS[5]]),
    departments: [DEPARTMENTS[0], DEPARTMENTS[4], DEPARTMENTS[5], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[2]],
    working_hours: { sat_thu: '8:30 AM - 7:30 PM', fri: '9:00 AM - 1:00 PM' },
    features: ['Emergency Services', 'Orthopedic Surgery', 'Internal Medicine', 'Diagnostic Lab'],
  },
  8: {
    description: 'Al-Shifa Medical Complex is the largest medical facility in Gaza, offering specialized care across multiple departments. With a team of over 500 healthcare professionals, it serves as the primary referral hospital for the entire region.',
    location: 'Gaza City, Gaza Strip',
    phone: '+970 8 262 4000',
    email: 'info@alshifa.ps',
    website: 'https://alshifa.ps',
    images: FACILITY_IMAGES.slice(0, 5),
    facilityImages: FACILITY_IMAGES_META.slice(0, 5),
    doctors: enrichDoctors([DOCTORS[2], DOCTORS[3]]),
    departments: [DEPARTMENTS[0], DEPARTMENTS[2], DEPARTMENTS[3], DEPARTMENTS[5], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[1], FACILITY_FILES[2], FACILITY_FILES[4]],
    working_hours: { sat_thu: '7:00 AM - 10:00 PM', fri: '8:00 AM - 2:00 PM' },
    features: ['Comprehensive Emergency Care', 'Cardiac Catheterization Lab', 'Multi-Specialty Clinics', 'Advanced Imaging', 'Pharmacy Services'],
  },
  1: {
    description: 'Nasser Medical Point provides essential primary healthcare services to the local community, including general consultations, vaccinations, and basic emergency care.',
    location: 'Rafah, Gaza Strip',
    phone: '+970 8 242 1000',
    email: 'nasser.mp@moh.ps',
    website: null,
    images: FACILITY_IMAGES.slice(0, 3),
    facilityImages: FACILITY_IMAGES_META.slice(5, 8),
    doctors: [],
    departments: [DEPARTMENTS[5], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0]],
    working_hours: { sat_thu: '7:30 AM - 3:30 PM', fri: 'Closed' },
    features: ['General Consultations', 'Vaccination Services', 'Basic Emergency Care'],
  },
  2: {
    description: 'Al-Shifa Emergency Unit operates as a dedicated emergency response center, handling urgent medical cases and trauma care around the clock.',
    location: 'Gaza City, Gaza Strip',
    phone: '+970 8 262 4100',
    email: 'eru@alshifa.ps',
    website: null,
    images: FACILITY_IMAGES.slice(2, 5),
    facilityImages: FACILITY_IMAGES_META.slice(2, 5),
    doctors: [],
    departments: [DEPARTMENTS[0], DEPARTMENTS[7]],
    facilityFiles: [FACILITY_FILES[4]],
    working_hours: { sat_thu: '24 Hours', fri: '24 Hours' },
    features: ['24/7 Emergency Response', 'Trauma Care', 'Ambulance Services', 'Triage Center'],
  },
  3: {
    description: 'MSF Emergency Pharmacy provides essential medications and pharmaceutical services to the community, operated in partnership with Doctors Without Borders.',
    location: 'Deir al-Balah, Gaza Strip',
    phone: '+970 59 800 0001',
    email: 'pharmacy@msf.ps',
    website: null,
    images: [],
    facilityImages: [],
    doctors: [],
    departments: [DEPARTMENTS[8]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[3]],
    working_hours: { sat_thu: '8:00 AM - 6:00 PM', fri: 'Closed' },
    features: ['Medication Dispensing', 'Pharmaceutical Counseling', 'Emergency Medicine Supply'],
  },
  4: {
    description: 'Al-Awda Clinic Jabalia offers comprehensive outpatient services including general medicine, pediatrics, and preventive care to the Jabalia community.',
    location: 'Jabalia, Gaza Strip',
    phone: '+970 8 248 5000',
    email: 'clinic@alawda.org',
    website: 'https://alawda.org',
    images: FACILITY_IMAGES.slice(1, 4),
    facilityImages: FACILITY_IMAGES_META.slice(1, 4),
    doctors: [],
    departments: [DEPARTMENTS[1], DEPARTMENTS[5], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[1]],
    working_hours: { sat_thu: '8:00 AM - 4:00 PM', fri: '8:00 AM - 12:00 PM' },
    features: ['General Medicine', 'Pediatric Clinics', 'Preventive Care', 'Health Education'],
  },
  5: {
    description: 'UNRWA Health Center Rafah provides primary healthcare services to Palestinian refugees, including maternal health, immunization, and chronic disease management.',
    location: 'Rafah, Gaza Strip',
    phone: '+970 8 244 1000',
    email: 'rafah.hc@unrwa.org',
    website: 'https://unrwa.org',
    images: [],
    facilityImages: [],
    doctors: [],
    departments: [DEPARTMENTS[5], DEPARTMENTS[6], DEPARTMENTS[9]],
    facilityFiles: [FACILITY_FILES[0], FACILITY_FILES[2]],
    working_hours: { sat_thu: '7:30 AM - 2:30 PM', fri: 'Closed' },
    features: ['Maternal Health Services', 'Immunization Programs', 'Chronic Disease Management', 'Nutrition Counseling'],
  }
};

const REVIEW_NAMES = ['Ali Hamed', 'Sara Zaki', 'Omar Issa', 'Nour Salem', 'Hasan Ali', 'Layla Ibrahim', 'Khalid Abu Amr', 'Rania Saleh', 'Amir Zaki', 'Mona Youssef'];
const REVIEW_TEXTS = [
  'Excellent service and very professional staff. Highly recommended!',
  'The doctors were very attentive and the facilities are clean and well-equipped.',
  'Good experience overall, though waiting times could be improved.',
  'I received excellent care during my emergency visit. Thank you to the entire team.',
  'Very friendly staff and modern equipment. Made me feel comfortable throughout.',
  'The best healthcare experience I have had in Gaza. Truly world-class service.',
  'Professional medical team with great bedside manner. Would definitely visit again.',
  'Affordable and high-quality healthcare. The community is lucky to have this facility.',
  'Quick response and efficient treatment. Very grateful for their help.',
  'Knowledgeable doctors who take time to explain everything. Very reassuring.'
];

const DOCTOR_DETAILS = {
  1: {
    facility: FACILITIES[7],
    gallery: [],
    about: 'Dr. Ahmed Hassan is a highly experienced emergency medicine specialist with over 12 years of practice in critical care settings. He has trained at leading medical institutions and is known for his quick decision-making and compassionate patient care.',
    qualifications: ['MD - Emergency Medicine, Cairo University', 'Board Certified in Critical Care, Arab Board of Health Specializations', 'Advanced Trauma Life Support (ATLS) Instructor', 'Fellowship in Emergency Medical Services'],
  },
  2: {
    facility: FACILITIES[5],
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop',
    ],
    about: 'Dr. Fatima Al-Zahroa is a dedicated pediatrician with 8 years of experience caring for children in Gaza. She specializes in treating common childhood illnesses and providing preventive care education to parents.',
    qualifications: ['MBBS - Al-Quds University', 'Specialization in Pediatrics, Gaza European Hospital', 'Certified in Neonatal Resuscitation (NRP)', 'Member of Palestinian Pediatric Society'],
  },
  3: {
    facility: FACILITIES[7],
    gallery: [],
    about: 'Dr. Omar Khalil is a senior general surgeon with 15 years of experience performing a wide range of surgical procedures. He has successfully handled numerous complex cases and is respected by peers and patients alike.',
    qualifications: ['MD - General Surgery, Alexandria University', 'Fellowship in Laparoscopic Surgery', 'Board Certified in General Surgery', 'Advanced Surgical Techniques Certification'],
  },
  4: {
    facility: FACILITIES[7],
    gallery: [
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
    ],
    about: 'Dr. Youssef Nasser is a leading cardiologist with two decades of experience in diagnosing and treating heart conditions. He has introduced advanced cardiac care protocols to Gaza\'s healthcare system.',
    qualifications: ['MD - Cardiology, Cairo University', 'Fellowship in Interventional Cardiology', 'Board Certified in Cardiovascular Medicine', 'European Society of Cardiology Member', 'Published 15+ Research Papers in Cardiac Care'],
  },
  5: {
    facility: FACILITIES[5],
    gallery: [],
    about: 'Dr. Samira Hamed is an accomplished obstetrician and gynecologist with 9 years of experience. She is passionate about maternal health and has delivered thousands of babies safely in challenging conditions.',
    qualifications: ['MBBS - Islamic University of Gaza', 'Specialization in Obstetrics & Gynecology', 'Certified in Maternal-Fetal Medicine', 'Member of International Society of Obstetricians'],
  },
  6: {
    facility: FACILITIES[6],
    gallery: [],
    about: 'Dr. Khalid Abu Amr is a skilled orthopedic surgeon with 14 years of experience treating bone and joint conditions. He specializes in trauma reconstruction and sports medicine.',
    qualifications: ['MD - Orthopedic Surgery, Jordan University', 'Fellowship in Trauma Reconstruction', 'Board Certified in Orthopedics', 'Sports Medicine Certification (FIFA Medical Centre)'],
  }
};

const COMMENT_NAMES = ['Ali Hassan', 'Sara Mahmoud', 'Omar Issa', 'Nour Khalil', 'Hasan Ali', 'Layla Ibrahim', 'Khalid Zaki', 'Rania Saleh', 'Amir Youssef', 'Mona Salem', 'Tarek Hamed', 'Dina Abu Amr'];
const COMMENT_TEXTS = [
  'Very informative article! Thank you for sharing such valuable health information with our community.',
  'This is exactly what I needed to read. Clear explanations that are easy to understand.',
  'Great insights! I shared this with my family. Health awareness is so important.',
  'I wish there were more articles like this. So helpful for patients and families.',
  'Well researched and presented. The medical advice here is practical and actionable.',
  'Thank you for addressing this topic. It affects so many people in our community.',
  'Useful information presented in a simple way. Keep up the great work!',
  'My doctor recommended this article to me and it was very helpful.',
  'Excellent piece! Would love to see more content on this topic.',
  'This article gave me a better understanding of my condition. Thank you!',
  'Finally, reliable medical information in our language. Much appreciated.',
  'Very practical tips that I can actually apply. Thanks to the author.',
  'Important topic that everyone should read about. Well done!',
  'I appreciate the detailed explanations. Makes complex medical topics accessible.',
  'Sharing this with my support group. Very relevant and timely information.',
];

function generateArticleComments(articleId, count) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    article_id: articleId,
    user_name: COMMENT_NAMES[i % COMMENT_NAMES.length],
    user_avatar: null,
    content: COMMENT_TEXTS[i % COMMENT_TEXTS.length],
    created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }));
}

function generateReviews(count, source, sourceId, sourceLabel) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    user_name: REVIEW_NAMES[i % REVIEW_NAMES.length],
    user_avatar: null,
    rating: 4 + (i % 2 === 0 ? 1 : 0),
    comment: REVIEW_TEXTS[i % REVIEW_TEXTS.length],
    date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
    source,
    source_label: sourceLabel,
    source_id: sourceId,
  }));
}

const FEATURED_REVIEWS = [
  ...generateReviews(3, 'platform', null, 'Platform Review').map((r, i) => ({ ...r, id: i + 1, rating: 5 })),
  ...generateReviews(3, 'facility', 6, 'Facility Review').map((r, i) => ({ ...r, id: i + 4, rating: [4, 5, 4][i] })),
  ...generateReviews(3, 'doctor', 1, 'Doctor Review').map((r, i) => ({ ...r, id: i + 7, rating: 5 })),
];

export const mockPublicData = {
  stats: () => ({
    hospitals: FACILITIES.filter(f => f.facility_type === 'hospital').length,
    doctors: DOCTORS.length,
    pharmacies: FACILITIES.filter(f => f.facility_type === 'pharmacy').length,
    patients: 2500
  }),

  facilitiesMap: () =>
    FACILITIES.map(({ id, name, latitude, longitude, facility_type }) => ({
      id, name, latitude, longitude, facility_type
    })),

  facilitiesCountsByType: () => ({
    hospital: FACILITIES.filter(f => f.facility_type === 'hospital').length,
    clinic: FACILITIES.filter(f => f.facility_type === 'clinic').length,
    medical_point: FACILITIES.filter(f => f.facility_type === 'medical_point').length,
    pharmacy: FACILITIES.filter(f => f.facility_type === 'pharmacy').length
  }),

  facilitiesListing: (params = {}) => {
    let list = [...FACILITIES];
    const { type, q, city, page = 1, per_page = 6 } = params;

    if (type) {
      list = list.filter(f => f.facility_type === type);
    }

    if (city) {
      list = list.filter(f => f.city === city);
    }

    if (q) {
      const search = q.toLowerCase();
      list = list.filter(f => 
        f.name.toLowerCase().includes(search) || 
        f.organization_name.toLowerCase().includes(search)
      );
    }

    const total = list.length;
    const start = (page - 1) * per_page;
    const paginated = list.slice(start, start + per_page);

    return {
      data: paginated,
      meta: {
        current_page: parseInt(page),
        last_page: Math.ceil(total / per_page),
        per_page: parseInt(per_page),
        total
      }
    };
  },

  platformOverview: () => ({
    total_users: 2847,
    appointments_completed: 12540,
    articles_published: 48,
    active_stories: 12,
    total_donations: 186500
  }),

  facilitiesTop: (limit = 6) =>
    [...FACILITIES].sort((a, b) => b.rating - a.rating).slice(0, limit),

  storiesAll: () => STORIES,

  storiesLatest: (limit = 3) => STORIES.slice(0, limit),

  articlesLatest: (limit = 3) => ARTICLES.slice(0, limit),

  jobsLatest: (limit = 3) => JOBS.slice(0, limit),

  enrichDoctor: (doc) => {
    const facilityIds = DOCTOR_FACILITIES[doc.id] || [doc.facility_id];
    const facilities = facilityIds.map(id => FACILITIES.find(f => f.id === id)).filter(Boolean);
    const primaryFacility = facilities[0] || null;
    const departments = (doc.department_ids || []).map(id => DEPARTMENTS.find(d => d.id === id)).filter(Boolean);
    return {
      ...doc,
      facilities,
      primary_facility: primaryFacility,
      facilities_count: facilities.length,
      departments,
      bio: doc.bio || (DOCTOR_DETAILS[doc.id]?.about || ''),
    };
  },

  doctorsListing: (params = {}) => {
    let list = DOCTORS.map(d => mockPublicData.enrichDoctor(d));
    const { q, specialization, facility_type } = params;

    if (q) {
      const search = q.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.specialization.toLowerCase().includes(search) ||
        (d.bio || '').toLowerCase().includes(search)
      );
    }

    if (specialization) {
      list = list.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());
    }

    if (facility_type) {
      list = list.filter(d => d.facilities.some(f => f.facility_type === facility_type));
    }

    return { data: list, total: list.length };
  },

  doctorsTop: (limit = 4) => DOCTORS.slice(0, limit).map(d => mockPublicData.enrichDoctor(d)),

  doctorsAll: () => DOCTORS.map(d => mockPublicData.enrichDoctor(d)),

  announcementsActive: () => ANNOUNCEMENTS,

  facilityDetail: (id) => {
    const fac = FACILITIES.find(f => f.id === id);
    if (!fac) return null;
    const details = FACILITY_DETAILS[id] || {};
    return {
      ...fac,
      ...details,
      images: details.images || [],
      facilityImages: details.facilityImages || [],
      doctors: details.doctors || [],
      departments: details.departments || [],
      facilityFiles: details.facilityFiles || [],
      working_hours: details.working_hours || { sat_thu: '8:00 AM - 8:00 PM', fri: 'Closed' },
      features: details.features || [],
      reviews: generateReviews(8, 'facility', id, 'Facility Review'),
      review_stats: {
        average: (FACILITIES.find(f => f.id === id)?.rating || 0).toFixed(1),
        total: FACILITIES.find(f => f.id === id)?.review_count || 0,
        distribution: { 5: 45, 4: 30, 3: 15, 2: 8, 1: 2 },
      },
    };
  },

  doctorDetail: (id) => {
    const doc = DOCTORS.find(d => d.id === id);
    if (!doc) return null;
    const details = DOCTOR_DETAILS[id] || {};
    const facilityIds = DOCTOR_FACILITIES[id] || [doc.facility_id];
    const facilities = facilityIds.map(fid => {
      const f = FACILITIES.find(x => x.id === fid);
      if (!f) return null;
      const posKey = `${id}-${fid}`;
      return {
        ...f,
        position: FACILITY_STAFF_POSITIONS[posKey] || 'Attending Physician',
        departments: (doc.department_ids || []).map(did => DEPARTMENTS.find(d => d.id === did)).filter(Boolean),
      };
    }).filter(Boolean);
    const headFacilities = FACILITIES.filter(f => f.head_staff_id === id);
    return {
      ...doc,
      ...details,
      facilities,
      head_facilities: headFacilities,
      is_medical_director: headFacilities.length > 0,
      departments: (doc.department_ids || []).map(did => DEPARTMENTS.find(d => d.id === did)).filter(Boolean),
      reviews: generateReviews(10, 'doctor', id, 'Doctor Review'),
      related_doctors: DOCTORS
        .filter(d => d.id !== id && d.specialization === doc.specialization)
        .slice(0, 4)
        .map(d => ({
          ...d,
          about: (DOCTOR_DETAILS[d.id] || {}).about || '',
          position: FACILITY_STAFF_POSITIONS[`${d.id}-${d.facility_id}`] || 'Attending Physician',
        })),
    };
  },

  doctorsByFacility: (facilityId) =>
    DOCTORS.filter(d => d.facility_id === facilityId).map(d => ({
      ...d,
      about: (DOCTOR_DETAILS[d.id] || {}).about || '',
    })),

  featuredReviews: () => FEATURED_REVIEWS,

  platformStats: () => ({
    total_users: 2847,
    total_facilities: FACILITIES.length,
    total_doctors: DOCTORS.length,
    average_rating: (FACILITIES.reduce((s, f) => s + f.rating, 0) / FACILITIES.length).toFixed(1),
  }),

  // ── Articles Public ────────────────────────
  articlesAll: (params = {}) => {
    let result = ALL_ARTICLES.filter(a => a.status === 'published');
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(a =>
        a.title.en.toLowerCase().includes(q) ||
        a.title.ar.includes(q) ||
        a.excerpt.en.toLowerCase().includes(q)
      );
    }
    if (params.category) {
      result = result.filter(a => a.category.slug === params.category);
    }
    if (params.tag) {
      result = result.filter(a => a.tags.some(t => t.slug === params.tag));
    }
    if (params.sort === 'views') {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (params.sort === 'comments') {
      result = [...result].sort((a, b) => b.comments_count - a.comments_count);
    } else {
      result = [...result].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    }
    const perPage = params.per_page || 9;
    const page = params.page || 1;
    const total = result.length;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage;
    const to = Math.min(from + perPage, total);
    return {
      data: result.slice(from, to).map(a => ({...a})),
      meta: { current_page: page, last_page: lastPage, per_page: perPage, total, from: from + 1, to },
    };
  },

  articlesFeatured: (limit = 5) =>
    ALL_ARTICLES.filter(a => a.is_featured && a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, limit)
      .map(a => ({...a})),

  articlesPopular: (limit = 5) =>
    [...ALL_ARTICLES].filter(a => a.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map(a => ({...a})),

  articleDetail: (id) => {
    const idNum = Number(id);
    const article = ALL_ARTICLES.find(a => a.id === idNum);
    if (!article) return null;
    const contentStr = article.content?.en || article.content || '';
    const wordsPerMinute = 200;
    const wordCount = contentStr.split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    const comments = generateArticleComments(idNum, article.comments_count || 0);
    const commentsCount = comments.length;
    const related = ALL_ARTICLES
      .filter(a => a.id !== idNum && a.status === 'published' && (a.category.id === article.category.id || a.tags.some(t => article.tags.some(at => at.id === t.id))))
      .slice(0, 3)
      .map(a => ({...a, comments_count: undefined}));
    return { ...article, related_articles: related, comments, comments_count: commentsCount, reading_time_minutes: readingTimeMinutes };
  },

  categoriesAll: () => ALL_CATEGORIES.map(c => ({...c})),

  tagsAll: () => ALL_TAGS.map(t => ({...t})),
};
