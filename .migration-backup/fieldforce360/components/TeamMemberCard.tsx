import React from 'react';
import { TeamMember } from '../types/team';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <div className="team-member-card">
      <img src={member.photoUrl} alt={`${member.name}'s photo`} className="team-member-photo" />
      <h3 className="team-member-name">{member.name}</h3>
      <p className="team-member-role">{member.role}</p>
      <p className="team-member-bio">{member.bio}</p>
    </div>
  );
};

export default TeamMemberCard;