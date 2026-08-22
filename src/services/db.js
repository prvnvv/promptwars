import {
  INITIAL_PROFESSORS,
  INITIAL_YOUTUBE_CHANNELS,
  INITIAL_STUDY_RESOURCES,
  INITIAL_CAMPUS_SPOTS,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_DEADLINES,
  INITIAL_CGPA
} from '../data/mockData';

// Helper to get from localstorage with fallback
function getStorageItem(key, fallback) {
  const item = localStorage.getItem(`studentos_${key}`);
  if (!item) {
    localStorage.setItem(`studentos_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
}

function setStorageItem(key, data) {
  localStorage.setItem(`studentos_${key}`, JSON.stringify(data));
}

export const db = {
  // Google Sign-In Simulation
  getCurrentUser: () => {
    const user = localStorage.getItem('studentos_user');
    return user ? JSON.parse(user) : null;
  },
  
  signInWithGoogle: (email) => {
    if (!email.endsWith('@thapar.edu')) {
      return { success: false, message: 'Please use your official Thapar University email account (@thapar.edu)' };
    }
    const name = email.split('@')[0].replace('.', ' ').replace(/\d+/g, '');
    const user = {
      id: `student-${Date.now()}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
    };
    localStorage.setItem('studentos_user', JSON.stringify(user));
    return { success: true, user };
  },

  signOut: () => {
    localStorage.removeItem('studentos_user');
  },

  // Professors
  getProfessors: () => getStorageItem('professors', INITIAL_PROFESSORS),
  saveProfessors: (data) => setStorageItem('professors', data),
  addProfessor: (prof) => {
    const profs = db.getProfessors();
    const newProf = {
      id: `prof-${Date.now()}`,
      reviewsCount: 0,
      reviews: [],
      rating: 0,
      teachingQuality: 0,
      gradingLeniency: 0,
      accessibility: 0,
      attendanceStrictness: 0,
      ...prof
    };
    profs.push(newProf);
    db.saveProfessors(profs);
    return newProf;
  },
  addProfessorReview: (profId, review) => {
    const profs = db.getProfessors();
    const idx = profs.findIndex(p => p.id === profId);
    if (idx !== -1) {
      const user = db.getCurrentUser();
      if (!user) return { success: false, message: 'Please sign in first!' };

      // Check duplicate review
      const alreadyReviewed = profs[idx].reviews.some(r => r.userId === user.id);
      if (alreadyReviewed) {
        return { success: false, message: 'You have already reviewed this professor. Only one review per student is allowed to prevent bias.' };
      }

      const newReview = {
        id: `r-${Date.now()}`,
        userId: user.id,
        created_at: new Date().toISOString().split('T')[0],
        ...review
      };

      profs[idx].reviews = [newReview, ...profs[idx].reviews];
      profs[idx].reviewsCount = profs[idx].reviews.length;
      
      // Recalculate parameters
      const reviews = profs[idx].reviews;
      const count = reviews.length;

      const totalTQ = reviews.reduce((sum, r) => sum + r.teachingQuality, 0);
      const totalGL = reviews.reduce((sum, r) => sum + r.gradingLeniency, 0);
      const totalAcc = reviews.reduce((sum, r) => sum + r.accessibility, 0);
      const totalAS = reviews.reduce((sum, r) => sum + r.attendanceStrictness, 0);
      
      profs[idx].teachingQuality = Number((totalTQ / count).toFixed(1));
      profs[idx].gradingLeniency = Number((totalGL / count).toFixed(1));
      profs[idx].accessibility = Number((totalAcc / count).toFixed(1));
      profs[idx].attendanceStrictness = Number((totalAS / count).toFixed(1));
      
      // Overall rating is average of the core dimensions
      profs[idx].rating = Number(((profs[idx].teachingQuality + profs[idx].gradingLeniency + profs[idx].accessibility) / 3).toFixed(1));
      
      db.saveProfessors(profs);
      return { success: true };
    }
    return { success: false, message: 'Professor not found.' };
  },

  // YouTube Channels
  getYoutubeChannels: () => getStorageItem('youtube_channels', INITIAL_YOUTUBE_CHANNELS),
  saveYoutubeChannels: (data) => setStorageItem('youtube_channels', data),
  addYoutubeChannel: (channel) => {
    const channels = db.getYoutubeChannels();
    const newChan = { id: `yt-${Date.now()}`, votes: 1, reviews: [], rating: channel.rating || 5, ...channel };
    channels.push(newChan);
    db.saveYoutubeChannels(channels);
    return newChan;
  },
  addYoutubeReview: (chanId, review) => {
    const channels = db.getYoutubeChannels();
    const idx = channels.findIndex(c => c.id === chanId);
    if (idx !== -1) {
      const user = db.getCurrentUser();
      if (!user) return { success: false, message: 'Please sign in first!' };

      const alreadyReviewed = channels[idx].reviews.some(r => r.userId === user.id);
      if (alreadyReviewed) {
        return { success: false, message: 'You have already left feedback on this channel.' };
      }

      const newReview = { id: `yr-${Date.now()}`, userId: user.id, ...review };
      channels[idx].reviews = [newReview, ...channels[idx].reviews];
      channels[idx].votes += 1;
      
      const totalRating = channels[idx].reviews.reduce((sum, r) => sum + r.rating, 0);
      channels[idx].rating = Number((totalRating / channels[idx].reviews.length).toFixed(1));
      
      db.saveYoutubeChannels(channels);
      return { success: true };
    }
    return { success: false };
  },

  // Study Resources
  getStudyResources: () => getStorageItem('study_resources', INITIAL_STUDY_RESOURCES),
  saveStudyResources: (data) => setStorageItem('study_resources', data),
  addStudyResource: (resource) => {
    const resources = db.getStudyResources();
    const newRes = { id: `res-${Date.now()}`, downloads: 0, rating: 5, comments: 0, ...resource };
    resources.push(newRes);
    db.saveStudyResources(resources);
    return newRes;
  },

  // Campus Spots
  getCampusSpots: () => getStorageItem('campus_spots', INITIAL_CAMPUS_SPOTS),
  saveCampusSpots: (data) => setStorageItem('campus_spots', data),
  addCampusSpot: (spot) => {
    const spots = db.getCampusSpots();
    const newSpot = {
      id: `spot-${Date.now()}`,
      reviewsCount: 0,
      reviews: [],
      rating: 0,
      studyable: 0,
      couples: 0,
      food: 0,
      hangout: 0,
      strictness: 0,
      isolation: 0,
      ...spot
    };
    spots.push(newSpot);
    db.saveCampusSpots(spots);
    return newSpot;
  },
  addSpotReview: (spotId, review) => {
    const spots = db.getCampusSpots();
    const idx = spots.findIndex(s => s.id === spotId);
    if (idx !== -1) {
      const user = db.getCurrentUser();
      if (!user) return { success: false, message: 'Please sign in first!' };

      // Prevent duplicate
      const alreadyReviewed = spots[idx].reviews.some(r => r.userId === user.id);
      if (alreadyReviewed) {
        return { success: false, message: 'You have already submitted feedback for this spot. Multiple reviews from a single account are blocked to maintain stats accuracy.' };
      }

      const newReview = { id: `sr-${Date.now()}`, userId: user.id, ...review };
      spots[idx].reviews = [newReview, ...spots[idx].reviews];
      spots[idx].reviewsCount = spots[idx].reviews.length;

      const reviews = spots[idx].reviews;
      const count = reviews.length;

      // Average 6 parameters
      const totalStud = reviews.reduce((sum, r) => sum + r.studyable, 0);
      const totalCpl = reviews.reduce((sum, r) => sum + r.couples, 0);
      const totalFd = reviews.reduce((sum, r) => sum + r.food, 0);
      const totalHang = reviews.reduce((sum, r) => sum + r.hangout, 0);
      const totalStr = reviews.reduce((sum, r) => sum + r.strictness, 0);
      const totalIso = reviews.reduce((sum, r) => sum + r.isolation, 0);

      spots[idx].studyable = Number((totalStud / count).toFixed(1));
      spots[idx].couples = Number((totalCpl / count).toFixed(1));
      spots[idx].food = Number((totalFd / count).toFixed(1));
      spots[idx].hangout = Number((totalHang / count).toFixed(1));
      spots[idx].strictness = Number((totalStr / count).toFixed(1));
      spots[idx].isolation = Number((totalIso / count).toFixed(1));

      // Overall average rating (excluding strictly negative parameters like strictness/isolation depending on use cases, but let's take mean of overall positive factors)
      spots[idx].rating = Number(((spots[idx].studyable + spots[idx].food + spots[idx].hangout) / 3).toFixed(1));

      db.saveCampusSpots(spots);
      return { success: true };
    }
    return { success: false, message: 'Spot not found.' };
  },

  // Subjects
  getSubjects: () => getStorageItem('subjects', INITIAL_SUBJECTS),
  saveSubjects: (data) => setStorageItem('subjects', data),
  addSubject: (sub) => {
    const subjects = db.getSubjects();
    const newSub = { id: `sub-${Date.now()}`, attended: 0, held: 0, targetPct: 75, credits: 3, ...sub };
    subjects.push(newSub);
    db.saveSubjects(subjects);
    return newSub;
  },
  updateSubjectAttendance: (subId, attended, held) => {
    const subjects = db.getSubjects();
    const idx = subjects.findIndex(s => s.id === subId);
    if (idx !== -1) {
      subjects[idx].attended = Math.max(0, attended);
      subjects[idx].held = Math.max(0, held);
      db.saveSubjects(subjects);
    }
  },
  deleteSubject: (subId) => {
    const subjects = db.getSubjects().filter(s => s.id !== subId);
    db.saveSubjects(subjects);
  },

  // Timetable
  getTimetable: () => getStorageItem('timetable', INITIAL_TIMETABLE),
  saveTimetable: (data) => setStorageItem('timetable', data),
  addTimetableSlot: (day, slot) => {
    const timetable = db.getTimetable();
    if (!timetable[day]) timetable[day] = [];
    const newSlot = { id: `t-${Date.now()}`, ...slot };
    timetable[day].push(newSlot);
    db.saveTimetable(timetable);
    return newSlot;
  },
  deleteTimetableSlot: (day, slotId) => {
    const timetable = db.getTimetable();
    if (timetable[day]) {
      timetable[day] = timetable[day].filter(s => s.id !== slotId);
      db.saveTimetable(timetable);
    }
  },

  // Deadlines
  getDeadlines: () => getStorageItem('deadlines', INITIAL_DEADLINES),
  saveDeadlines: (data) => setStorageItem('deadlines', data),
  addDeadline: (dl) => {
    const dls = db.getDeadlines();
    const newDl = { id: `d-${Date.now()}`, status: 'pending', ...dl };
    dls.push(newDl);
    db.saveDeadlines(dls);
    return newDl;
  },
  toggleDeadline: (dlId) => {
    const dls = db.getDeadlines();
    const idx = dls.findIndex(d => d.id === dlId);
    if (idx !== -1) {
      dls[idx].status = dls[idx].status === 'pending' ? 'done' : 'pending';
      db.saveDeadlines(dls);
    }
  },
  deleteDeadline: (dlId) => {
    const dls = db.getDeadlines().filter(d => d.id !== dlId);
    db.saveDeadlines(dls);
  },

  // CGPA Tracker
  getCgpaData: () => getStorageItem('cgpa_data', INITIAL_CGPA),
  saveCgpaData: (data) => setStorageItem('cgpa_data', data)
};
