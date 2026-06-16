import React from 'react';
import { TeamMember } from '../types/team';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold">{member.name}</h3>
      <p className="text-gray-600">{member.role}</p>
      <p className="text-sm text-gray-500 mt-2">{member.email}</p>
    </div>
  );
};

export default TeamMemberCard;