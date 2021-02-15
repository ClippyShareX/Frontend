import { ClockCircleOutlined, FileImageOutlined, IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Statistic } from 'antd';
import Head from 'next/head';
import React from 'react';
import styles from '../styles/Profile.module.css';
import Navbar from './navbar';

export default function Profile({ userProfile }) {
    // const { user } = useUser();

    return (
        <div className={styles.container}>
            <Head>
                <title>Profile for UID {userProfile.uid}</title>
            </Head>

            <Navbar enabled="account" />

            <div className={styles.page}>
                <div className={styles.section}>
                    <div className={styles.avatarSection}>
                        <Avatar size={60} src={userProfile.avatar} />

                        <h1
                            className={
                                userProfile.blacklisted ?
                                    `${styles.title} ${styles.blacklistedTitle}` :
                                    styles.title
                            }
                        >
                            {userProfile.username}
                        </h1>
                    </div>

                    <p className={`ant-statistic-title ${styles.statistic}`}>UID: {userProfile.uid}</p>


                    <div className={styles.statCon}>
                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="UUID"
                                value={userProfile.uuid}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<IdcardOutlined />}
                            />
                        </Card>

                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="UID"
                                value={userProfile.uid}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<UserOutlined />}
                            />
                        </Card>

                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="Registered at:"
                                value={new Date(userProfile.registrationDate).toLocaleString()}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>

                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="Role"
                                value={userProfile.role}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<LockOutlined />}
                            />
                        </Card>

                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="Uploads"
                                value={userProfile.uploads}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<FileImageOutlined />}
                            />
                        </Card>

                        <Card
                            className={styles.statChild}
                        >
                            <Statistic
                                title="Invited By"
                                value={userProfile.invitedBy}
                                valueStyle={{ color: '#c2c2c2', fontSize: 19 }}
                                prefix={<MailOutlined />}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
