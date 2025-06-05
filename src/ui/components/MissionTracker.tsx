// MissionTracker UI component (stub)
// Will display active missions and objectives
// See copilot_mission_system_ui_2025-06-04.artifact for plan

import React from 'react';
import { Mission } from '../../world/missions/types';

interface MissionTrackerProps {
  missions: Mission[];
}

export const MissionTracker: React.FC<MissionTrackerProps> = ({ missions }) => {
  return (
    <div className="mission-tracker-panel">
      <h2>Missions</h2>
      <ul>
        {missions.map((mission) => (
          <li key={mission.id}>
            <strong>{mission.title}</strong> - {mission.status}
            <ul>
              {mission.objectives.map((obj) => (
                <li key={obj.id}>
                  {obj.description} [{obj.status}]
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
