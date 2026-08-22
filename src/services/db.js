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
import { sessionManager } from '../utils/sessionManager';
import { validateEmail, generateSecureId, validateReviewText, validateRating, sanitizeInput } from '../utils/sanitizer';

// Helper to get from localstorage with fallback (data only, no user info)
function getStorageItem(key, fallback) {
  const item = localStorage.getItem(`studentos_${key}`);
  if (!item) {
    localStorage.setItem(`studentos_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to parse localStorage key ${key}`, e);
    return fallback;
  }
}

function setStorageItem(key, data) {
  try {
    localStorage.setItem(`studentos_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save localStorage key ${key}`, e);
  }
}

export const db = {
  // Secure Session Management
  getCurrentUser: () => {
    const session = sessionManager.getSession();
    if (!session) return null;
    return {
      email: session.email,
      name: session.name,
      // Note: id not needed for new architecture
    };
  },
  
  signInWithGoogle: (email) => {
    // Validate email format and domain
    if (!validateEmail(email)) {
      return { success: false, message: 'Invalid email format. Please use your @thapar.edu email.' };
    }
    
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Extract and sanitize name from email
    const namePart = sanitizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\d+/g, '');
    const name = sanitizeInput(namePart
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')) || 'Student';
    
    try {
      const session = sessionManager.createSession(sanitizedEmail, name);
      return { 
        success: true, 
        user: {
          email: session.email,
          name: session.name
        }
      };
    } catch (e) {
      console.error('Sign in failed', e);
      return { success: false, message: 'Sign in failed. Please try again.' };
    }
  },

  signOut: () => {
    sessionManager.clearSession();
  },

  onAuthChange: (callback) => {
    return sessionManager.onChange(callback);
  },

  // Professors
  getProfessors: () => getStorageItem('professors', INITIAL_PROFESSORS),
  saveProfessors: (data) => setStorageItem('professors', data),
  addProfessor: (prof) => {
    const profs = db.getProfessors();
    const newProf = {
      id: generateSecureId('prof'),
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
    if (idx === -1) {
      return { success: false, message: 'Professor not found.' };
    }

    const user = db.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please sign in first!' };
    }

    // Check duplicate review by email (not mutable)
    const alreadyReviewed = profs[idx].reviews.some(r => r.userEmail === user.email);
    if (alreadyReviewed) {
      return { success: false, message: 'You have already reviewed this professor. Only one review per student is allowed.' };
    }

    // Validate ratings
    const tq = validateRating(review.teachingQuality);
    const gl = validateRating(review.gradingLeniency);
    const acc = validateRating(review.accessibility);
    const as = validateRating(review.attendanceStrictness);

    if ([tq, gl, acc, as].some(r => r === null)) {
      return { success: false, message: 'All ratings must be between 1 and 5.' };
    }

    const comment = validateReviewText(review.comment || '');

    const newReview = {
      id: generateSecureId('review'),
      userEmail: user.email,
      created_at: new Date().toISOString().split('T')[0],
      teachingQuality: tq,
      gradingLeniency: gl,
      accessibility: acc,
      attendanceStrictness: as,
      comment
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
    profs[idx].rating = Number(((profs[idx].teachingQuality + profs[idx].gradingLeniency + profs[idx].accessibility) / 3).toFixed(1));
    
    db.saveProfessors(profs);
    return { success: true };
  },

  // YouTube Channels
  getYoutubeChannels: () => getStorageItem('youtube_channels', INITIAL_YOUTUBE_CHANNELS),
  saveYoutubeChannels: (data) => setStorageItem('youtube_channels', data),
  addYoutubeChannel: (channel) => {
    const channels = db.getYoutubeChannels();
    const newChan = { id: generateSecureId('yt'), votes: 1, reviews: [], rating: channel.rating || 5, ...channel };
    channels.push(newChan);
    db.saveYoutubeChannels(channels);
    return newChan;
  },
  addYoutubeReview: (chanId, review) => {
    const channels = db.getYoutubeChannels();
    const idx = channels.findIndex(c => c.id === chanId);
    if (idx === -1) {
      return { success: false, message: 'Channel not found.' };
    }

    const user = db.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please sign in first!' };
    }

    const alreadyReviewed = channels[idx].reviews.some(r => r.userEmail === user.email);
    if (alreadyReviewed) {
      return { success: false, message: 'You have already left feedback on this channel.' };
    }

    const rating = validateRating(review.rating);
    if (rating === null) {
      return { success: false, message: 'Rating must be between 1 and 5.' };
    }

    const comment = validateReviewText(review.comment || '');

    const newReview = { 
      id: generateSecureId('yt-review'), 
      userEmail: user.email,
      created_at: new Date().toISOString().split('T')[0],
      rating,
      comment
    };
    channels[idx].reviews = [newReview, ...channels[idx].reviews];
    channels[idx].votes += 1;
    
    const totalRating = channels[idx].reviews.reduce((sum, r) => sum + r.rating, 0);
    channels[idx].rating = Number((totalRating / channels[idx].reviews.length).toFixed(1));
    
    db.saveYoutubeChannels(channels);
    return { success: true };
  },

  // Study Resources
  getStudyResources: () => getStorageItem('study_resources', INITIAL_STUDY_RESOURCES),
  saveStudyResources: (data) => setStorageItem('study_resources', data),
  addStudyResource: (resource) => {
    const resources = db.getStudyResources();
    const newRes = { id: generateSecureId('res'), downloads: 0, rating: 5, comments: 0, ...resource };
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
      id: generateSecureId('spot'),
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
    if (idx === -1) {
      return { success: false, message: 'Spot not found.' };
    }

    const user = db.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Please sign in first!' };
    }

    const alreadyReviewed = spots[idx].reviews.some(r => r.userEmail === user.email);
    if (alreadyReviewed) {
      return { success: false, message: 'You have already submitted feedback for this spot.' };
    }

    // Validate all ratings
    const ratings = {
      studyable: validateRating(review.studyable),
      couples: validateRating(review.couples),
      food: validateRating(review.food),
      hangout: validateRating(review.hangout),
      strictness: validateRating(review.strictness),
      isolation: validateRating(review.isolation)
    };

    if (Object.values(ratings).some(r => r === null)) {
      return { success: false, message: 'All ratings must be between 1 and 5.' };
    }

    const comment = validateReviewText(review.comment || '');

    const newReview = { 
      id: generateSecureId('spot-review'), 
      userEmail: user.email,
      created_at: new Date().toISOString().split('T')[0],
      ...ratings,
      comment
    };
    spots[idx].reviews = [newReview, ...spots[idx].reviews];
    spots[idx].reviewsCount = spots[idx].reviews.length;

    const reviews = spots[idx].reviews;
    const count = reviews.length;

    spots[idx].studyable = Number((reviews.reduce((sum, r) => sum + r.studyable, 0) / count).toFixed(1));
    spots[idx].couples = Number((reviews.reduce((sum, r) => sum + r.couples, 0) / count).toFixed(1));
    spots[idx].food = Number((reviews.reduce((sum, r) => sum + r.food, 0) / count).toFixed(1));
    spots[idx].hangout = Number((reviews.reduce((sum, r) => sum + r.hangout, 0) / count).toFixed(1));
    spots[idx].strictness = Number((reviews.reduce((sum, r) => sum + r.strictness, 0) / count).toFixed(1));
    spots[idx].isolation = Number((reviews.reduce((sum, r) => sum + r.isolation, 0) / count).toFixed(1));
    spots[idx].rating = Number(((spots[idx].studyable + spots[idx].food + spots[idx].hangout) / 3).toFixed(1));

    db.saveCampusSpots(spots);
    return { success: true };
  },

  // Subjects
  getSubjects: () => getStorageItem('subjects', INITIAL_SUBJECTS),
  saveSubjects: (data) => setStorageItem('subjects', data),
  addSubject: (sub) => {
    const subjects = db.getSubjects();
    const newSub = { id: generateSecureId('sub'), attended: 0, held: 0, targetPct: 75, credits: 3, ...sub };
    subjects.push(newSub);
    db.saveSubjects(subjects);
    return newSub;
  },
  updateSubjectAttendance: (subId, attended, held) => {
    const subjects = db.getSubjects();
    const idx = subjects.findIndex(s => s.id === subId);
    if (idx !== -1) {
      subjects[idx].attended = Math.max(0, parseInt(attended) || 0);
      subjects[idx].held = Math.max(0, parseInt(held) || 0);
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
    const newSlot = { id: generateSecureId('time'), ...slot };
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
    const newDl = { id: generateSecureId('deadline'), status: 'pending', ...dl };
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
