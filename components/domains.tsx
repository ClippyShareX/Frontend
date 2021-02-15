import Head from 'next/head';
import React from 'react';
import styles from '../styles/Settings.module.css';
import Navbar from './navbar';
import DomainsC from './settings/domains';
import Sidebar from './sidebar';

export default function Domains() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Domain Manager</title>
            </Head>

            <Navbar enabled="settings" />
            <Sidebar selectedTab="domains" render={<DomainsC />} />
        </div>
    );
}
