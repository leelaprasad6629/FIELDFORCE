import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Timesheet } from '../../types/timesheet';

const TimesheetTable: React.FC = () => {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimesheets = async () => {
            try {
                const { data, error } = await supabase
                    .from('timesheets')
                    .select('*');

                if (error) throw error;

                setTimesheets(data);
            } catch (error) {
                setError('Error fetching timesheets');
            } finally {
                setLoading(false);
            }
        };

        fetchTimesheets();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Hours Worked</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {timesheets.map((timesheet) => (
                    <tr key={timesheet.id}>
                        <td>{timesheet.id}</td>
                        <td>{timesheet.employee}</td>
                        <td>{timesheet.hours_worked}</td>
                        <td>{new Date(timesheet.date).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TimesheetTable;