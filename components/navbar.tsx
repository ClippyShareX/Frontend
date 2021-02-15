import { useRouter } from 'next/router';
import { useUser } from './user';
import { Button, Drawer, Dropdown, Menu } from 'antd';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from '../styles/Navbar.module.css';
import { DownOutlined, HomeOutlined, LinkOutlined, LogoutOutlined, SettingOutlined, ToolOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;

export default function Navbar({ enabled }: { enabled: 'home' | 'settings' | 'upload' | 'shorten' | 'account' }) {
    const { user, setUser } = useUser();
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    const logout = async () => {
        try {
            await user.api.logout();

            setUser(null);

            router.push('/');
        } catch (err) {
            router.push('/');
        }
    };

    const menu = (
        <Menu>
            <Menu.Item>
                <Link href="/account">
                    <Button
                        icon={<UserOutlined style={{ fontSize: '14px' }} />}
                        style={{ border: 'none' }}
                    >
                        Account
                    </Button>
                </Link>
            </Menu.Item>

            <Menu.Item>
                <Button
                    icon={<LogoutOutlined style={{ fontSize: '14px' }} />}
                    style={{ border: 'none' }}
                    onClick={logout}
                >
                    Logout
                </Button>
            </Menu.Item>
        </Menu>
    );

    const tools = (
        <Menu>
            <Menu.Item>
                <Link href="/tools/upload">
                    <Button
                        icon={<UploadOutlined style={{ fontSize: '14px' }} />}
                        style={{ border: 'none' }}
                    >
                        Upload
                    </Button>
                </Link>
            </Menu.Item>

            <Menu.Item>
                <Link href="/tools/shorten">
                    <Button
                        icon={<LinkOutlined style={{ fontSize: '14px' }} />}
                        style={{ border: 'none' }}
                    >
                        Shorten
                    </Button>
                </Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <div className={styles.navbar}>
            <div className={styles.logo}>
                <Button
                    type="text"
                    onClick={() => router.push('/dashboard')}>
                    <h2>clippy.gg</h2>
                </Button>
            </div>

            <div className={styles.navbarCon}>
                <div className={styles.left}>
                    <Link href="/dashboard">
                        <Button
                            className={`${styles.navButton} ${
                                enabled === 'home' && styles.navButtonActive
                            }`}
                            icon={<HomeOutlined style={{ fontSize: '14px' }} />}
                        >
                            Home
                        </Button>
                    </Link>

                    <Link href="/settings">
                        <Button
                            className={`${styles.navButton} ${
                                enabled === 'settings' && styles.navButtonActive
                            }`}
                            icon={<SettingOutlined style={{ fontSize: '14px' }} />}
                        >
                            Settings
                        </Button>
                    </Link>

                    <Dropdown overlay={tools} placement="bottomCenter">
                        <Button
                            className={`${styles.navButton} ${
                                (enabled === 'upload' || enabled === 'shorten') && styles.navButtonActive
                            }`}
                            icon={<ToolOutlined style={{ fontSize: '14px' }} />}
                        >
                            Tools <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>

                <div className={styles.right}>
                    <Dropdown overlay={menu} placement="bottomCenter">
                        <Button className={styles.logoutButton} type="primary">
                            <img
                                src={user.discord.avatar}
                                height="25px"
                                className={styles.avatarImg}
                            />
                            <span className={styles.avatarUsername}>
                                {user.username}
                            </span>
                        </Button>
                    </Dropdown>
                </div>

                <Button className={styles.barsCon} type="primary" onClick={() => setVisible(true)}>
                    <span className={styles.barsBtn} />
                </Button>

                <Drawer
                    title={`Welcome, ${user.username}.`}
                    placement="right"
                    closable={false}
                    onClose={() => setVisible(false)}
                    visible={visible}
                >
                    <Menu style={{ backgroundColor: '#1f1f1f', border: 'none' }}>
                        <Menu.Item
                            onClick={() => router.push('/dashboard')}
                            style={
                                enabled === 'home' && {
                                    backgroundColor: '#444444',
                                    borderRadius: '10px',
                                }
                            }
                        >
                            <span>
                                <HomeOutlined style={{ fontSize: '14px' }} />
                                Home
                            </span>
                        </Menu.Item>

                        <SubMenu
                            style={
                                enabled === 'settings' ? {
                                    backgroundColor: '#444444',
                                    borderRadius: '10px',
                                } : null
                            }
                            key="sub1"
                            icon={<SettingOutlined />}
                            title="Settings"
                        >
                            <Menu.Item
                                key="1"
                                onClick={() => router.push('/settings')}
                            >
                              General
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                onClick={() => router.push('/settings/domains')}
                            >
                              Domains
                            </Menu.Item>
                        </SubMenu>

                        <SubMenu
                            style={
                                enabled === 'upload' || enabled === 'shorten' ? {
                                    backgroundColor: '#444444',
                                    borderRadius: '10px',
                                } : null
                            }
                            key="sub2"
                            icon={<ToolOutlined />}
                            title="Tools"
                        >
                            <Menu.Item
                                key="1"
                                onClick={() => router.push('/tools/upload')}
                            >
                              Upload
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                onClick={() => router.push('/tools/shorten')}
                            >
                                Shorten
                            </Menu.Item>
                        </SubMenu>
                        <Menu.Item
                            onClick={() => router.push('/account')}
                            style={
                                enabled === 'account' && {
                                    backgroundColor: '#444444',
                                    borderRadius: '10px',
                                }
                            }
                        >
                            <span>
                                <UserOutlined style={{ fontSize: '14px' }} />
                                Account
                            </span>
                        </Menu.Item>
                    </Menu>

                    <Menu style={{ backgroundColor: '#1f1f1f', border: 'none' }}>
                        <Menu.Item onClick={logout}>
                            <span>
                                <LogoutOutlined style={{ fontSize: '14px' }} />
                                Logout
                            </span>
                        </Menu.Item>
                    </Menu>
                </Drawer>
            </div>
        </div>
    );
}
