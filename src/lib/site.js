/**
 * All editable copy and business details live here.
 * Replace the placeholder instructor, date, email and form endpoint before launch.
 */

export const SITE = {
  brand: 'Sargam',
  brandFull: 'Sargam Academy',
  email: 'hello@sargam.academy',
  location: 'Chandigarh · Online',
  // Used for the countdown. ISO string with the IST offset.
  cohortDate: '2026-12-06T18:30:00+05:30',
  cohortLabel: '6 December 2026, 6:30 pm IST',
  cohortShort: '6 Dec · 6:30 pm IST',
  seats: 18,
  weeks: 6,
  // Optional POST endpoint (Formspree, Basin, your own API). Leave empty for local demo mode.
  formEndpoint: '',
  // Optional intro reel. Drop a file in /public/media and point here to swap the placeholder.
  reelSrc: '',
};

export const NAV_LINKS = [
  { id: 'outcomes', label: 'The six' },
  { id: 'guitar', label: 'Guitar' },
  { id: 'sur-taal', label: 'Sur & Taal' },
  { id: 'stage', label: 'Stage' },
  { id: 'instructor', label: 'Instructor' },
  { id: 'faq', label: 'FAQ' },
];

export const HERO_LINES = [
  { text: 'Find the note', italic: false },
  { text: 'only you', italic: true },
  { text: 'can sing.', italic: false },
];

export const OUTCOMES = [
  {
    note: 'Sa',
    title: 'Sing in tune',
    body: 'Train your ear to hear the difference between almost and exactly.',
    detail: 'Weekly ear drills, drone practice, and a personal pitch map.',
  },
  {
    note: 'Re',
    title: 'Keep taal',
    body: 'Feel a sixteen-beat cycle without counting under your breath.',
    detail: 'Teental, keherwa and jhaptal by clapping, walking and singing.',
  },
  {
    note: 'Ga',
    title: 'Play harmonium',
    body: 'Find your note, accompany yourself, never chase a key again.',
    detail: 'Both hands, one drone, and the two chords that hold most songs.',
  },
  {
    note: 'Ma',
    title: 'Read sur',
    body: 'Turn sargam into a language you can write, transpose and teach.',
    detail: 'Notation, scales, and the grammar behind a simple bandish.',
  },
  {
    note: 'Pa',
    title: 'Hold the stage',
    body: 'Breath, presence, and the first thirty seconds of performance.',
    detail: 'Mic technique, stage mapping, and a real audience on week six.',
  },
  {
    note: 'Dha',
    title: 'Find your voice',
    body: 'Leave with two bandish, a ghazal, and one song that is entirely yours.',
    detail: 'A recorded (only with consent) final baithak and a practice plan.',
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
  name: 'Meera Kaur',
  role: 'Hindustani vocalist · harmonium · educator',
  quote:
    'I still get nervous before a baithak. The work is not to remove the fear — it is to give it a rhythm.',
  bio: 'Fourteen years of teaching in Chandigarh, a khayal gharana grounding, and a stubborn belief that nobody is tone deaf. Meera has taken over 600 beginners from "I can\'t sing" to their first stage.',
  stats: [
    { value: '14', label: 'years teaching' },
    { value: '600+', label: 'beginners taught' },
    { value: '40', label: 'student baithaks' },
  ],
};

export const FAQS = [
  {
    q: 'I have never sung before. Is this too advanced?',
    a: 'No. The cohort is built for absolute beginners and for people returning after years away. Week one starts with one note, a drone and a breath. If you can speak, you can start.',
  },
  {
    q: 'Do I need to read music?',
    a: 'Not at all. You will learn to read basic sargam notation by the end, but every exercise is taught by ear first. No prior theory is assumed.',
  },
  {
    q: 'Is my voice recorded during the mic demo?',
    a: 'No. The demo uses your microphone only inside your browser to draw the visual. Audio is never recorded, stored, or uploaded. There is no server involved. You can stop it at any time and the mic track is released.',
  },
  {
    q: 'Online or in Chandigarh?',
    a: 'Both. Live sessions run twice a week in Chandigarh and are streamed for the online cohort. Recordings stay available for four weeks, so a missed session is not a missed week.',
  },
  {
    q: 'I freeze when people watch me. Will this help?',
    a: 'That is the section we care most about. Weeks three to six include low-stakes performance practice, a spotlight session, and a final baithak in front of a small invited audience. You can opt out of the final stage and still complete the cohort.',
  },
  {
    q: 'What does it cost, and what is the refund policy?',
    a: 'The winter cohort is ₹8,400 for six weeks, including the workbook, practice tracks and the final baithak. Full refund until seven days before the first session; after that, one session can be transferred to a future cohort. Ask us about the two scholarship seats.',
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
