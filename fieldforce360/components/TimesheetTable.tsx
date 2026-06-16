import React from 'react';
import { Timesheet } from '../types/timesheet';

const TimesheetTable: React.FC = () => {
    const timesheets: Timesheet[] = [];

    return (
        <div className="border rounded-lg overflow-hidden">
            {timesheets.length === 0 ? (
                <p className="p-4 text-gray-500">No timesheets available yet</p>
            ) : (
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Employee</th>
                            <th className="px-4 py-2 text-left">Hours Worked</th>
                            <th className="px-4 py-2 text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timesheets.map((timesheet) => (
                            <tr key={timesheet.id} className="border-t">
                                <td className="px-4 py-2">{timesheet.id}</td>
                                <td className="px-4 py-2">{timesheet.userId}</td>
                                <td className="px-4 py-2">{timesheet.hoursWorked}</td>
                                <td className="px-4 py-2">{new Date(timesheet.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TimesheetTable;