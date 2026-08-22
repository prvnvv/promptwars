import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { overallAttendance, safeBunks, classesToRecover, getAttendancePct } from '../utils/attendance';
import { RatingStars } from '../components/RatingInput';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Smile,
  BookOpen,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Swords
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [deadlines, setDeadlines] = useState([]);
  const [cgpa, setCgpa] = useState({});
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    setSubjects(db.getSubjects());
    setTimetable(db.getTimetable());
    setDeadlines(db.getDeadlines());
    setCgpa(db.getCgpaData());
    
    // Read theme state
    const t = localStorage.getItem('studentos_theme') || 'default';
    setTheme(t);
  }, []);

  const overall = overallAttendance(subjects);

  // Determine current day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = days[new Date().getDay()];
  const todayClasses = timetable[currentDayName] || [];

  // Filter pending deadlines
  const pendingDls = deadlines
    .filter(d => d.status === 'pending')
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 3);

  // Calculate Gamified Level & Rank based on theme
  const doneCount = deadlines.filter(d => d.status === 'done').length;
  const rawLvl = Math.max(1, Math.min(10, Math.floor(overall * 0.08) + doneCount));

  const getGamifiedInfo = () => {
    if (theme === 'pokemon') {
      let rank = 'Pallet Town Rookie';
      if (rawLvl >= 8) rank = 'Pokémon Champion';
      else if (rawLvl >= 6) rank = 'Elite Four Trainer';
      else if (rawLvl >= 4) rank = 'Gym Leader';
      return {
        levelLabel: `LV. ${rawLvl} Trainer`,
        rank,
        badgeColor: '#E3350D',
        desc: 'Accumulate attendance and clear MST/Lab assignments to win badges and level up your team!',
        icon: Zap
      };
    }
    if (theme === 'hollowknight') {
      let rank = 'Knight of Dirtmouth';
      if (rawLvl >= 8) rank = 'Pure Vessel';
      else if (rawLvl >= 6) rank = 'Void Heart Dreamer';
      else if (rawLvl >= 4) rank = 'Hallownest Protector';
      return {
        levelLabel: `Mask Vessel Level ${rawLvl}`,
        rank,
        badgeColor: '#00D2FF',
        desc: 'Venture deep into exams. Every completed task restores your geo supply and lifeblood reservoirs.',
        icon: Swords
      };
    }
    // Default
    let rank = 'First Year Cadet';
    if (rawLvl >= 8) rank = 'Dean\'s List Scholar';
    else if (rawLvl >= 6) rank = 'MST Survivor';
    else if (rawLvl >= 4) rank = 'Lab Specialist';
    return {
      levelLabel: `Level ${rawLvl} Scholar`,
      rank,
      badgeColor: 'var(--color-primary)',
      desc: 'Keep attendance above 75% and deadlines cleared to secure your academic score.',
      icon: Shield
    };
  };

  const gameInfo = getGamifiedInfo();
  const IconComponent = gameInfo.icon;

  // Generate personalized health/academic report card
  const getDailyInsight = () => {
    const criticallyLow = subjects.filter(s => getAttendancePct(s.attended, s.held) < s.targetPct);
    
    if (criticallyLow.length > 0) {
      const names = criticallyLow.map(s => s.name.split(':')[0]).join(', ');
      
      if (theme === 'pokemon') {
        return {
          type: 'danger',
          title: 'Fainted Pokémon Alert!',
          text: `Your team has fainted in ${names} (below 75%). Go to class immediately to recover HP.`
        };
      }
      if (theme === 'hollowknight') {
        return {
          type: 'danger',
          title: 'Void Shade Manifesting!',
          text: `Your soul is cracking in ${names}. Attend upcoming classes to recover your shell.`
        };
      }
      return {
        type: 'danger',
        title: 'Attendance Alert',
        text: `You are falling below target attendance in: ${names}. Check Attendance page for recovery strategies.`
      };
    }

    const totalSkips = subjects.reduce((sum, s) => sum + safeBunks(s.attended, s.held, s.targetPct), 0);
    if (totalSkips > 5) {
      if (theme === 'pokemon') {
        return {
          type: 'success',
          title: 'Gym Badge Margin!',
          text: `You have ${totalSkips} safe bunks. Enjoy a walk at Jaggi, your Pokémon are resting.`
        };
      }
      if (theme === 'hollowknight') {
        return {
          type: 'success',
          title: 'Lifeblood Flowing!',
          text: `You possess ${totalSkips} skip reserves. Explore Hallownest and gather your Geo.`
        };
      }
      return {
        type: 'success',
        title: 'Looking Solid!',
        text: `You have an aggregate of ${totalSkips} classes you can safely skip this week. Perfect time to recharge.`
      };
    }

    if (theme === 'pokemon') {
      return {
        type: 'info',
        title: 'Exp Share Active',
        text: 'Attendance is above target. Keep showing up to earn level-ups for MST/EST challenges.'
      };
    }
    if (theme === 'hollowknight') {
      return {
        type: 'info',
        title: 'Light of the Beetle Fly',
        text: 'Shell is secure. Remain regular to avoid losing your academic charms.'
      };
    }
    return {
      type: 'info',
      title: 'Steady Progress',
      text: 'Your attendance is above target. Keep attending to secure your final grade and avoid MST debars.'
    };
  };

  const insight = getDailyInsight();

  // Color progress fill based on percentage and theme
  const getProgressColor = (pct) => {
    if (theme === 'pokemon') {
      if (pct >= 75) return '#4fc1e9'; // Blue health
      if (pct >= 70) return '#f6bb42'; // Yellow warn
      return '#da4453'; // Red critical
    }
    if (theme === 'hollowknight') {
      if (pct >= 75) return '#00D2FF'; // Blue Lifeblood
      return '#697380'; // Slate dead
    }
    return pct >= 75 ? 'var(--color-success)' : 'var(--color-danger)';
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Welcome Back</h1>
          <p>Your academic health is looking steady. Check your class schedule below.</p>
        </div>
        
        {/* Gamified Level Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            background: gameInfo.badgeColor,
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconComponent size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: gameInfo.badgeColor }}>
              {gameInfo.levelLabel}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Rank: {gameInfo.rank}
            </div>
          </div>
        </div>
      </header>

      {/* Daily insight banner */}
      <div className="card" style={{
        marginBottom: '24px',
        borderLeft: `5px solid ${
          insight.type === 'danger' ? 'var(--color-danger)' :
          insight.type === 'success' ? 'var(--color-success)' : 'var(--color-primary)'
        }`,
        background: insight.type === 'danger' ? 'var(--color-danger-bg)' :
                    insight.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-bg-card)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        {insight.type === 'danger' ? <AlertTriangle style={{ color: 'var(--color-danger)', marginTop: '2px' }} /> :
         insight.type === 'success' ? <Smile style={{ color: 'var(--color-success)', marginTop: '2px' }} /> :
         <BookOpen style={{ color: 'var(--color-primary)', marginTop: '2px' }} />}
        <div>
          <h4 style={{ fontWeight: 600, color: insight.type === 'danger' ? 'var(--color-danger)' : 'var(--color-text)' }}>
            {insight.title}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {insight.text}
          </p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Stat Card 1: Attendance */}
        <div className="card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer', transition: 'transform 0.15s' }}>
          <div className="card-title">Overall Attendance</div>
          <div className="stat-value" style={{ color: getProgressColor(overall) }}>
            {overall.toFixed(1)}%
          </div>
          <div className="stat-label">Goal: 75.0% minimum</div>
          <div className="progress-track" style={{ marginTop: '12px' }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(overall, 100)}%`,
                background: getProgressColor(overall)
              }}
            />
          </div>
        </div>

        {/* Stat Card 2: Timetable summary */}
        <div className="card" onClick={() => navigate('/timetable')} style={{ cursor: 'pointer' }}>
          <div className="card-title">Today's Schedule</div>
          <div className="stat-value">{todayClasses.length}</div>
          <div className="stat-label">{currentDayName} Lectures/Labs</div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View entire week <ArrowRight size={12} />
          </div>
        </div>

        {/* Stat Card 3: CGPA Target */}
        <div className="card" onClick={() => navigate('/cgpa')} style={{ cursor: 'pointer' }}>
          <div className="card-title">Target CGPA</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {cgpa.targetGpa || '0.00'}
          </div>
          <div className="stat-label">Previous: {cgpa.previousGpa || '0.00'}</div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Adjust grades & credits <ArrowRight size={12} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Today's class slots */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Today's Classes</span>
            <span className="badge badge-primary">{currentDayName}</span>
          </div>

          {todayClasses.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
              <h3>No classes scheduled</h3>
              <p>Enjoy your free day or study at LTS!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayClasses.map((cls) => (
                <div key={cls.id} className="timetable-slot">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontWeight: 600 }}>{cls.subject}</h4>
                    <span className="badge badge-info">{cls.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {cls.time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {cls.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Urgent Deadlines */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Academic Deadlines</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/deadlines')}>Manage</button>
          </div>

          {pendingDls.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
              <h3>All caught up!</h3>
              <p>You have no pending deadlines to track.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingDls.map((dl) => (
                <div key={dl.id} style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{dl.title}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {dl.subject} • Due: {new Date(dl.due).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <span className={`badge ${
                    dl.priority === 'high' ? 'badge-danger' :
                    dl.priority === 'medium' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {dl.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
