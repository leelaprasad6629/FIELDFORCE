import { Suspense } from 'react';
import ProjectCard from '@/fieldforce360/components/ProjectCard';
import ClientList from '@/fieldforce360/components/ClientList';
import TeamMemberCard from '@/fieldforce360/components/TeamMemberCard';
import TimesheetTable from '@/fieldforce360/components/TimesheetTable';

const DashboardPage = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Projects</h2>
          <div className="grid gap-4">
            <p className="text-gray-600">Projects will be displayed here</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Clients</h2>
          <Suspense fallback={<div>Loading clients...</div>}>
            <ClientList />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Team Members</h2>
          <div className="grid gap-4">
            <p className="text-gray-600">Team members will be displayed here</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Timesheets</h2>
          <Suspense fallback={<div>Loading timesheets...</div>}>
            <TimesheetTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;