import React from 'react';
import { Client } from '../types/client';

const ClientList: React.FC = () => {
    const clients: Client[] = [];

    return (
        <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Client List</h2>
            {clients.length === 0 ? (
                <p className="text-gray-500">No clients available yet</p>
            ) : (
                <ul className="space-y-2">
                    {clients.map(client => (
                        <li key={client.id} className="border-b pb-2">
                            <span className="font-medium">{client.name}</span> - <span className="text-gray-600">{client.email}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ClientList;