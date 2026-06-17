import React from 'react';
import './globals.css';
import Navbar from '../components/Navbar';

const Layout = ({ children }) => {
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