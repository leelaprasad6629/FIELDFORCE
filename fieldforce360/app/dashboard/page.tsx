import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProjectCard from '@/components/ProjectCard';
import ClientList from '@/components/ClientList';
import TeamMemberCard from '@/components/TeamMemberCard';
import TimesheetTable from '@/components/TimesheetTable';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timesheets, setTimesheets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectsData } = await supabase.from('projects').select('*');
      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: teamData } = await supabase.from('team').select('*');
      const { data: timesheetsData } = await supabase.from('timesheets').select('*');

      setProjects(projectsData);
      setClients(clientsData);
      setTeamMembers(teamData);
      setTimesheets(timesheetsData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Projects</h2>
      <div>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <h2>Clients</h2>
      <ClientList clients={clients} />
      <h2>Team Members</h2>
      <div>
        {teamMembers.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
      <h2>Timesheets</h2>
      <TimesheetTable timesheets={timesheets} />
    </div>
  );
};

export default DashboardPage;