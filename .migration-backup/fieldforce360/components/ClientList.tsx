import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Client } from '../types/client';

const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const { data, error } = await supabase
                    .from('clients')
                    .select('*');

                if (error) throw error;

                setClients(data);
            } catch (error) {
                setError('Failed to fetch clients');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Client List</h2>
            <ul>
                {clients.map(client => (
                    <li key={client.id}>
                        {client.name} - {client.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;