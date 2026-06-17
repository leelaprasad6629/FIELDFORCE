interface Project {
    id: string;
    name: string;
    description: string;
    clientId: string;
    startDate: string;
    endDate: string;
    status: 'not_started' | 'in_progress' | 'completed';
    teamMembers: string[];
}

export type { Project };