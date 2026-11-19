/**
 * All editable copy and business details live here.
 *
 * Amar Music Academy — working draft built from the academy profile
 * (updated 18 November 2026). Items marked "confirm" in that document are
 * kept deliberately general here; see README.md before publishing.
 */

export const SITE = {
  brand: 'Amar Music',
  brandShort: 'Amar',
  brandFull: 'Amar Music Academy',
  brandLine: 'We Create Performers',
  email: 'amarmusicacademyludhiana@gmail.com',
  emailAlt: 'dr.amarsuri@gmail.com',
  phone: '+91 96534 15700',
  phoneHref: '+919653415700',
  phoneAlt: '+91 70090 24875',
  phoneAltHref: '+917009024875',
  location: 'Ishar Nagar, Ludhiana · Online',
  locality: 'Ludhiana',
  region: 'Punjab',
  address: 'Ishar Nagar, near the rear side of GNE College, Gill Road, Ludhiana, Punjab, India',
  founded: 2013,
  // The academy's live registration form (Google Forms).
  registrationUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSeFXBbDfuuRB3bx5bFq8AMNwUFhYRB7nnRMZrI0iYbV-wLAXQ/viewform',
  demo: {
    free: true,
    duration: '15–30 minutes',
  },
  fees: {
    group: [3000, 4000, 5000],
    classesPerWeek: 2,
    classesPerMonth: 8,
  },
  // Optional intro reel. Drop a file in /public/media and point here to swap the placeholder.
  reelSrc: '',
};

export const NAV_LINKS = [
  { id: 'outcomes', label: 'Courses' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'sur-taal', label: 'Sur & Taal' },
  { id: 'stage', label: 'Stage' },
  { id: 'instructor', label: 'Founder' },
  { id: 'faq', label: 'FAQ' },
];

export const HERO_LINES = [
  { text: 'We create', italic: false },
  { text: 'performers.', italic: true },
];

export const OUTCOMES = [
  {
    note: 'Sa',
    title: 'Vocal / Singing',
    body: 'Pitch, breath, voice culture and simple songs.',
    detail: 'Beginner to advanced: alankars, raga work, taan, expression and stage repertoire.',
  },
  {
    note: 'Re',
    title: 'Guitar',
    body: 'Chords, rhythm, posture and first songs.',
    detail: 'Chord transitions, scales, lead work and accompaniment, from beginner to advanced.',
  },
  {
    note: 'Ga',
    title: 'Harmonium & Keyboard',
    body: 'Find your note, accompany yourself, never chase a key again.',
    detail: 'Fingering, scales, raga and song accompaniment, improvisation and performance.',
  },
  {
    note: 'Ma',
    title: 'Tabla',
    body: 'Bols, hand technique, theka and timing.',
    detail: 'Common talas, kayda, relas, laya control and advanced performance compositions.',
  },
  {
    note: 'Pa',
    title: 'Gurbani / Shabad Kirtan',
    body: 'Sur, pronunciation and simple shabad practice.',
    detail: 'Raag-oriented learning, taal, accompaniment and expanded shabad repertoire.',
  },
  {
    note: 'Dha',
    title: 'Folk · Film · Ghazal · Qawwali',
    body: 'Punjabi folk, Bollywood, ghazal and qawwali.',
    detail: 'Style, expression, ornamentation, interpretation and stage presentation.',
  },
];

export const GUITAR_STRINGS = [
  { note: 'E', octave: 2, freq: 82.41, label: 'Low E', sargam: 'Pa', thickness: 3.4 },
  { note: 'A', octave: 2, freq: 110.0, label: 'A', sargam: 'Re', thickness: 2.9 },
  { note: 'D', octave: 3, freq: 146.83, label: 'D', sargam: 'Ga', thickness: 2.4 },
  { note: 'G', octave: 3, freq: 196.0, label: 'G', sargam: 'Pa', thickness: 2.0 },
  { note: 'B', octave: 3, freq: 246.94, label: 'B', sargam: 'Ni', thickness: 1.6 },
  { note: 'E', octave: 4, freq: 329.63, label: 'High E', sargam: 'Ga', thickness: 1.2 },
];

export const STAGE_TIPS = [
  { n: '01', title: 'Breathe lower than feels natural', body: 'Fear lives high in the chest. Give it somewhere to go.' },
  { n: '02', title: 'Sing to one person', body: 'Find a single face in the room. The rest of the audience will follow.' },
  { n: '03', title: 'Let the first note be quiet', body: 'You do not have to arrive at full volume. Arrive at the truth.' },
];

export const INSTRUCTOR = {
  name: 'Amarjeet Singh Suri',
  firstName: 'Amarjeet',
  role: 'Founder · Music educator',
  roles: ['Music educator', 'Vocalist', 'Composer', 'Voice-over & dubbing artist', 'Actor'],
  bio: 'Amarjeet Singh Suri is a music educator and performing artist with more than fifteen years of teaching experience. He holds a Master’s degree in Music (Vocal / Classical) from SGGS Khalsa College, Mahilpur, affiliated with Panjab University, and a Bachelor’s degree in Music (Instrumental & Vocal) from USOL, Panjab University. His teaching spans Indian classical and light music, Punjabi folk, Gurbani and Shabad Kirtan, Bollywood, ghazal and qawwali. His professional work includes announcing for AIR FM Gold, Ludhiana, Punjabi news reading for Doordarshan Kendra, Jalandhar, voice-over and dubbing for Punjabi campaigns and audiobooks, studio production, and screen work in Sardar Udham, Fateh and The Diplomat, with television appearances on Colors and Zee Punjabi.',
  stats: [
    { value: '15+', label: 'years teaching' },
    { value: '2013', label: 'academy founded' },
    { value: '6', label: 'course streams' },
  ],
  gallery: [
    {
      src: '/media/founder-riyaz.jpg',
      label: 'Riyaz',
      alt: 'Amarjeet Singh Suri playing a stringed instrument during practice.',
    },
    {
      src: '/media/founder-studio.jpg',
      label: 'Studio',
      alt: 'Amarjeet Singh Suri at the studio microphone.',
    },
    {
      src: '/media/founder-stage.jpg',
      label: 'Stage',
      alt: 'Amarjeet Singh Suri performing on stage with a microphone.',
    },
  ],
};

export const FAQS = [
  {
    q: 'I have never trained before. Can I start?',
    a: 'Yes. Courses are built for beginners and for people returning after years away. Beginner streams start with posture, breath, pitch and a simple song — no prior theory is assumed.',
  },
  {
    q: 'What can I learn at the academy?',
    a: 'Vocal and instrumental courses include singing, guitar, harmonium and keyboard, tabla, Gurbani and Shabad Kirtan, and Punjabi folk, Bollywood, ghazal and qawwali. Current availability of each course is confirmed when you enquire.',
  },
  {
    q: 'Online or in Ludhiana?',
    a: 'Both, according to current availability. The academy is in Ishar Nagar, near the rear side of GNE College, Gill Road, Ludhiana, and online classes are available for students elsewhere.',
  },
  {
    q: 'Is the demo class really free?',
    a: 'Yes. The demo class is free and runs 15–30 minutes, including a short introduction and assessment. Book it through the registration form; the academy confirms the date and time according to availability.',
  },
  {
    q: 'What do classes cost?',
    a: 'Indicative monthly group fees are ₹3,000 for beginner, ₹4,000 for intermediate and ₹5,000 for advanced, for two classes a week (about eight a month). Individual class fees are quoted on enquiry. Fees and batch details are confirmed before you enrol.',
  },
  {
    q: 'Is my voice recorded during the mic demo?',
    a: 'No. The demo uses your microphone only inside your browser to draw the visual. Audio is never recorded, stored, or uploaded. There is no server involved. You can stop it at any time and the mic track is released.',
  },
  {
    q: 'Who teaches?',
    a: 'The academy is founder-led. Amarjeet Singh Suri is a music educator and performing artist with more than fifteen years of teaching experience, a Master’s degree in Music (Vocal / Classical) and a Bachelor’s degree in Music (Instrumental & Vocal).',
  },
  {
    q: 'How do I register?',
    a: 'Use the registration form linked on this page. It opens in a new tab, and the academy replies with a demo slot, the right course stream and the current fee sheet.',
  },
];

export const TAAL_INFO = {
  name: 'Teental',
  beats: 16,
  groups: [4, 4, 4, 4],
  khali: 9,
  sam: 1,
  description:
    'The most common sixteen-beat cycle in Hindustani music. Four bars of four. Beat one is sam, the home. Beat nine is khali, the open hand — the same cycle, heard from the other side.',
  bols: ['dha', 'dhin', 'dhin', 'dha', 'dha', 'dhin', 'dhin', 'dha', 'dha', 'tin', 'tin', 'ta', 'ta', 'dhin', 'dhin', 'dha'],
  tali: [1, 5, 13],
};
