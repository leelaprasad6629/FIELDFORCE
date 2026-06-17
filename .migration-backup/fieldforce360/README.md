# FieldForce 360

FieldForce 360 is a Next.js application designed to streamline project management, client interactions, and team collaboration. This application integrates with Supabase for backend data management, providing a seamless experience for users.

## Features

- **Authentication**: Secure user sign-up and login processes.
- **Client Management**: CRUD operations for managing clients.
- **Opportunity Tracking**: Manage business opportunities effectively.
- **Project Management**: CRUD operations for projects, allowing users to track progress and updates.
- **Task Management**: Manage tasks associated with projects and team members.
- **Team Collaboration**: Manage team members and their roles within projects.
- **Timesheet Tracking**: Track work hours and manage timesheets.
- **Google Reviews**: Display Google Reviews on the frontend without backend API calls.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Supabase account for database management

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd fieldforce360
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Supabase project and configure the database.

4. Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

### Running the Application

To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

### Directory Structure

- `app/api`: Contains API routes for authentication, clients, opportunities, projects, tasks, team, and timesheets.
- `app/layout.tsx`: Defines the layout structure for the application.
- `app/page.tsx`: Main entry point for the application.
- `components`: Contains reusable components for the application.
- `lib`: Contains utility files for Supabase client and database interactions.
- `types`: TypeScript types/interfaces for various entities in the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.