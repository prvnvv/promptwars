import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useToast } from '../components/Toast';
import { TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const THAPAR_GRADES = [
  { grade: 'A', points: 10 },
  { grade: 'A-', points: 9 },
  { grade: 'B', points: 8 },
  { grade: 'B-', points: 7 },
  { grade: 'C', points: 6 },
  { grade: 'C-', points: 5 },
  { grade: 'D', points: 4 },
  { grade: 'F', points: 0 }
];

export default function CgpaTracker() {
  const { addToast } = useToast();
  
  // Inputs for previous records
  const [previousGpa, setPreviousGpa] = useState(8.0);
  const [previousCredits, setPreviousCredits] = useState(60);
  const [targetGpa, setTargetGpa] = useState(8.5);

  const [subjects, setSubjects] = useState([]);
  const [predictedGrades, setPredictedGrades] = useState({});

  useEffect(() => {
    // Load subjects
    const subs = db.getSubjects();
    setSubjects(subs);

    // Load saved CGPA configuration
    const savedCgpa = db.getCgpaData();
    if (savedCgpa) {
      setPreviousGpa(savedCgpa.previousGpa || 8.0);
      setPreviousCredits(savedCgpa.previousCredits || 60);
      setTargetGpa(savedCgpa.targetGpa || 8.5);
    }

    // Default predicted grade is B (8 points) for all subjects
    const initialPredictions = {};
    subs.forEach(s => {
      initialPredictions[s.id] = 8; // default points
    });
    setPredictedGrades(initialPredictions);
  }, []);

  const handleSaveConfigs = () => {
    db.saveCgpaData({
      previousGpa: Number(previousGpa),
      previousCredits: Number(previousCredits),
      targetGpa: Number(targetGpa)
    });
    addToast('CGPA target settings saved successfully!', 'success');
  };

  const handleGradeChange = (subId, points) => {
    setPredictedGrades(prev => ({
      ...prev,
      [subId]: Number(points)
    }));
  };

  // Calculations
  const currentSemesterCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  
  // Calculate Target SGPA for this semester to reach cumulative Target CGPA
  // Formula: Target CGPA = (PrevGPA * PrevCredits + TargetSGPA * SemCredits) / (PrevCredits + SemCredits)
  // TargetSGPA = [TargetCGPA * (PrevCredits + SemCredits) - (PrevGPA * PrevCredits)] / SemCredits
  const calculateTargetSgpa = () => {
    if (currentSemesterCredits === 0) return 0;
    const totalCredits = Number(previousCredits) + currentSemesterCredits;
    const requiredPoints = (Number(targetGpa) * totalCredits) - (Number(previousGpa) * Number(previousCredits));
    return Math.max(0, requiredPoints / currentSemesterCredits);
  };

  // Calculate predicted SGPA based on selected grades
  const calculatePredictedSgpa = () => {
    if (currentSemesterCredits === 0) return 0;
    let totalPointsEarned = 0;
    subjects.forEach(s => {
      const pts = predictedGrades[s.id] !== undefined ? predictedGrades[s.id] : 8;
      totalPointsEarned += pts * s.credits;
    });
    return totalPointsEarned / currentSemesterCredits;
  };

  const targetSgpa = calculateTargetSgpa();
  const predictedSgpa = calculatePredictedSgpa();

  // Predicted CGPA (Cumulative)
  const calculatePredictedCumulativeCgpa = () => {
    const prevPoints = Number(previousGpa) * Number(previousCredits);
    const semPoints = predictedSgpa * currentSemesterCredits;
    const totalCredits = Number(previousCredits) + currentSemesterCredits;
    if (totalCredits === 0) return 0;
    return (prevPoints + semPoints) / totalCredits;
  };

  const predictedCumulativeCgpa = calculatePredictedCumulativeCgpa();
  const sgpaDelta = predictedSgpa - targetSgpa;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>CGPA Target Estimator</h1>
        <p>Input your targets and estimate grades required in this semester's courses.</p>
      </header>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {/* Targets & Configuration Card */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Setup Targets & History</div>
          <div className="grid-3" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Previous CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                value={previousGpa}
                onChange={(e) => setPreviousGpa(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Previous Credits Earned</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={previousCredits}
                onChange={(e) => setPreviousCredits(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Cumulative CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveConfigs}>
            <RefreshCw size={14} /> Update Calculation Metrics
          </button>
        </div>

        {/* Target Indicator Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-title">Required Semester SGPA</div>
          {targetSgpa > 10 ? (
            <div style={{ color: 'var(--color-danger)' }}>
              <div className="stat-value">Impossible</div>
              <div className="stat-label">Requires {targetSgpa.toFixed(2)} SGPA (exceeds 10.0 scale). Lower your target CGPA.</div>
            </div>
          ) : (
            <div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                {targetSgpa.toFixed(2)}
              </div>
              <div className="stat-label">SGPA target for this semester to hit {targetGpa} cumulative CGPA.</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Left: Interactive Predictor */}
        <div className="card">
          <div className="card-title">Subject Grade Predictor</div>
          {subjects.length === 0 ? (
            <div className="empty-state">
              <h3>No subjects listed</h3>
              <p>Add subjects in the "Attendance" tab to see them here for CGPA prediction.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 600 }}>{sub.name.split(':')[0]}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      Credits: {sub.credits}
                    </span>
                  </div>

                  <div className="form-group" style={{ minWidth: '120px' }}>
                    <select
                      className="form-select"
                      value={predictedGrades[sub.id] !== undefined ? predictedGrades[sub.id] : 8}
                      onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                    >
                      {THAPAR_GRADES.map((g) => (
                        <option key={g.grade} value={g.points}>
                          {g.grade} ({g.points} Pts)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Calculation Outputs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div className="card-title">Forecast Overview</div>
            
            <div className="flex-col" style={{ gap: '12px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>This Semester Credits:</span>
                <strong>{currentSemesterCredits} Credits</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Estimated Semester SGPA:</span>
                <strong>{predictedSgpa.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Forecasted Cumulative CGPA:</span>
                <strong style={{ color: predictedCumulativeCgpa >= targetGpa ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '1.1rem' }}>
                  {predictedCumulativeCgpa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* Status Display Card */}
          {currentSemesterCredits > 0 && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: sgpaDelta >= 0 ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              border: `1px solid ${sgpaDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              {sgpaDelta >= 0 ? (
                <CheckCircle style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <h4 style={{ fontWeight: 600, color: sgpaDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {sgpaDelta >= 0 ? 'Target Met!' : 'Target Out of Reach'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {sgpaDelta >= 0
                    ? `Your current forecast exceeds your target by +${sgpaDelta.toFixed(2)} points. Keep studying to maintain this margin!`
                    : `You are short by ${Math.abs(sgpaDelta).toFixed(2)} points. Try assigning higher grades in core credits like ${
                        subjects.sort((a, b) => b.credits - a.credits)[0]?.name.split(':')[0] || 'your classes'
                      }.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
