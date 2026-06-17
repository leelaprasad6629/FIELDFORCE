import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabaseClient';
import ClientList from '../components/ClientList';
import ProjectCard from '../components/ProjectCard';
import TeamMemberCard from '../components/TeamMemberCard';
import TimesheetTable from '../components/TimesheetTable';

const supabase = createClient();

export default function Home() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: projectsData } = await supabase.from('projects').select('*');
      const { data: teamData } = await supabase.from('team').select('*');
      const { data: timesheetData } = await supabase.from('timesheets').select('*');

      setClients(clientsData);
      setProjects(projectsData);
      setTeamMembers(teamData);
      setTimesheets(timesheetData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Welcome to FieldForce 360</h1>
      <ClientList clients={clients} />
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      {teamMembers.map(member => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
      <TimesheetTable timesheets={timesheets} />
    </div>
  );
}