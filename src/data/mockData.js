// Seed data for StudentOS - Thapar branding
export const INITIAL_PROFESSORS = [
  {
    id: 'prof-1',
    name: 'Dr. Rajiv Kumar',
    department: 'Computer Science & Engineering',
    rating: 4.5,
    teachingQuality: 4.8,
    gradingLeniency: 2.0, // 1 = harsh grading, 5 = very lenient
    accessibility: 4.5,
    attendanceStrictness: 4.8, // 1 = chill/no attendance, 5 = strict 75% check-in
    reviewsCount: 2,
    reviews: [
      {
        id: 'r-1',
        userId: 'student-2',
        rating: 5,
        teachingQuality: 5,
        gradingLeniency: 2,
        accessibility: 5,
        attendanceStrictness: 5,
        comment: 'Amazing teaching style. Explains DSA concepts in depth. Does not compromise on attendance though, so don\'t bunk.',
        created_at: '2026-08-15'
      },
      {
        id: 'r-2',
        userId: 'student-3',
        rating: 4,
        teachingQuality: 4,
        gradingLeniency: 2,
        accessibility: 4,
        attendanceStrictness: 4,
        comment: 'Very accessible during lab sessions. Grading is fair if you study, but he is regular with checking sheets.',
        created_at: '2026-08-10'
      }
    ]
  },
  {
    id: 'prof-2',
    name: 'Dr. Seema Bawa',
    department: 'Computer Science & Engineering',
    rating: 4.2,
    teachingQuality: 4.5,
    gradingLeniency: 2.0,
    accessibility: 4.0,
    attendanceStrictness: 4.5,
    reviewsCount: 1,
    reviews: [
      {
        id: 'r-3',
        userId: 'student-2',
        rating: 4,
        teachingQuality: 5,
        gradingLeniency: 2,
        accessibility: 4,
        attendanceStrictness: 4,
        comment: 'Super intelligent and very thorough. Exams can be challenging, so be regular. Pay attention in lectures.',
        created_at: '2026-08-18'
      }
    ]
  },
  {
    id: 'prof-3',
    name: 'Dr. Rajesh Khanna',
    department: 'Electronics & Communication',
    rating: 4.5,
    teachingQuality: 4.0,
    gradingLeniency: 4.0,
    accessibility: 5.0,
    attendanceStrictness: 3.0,
    reviewsCount: 1,
    reviews: [
      {
        id: 'r-4',
        userId: 'student-4',
        rating: 5,
        teachingQuality: 4,
        gradingLeniency: 4,
        accessibility: 5,
        attendanceStrictness: 3,
        comment: 'Loves teaching and has great industry insights. Very approachable after lectures and helps during MSTs.',
        created_at: '2026-08-01'
      }
    ]
  }
];

export const INITIAL_YOUTUBE_CHANNELS = [
  {
    id: 'yt-1',
    channelName: 'Gate Smashers',
    creator: 'Varun Singla',
    subject: 'Computer Science Subjects (OS, DBMS, CN)',
    rating: 4.9,
    url: 'https://youtube.com/c/GateSmashers',
    votes: 42,
    reviews: [
      { id: 'yr-1', userId: 'student-2', comment: 'Life saver for MSTs and ESTs! Concepts are compressed and taught in Hindi/English.', rating: 5 }
    ]
  },
  {
    id: 'yt-2',
    channelName: 'Jenny\'s Lectures',
    creator: 'Jenny',
    subject: 'Data Structures & Algorithms, C/C++',
    rating: 4.8,
    url: 'https://youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8JH',
    votes: 31,
    reviews: [
      { id: 'yr-2', userId: 'student-3', comment: 'Her explanation of pointer arithmetic and trees is legendary.', rating: 5 }
    ]
  }
];

export const INITIAL_STUDY_RESOURCES = [
  {
    id: 'res-1',
    title: 'UMA003 Mathematics-I Handwritten MST Notes',
    subject: 'UMA003 (Mathematics-I)',
    type: 'notes',
    url: '#',
    rating: 4.6,
    downloads: 154,
    uploadedBy: 'Anonymous Peer',
    comments: 5
  },
  {
    id: 'res-2',
    title: 'UES009 Mechanics EST 2024 Question Paper',
    subject: 'UES009 (Mechanics)',
    type: 'pyq',
    url: '#',
    rating: 4.8,
    downloads: 289,
    uploadedBy: 'Thapar Alumni',
    comments: 2
  }
];

export const INITIAL_CAMPUS_SPOTS = [
  {
    id: 'spot-1',
    name: 'Jaggi Fountain Plaza',
    category: 'food', // food, study, chill
    description: 'The social hub of Thapar. Incredible variety of street food, cafes, and open seating.',
    rating: 4.5,
    studyable: 1.5,      // 1-5 rating scale
    couples: 4.5,        // 1-5 couples presence
    food: 5.0,           // 1-5 food availability
    hangout: 5.0,        // 1-5 hangout factor
    strictness: 2.0,     // 1-5 security presence
    isolation: 1.0,      // 1-5 quiet isolation
    reviewsCount: 2,
    reviews: [
      {
        id: 'sr-1',
        userId: 'student-2',
        rating: 5,
        studyable: 1,
        couples: 5,
        food: 5,
        hangout: 5,
        strictness: 1,
        isolation: 1,
        comment: 'Great place to grab food. Samosas at Jaggi are a must! Perfect for hanging out with friends, but definitely not for studying.'
      },
      {
        id: 'sr-2',
        userId: 'student-3',
        rating: 4,
        studyable: 2,
        couples: 4,
        food: 5,
        hangout: 5,
        strictness: 3,
        isolation: 1,
        comment: 'Crowded in the evenings, but perfect for hangout. Can find some security guards checking IDs during late hours.'
      }
    ]
  },
  {
    id: 'spot-2',
    name: 'Central Library (LTS)',
    category: 'study',
    description: 'Nava Nalanda Library / Learning Center. Ultra-quiet zones, study cubicles, and full AC.',
    rating: 4.7,
    studyable: 5.0,
    couples: 1.5,
    food: 1.0,
    hangout: 2.0,
    strictness: 4.8,
    isolation: 4.0,
    reviewsCount: 1,
    reviews: [
      {
        id: 'sr-3',
        userId: 'student-2',
        rating: 5,
        studyable: 5,
        couples: 1,
        food: 1,
        hangout: 2,
        strictness: 5,
        isolation: 4,
        comment: 'Top-tier atmosphere for exam prep. Very quiet and comfortable. Guard will kick you out if you eat inside.'
      }
    ]
  },
  {
    id: 'spot-3',
    name: 'Nirvana Cafeteria (Cosmos)',
    category: 'chill',
    description: 'Cafeteria next to Hostels. Good coffee, pool tables, and indoor seating.',
    rating: 4.2,
    studyable: 3.0,
    couples: 3.5,
    food: 4.0,
    hangout: 4.5,
    strictness: 2.0,
    isolation: 2.5,
    reviewsCount: 1,
    reviews: [
      {
        id: 'sr-4',
        userId: 'student-4',
        rating: 4,
        studyable: 3,
        couples: 3,
        food: 4,
        hangout: 4,
        strictness: 2,
        isolation: 3,
        comment: 'AC is chilling, and the sandwiches are decent. Quiet enough during mornings to study, but fills up with pool players later.'
      }
    ]
  }
];

export const INITIAL_SUBJECTS = [
  { id: 'sub-1', name: 'UCS411: Artificial Intelligence', attended: 21, held: 24, targetPct: 75, credits: 4 },
  { id: 'sub-2', name: 'UCS412: Software Engineering', attended: 18, held: 22, targetPct: 75, credits: 3 },
  { id: 'sub-3', name: 'UCS413: Computer Networks', attended: 15, held: 20, targetPct: 75, credits: 4 }
];

export const INITIAL_TIMETABLE = {
  Monday: [
    { id: 't-1', subject: 'UCS411: AI', time: '09:00 AM - 10:00 AM', room: 'LT-102', type: 'Lecture' },
    { id: 't-2', subject: 'UCS413: CN', time: '11:00 AM - 12:00 PM', room: 'LT-103', type: 'Lecture' }
  ],
  Tuesday: [
    { id: 't-4', subject: 'UCS412: SE', time: '10:00 AM - 11:00 AM', room: 'LT-201', type: 'Lecture' }
  ],
  Wednesday: [
    { id: 't-6', subject: 'UCS411: AI', time: '09:00 AM - 10:00 AM', room: 'LT-102', type: 'Lecture' },
    { id: 't-7', subject: 'UCS413: CN', time: '11:00 AM - 12:00 PM', room: 'LT-103', type: 'Lecture' }
  ],
  Thursday: [
    { id: 't-8', subject: 'UCS412: SE', time: '10:00 AM - 11:00 AM', room: 'LT-201', type: 'Lecture' }
  ],
  Friday: [
    { id: 't-11', subject: 'UCS411: AI', time: '09:00 AM - 10:00 AM', room: 'LT-102', type: 'Lecture' },
    { id: 't-12', subject: 'UCS413: CN', time: '11:00 AM - 12:00 PM', room: 'LT-103', type: 'Lecture' }
  ],
  Saturday: [],
  Sunday: []
};

export const INITIAL_DEADLINES = [
  { id: 'd-1', title: 'AI MST Assignment 1', subject: 'UCS411: AI', due: '2026-08-28T23:59', priority: 'high', status: 'pending' },
  { id: 'd-2', title: 'Software Engineering Project Proposal', subject: 'UCS412: SE', due: '2026-09-02T12:00', priority: 'medium', status: 'pending' }
];

export const INITIAL_CGPA = {
  previousGpa: 8.24,
  previousCredits: 62,
  targetGpa: 8.5
};
