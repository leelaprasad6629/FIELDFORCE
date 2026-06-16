import React from 'react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-gray-600">{project.description}</p>
      <div className="flex justify-between mt-4">
        <span className="text-sm">Status: <span className="font-medium">{project.status}</span></span>
        <span className="text-sm">End Date: <span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span></span>
      </div>
    </div>
  );
};

export default ProjectCard;