import { HomeOutlined, QuestionOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Link from 'next/link';
import React from 'react';
import { useUser } from '../components/user';
import styles from '../styles/Home.module.css';

export default function Custom404() {
    const { user } = useUser();

    return (
        <div className={styles.container}>
            <h2>404 Invalid Page</h2>
            <Link href={user ? '/dashboard' : '/'}>
                <Button icon={<HomeOutlined />}>
                    {user ? 'Dashboard' : 'Home'}
                </Button>
            </Link>
            <Link href="https://discord.gg/image">
                <Button icon={<QuestionOutlined />}>
                    Need some assistance?
                </Button>
            </Link>
        </div>
    );
}
