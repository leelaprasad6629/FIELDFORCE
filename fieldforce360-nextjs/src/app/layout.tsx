import React, { ReactNode } from 'react';
import './globals.css';
import Navbar from '../components/Navbar';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en">
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    );
};

export default Layout;