import React from 'react';
import { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <span>Status: {project.status}</span>
      <span>Due Date: {project.dueDate}</span>
    </div>
  );
};

export default ProjectCard;