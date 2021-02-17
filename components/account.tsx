import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from './navbar';
import styles from '../styles/Account.module.css';
import { useUser } from './user';
import { Button, Form, Input, Modal, notification } from 'antd';
import { APIError } from '../api';
import { useRouter } from 'next/router';

export default function Account() {
    const router = useRouter();
    let { user, setUser } = useUser();

    const initialState = {
        changeModal: false,
        newUsername: '',
        newPassword: '',
        password: '',
    };

    const [{ changeModal, newUsername, newPassword, password }, setState] = useState(initialState);

    const relinkDiscord = () => {
        Modal.confirm({
            title: 'Are you sure?',
            content: 'Your role will be removed on your previous account.',
            okButtonProps: {
                style: {
                    backgroundColor: '#444444',
                    border: 'none',
                },
            },
            onOk: () => {
                window.location.href = `${process.env.BACKEND_URL}/auth/discord/link`;
            },
        });
    };

    const wipeFiles = () => {
        Modal.confirm({
            title: 'Are you sure?',
            content: 'All of your files will be deleted.',
            okButtonProps: {
                style: {
                    backgroundColor: '#444444',
                    border: 'none',
                },
            },
            onOk: async () => {
                try {
                    const data = await user.api.wipeFiles();

                    if (data.success) {
                        if (data.count <= 0) return notification.error({
                            message: 'Something went wrong',
                            description: 'You haven\'t uploaded any files',
                        });

                        user = Object.assign({}, user);
                        user.images = [];
                        user.uploads = 0;

                        setUser(user);

                        notification.success({
                            message: 'Success',
                            description: `Wiped ${data.count} files successfully.`,
                        });
                    }
                } catch (err) {
                    if (err instanceof APIError) return notification.error({
                        message: 'Something went wrong',
                        description: err.message,
                    });
                }
            },
        });
    };

    const disableAccount = async () => {
        Modal.confirm({
            title: 'Are you sure?',
            content: 'Your account will be disabled, this action is not reversible.',
            okButtonProps: {
                style: {
                    backgroundColor: '#444444',
                    border: 'none',
                },
            },
            onOk: async () => {
                try {
                    const data = await user.api.disableAccount();

                    if (data.success) {
                        setUser(null);

                        router.push('/');
                    }
                } catch (err) {
                    if (err instanceof APIError) return notification.error({
                        message: 'Something went wrong',
                        description: err.message,
                    });
                }
            },
        });
    };

    const setUsername = async () => {
        try {
            const data = await user.api.changeUsername(newUsername, password);

            if (data.success) {
                user = Object.assign({}, user);
                user.username = newUsername;

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Changed username successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const setPassword = async () => {
        try {
            const data = await user.api.changePassword(newPassword, password);

            if (data.success) notification.success({
                message: 'Success',
                description: 'Changed password successfully.',
            });
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Account</title>
            </Head>

            <Navbar enabled="account" />

            <div className={styles.page}>
                <div className={styles.section}>
                    <h1 className={styles.title}>Account</h1>

                    <Form
                        layout="vertical"
                        name="basic"
                        initialValues={{ remember: true }}
                    >
                        <Form.Item
                            className={styles.accountInput}
                            label="UUID"
                            name="uuid"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user._id}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="UID"
                            name="uid"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.uid.toString()}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Username"
                            name="username"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.username}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Discord ID"
                            name="discordId"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.discord.id}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Role"
                            name="role"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.admin ? 'Admin' : (user.premium ? 'Premium' : 'Whitelisted')}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Invited By"
                            name="invitedBy"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.invitedBy}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Invited Users"
                            name="invitedUsers"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={user.invitedUsers.length !== 0 ? user.invitedUsers.join(', ') : 'None'}
                            />
                        </Form.Item>

                        <Form.Item
                            className={styles.accountInput}
                            label="Registration Date"
                            name="registrationDate"
                        >
                            <Input
                                disabled
                                style={{
                                    backgroundColor: 'transparent',
                                }}
                                placeholder={new Date(user.registrationDate).toLocaleString()}
                            />
                        </Form.Item>
                    </Form>

                    <div className={styles.btnContainer}>
                        <Button onClick={relinkDiscord} className={styles.btn} size="large">
                            <span
                                style={{
                                    fontSize: '14px',
                                    paddingBottom: '4px',
                                }}
                            >
                                Relink Discord
                            </span>
                        </Button>

                        <Button onClick={wipeFiles} className={styles.btn} size="large">
                            <span
                                style={{
                                    fontSize: '14px',
                                    paddingBottom: '4px',
                                }}
                            >
                                Wipe Files
                            </span>
                        </Button>

                        <Button onClick={() => setState((state) => ({ ...state, changeModal: true }))} className={styles.btn} size="large">
                            <span
                                style={{
                                    fontSize: '14px',
                                    paddingBottom: '4px',
                                }}
                            >
                                Change Username/Password
                            </span>
                        </Button>

                        <Button onClick={disableAccount} className={styles.btn} size="large">
                            <span
                                style={{
                                    fontSize: '14px',
                                    paddingBottom: '4px',
                                }}
                            >
                                Disable Account
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                footer={null}
                visible={changeModal}
                onCancel={() => setState((state) => ({ ...state, changeModal: false, password: '', newUsername: '', newPassword: '' }))}
            >
                <div style={{
                    marginBottom: 15,
                }}>
                    <h1 style={{ fontSize: 15 }}>Change your username.</h1>

                    <div className={styles.changeCon}>
                        <span className="ant-statistic-title">New Username</span>

                        <Input
                            style={{
                                marginTop: 5,
                                backgroundColor: 'transparent',
                            }}
                            onChange={(val: any) => {
                                val = val.target.value;

                                if (val.trim().length > 30) return;

                                setState((state) => ({
                                    ...state,
                                    newUsername: val,
                                }));
                            }}
                            placeholder="Username"
                            value={newUsername !== '' ? newUsername : ''}
                        />
                    </div>

                    <div>
                        <span className="ant-statistic-title">Password</span>

                        <Input
                            style={{
                                marginTop: 5,
                                backgroundColor: 'transparent',
                            }}
                            onChange={(val: any) => {
                                val = val.target.value;

                                if (val.trim().length > 100) return;

                                setState((state) => ({
                                    ...state,
                                    password: val,
                                }));
                            }}
                            placeholder="Password"
                            value={password !== '' ? password : ''}
                            type="password"
                        />
                    </div>

                    <Button onClick={setUsername} className={styles.changeBtn}>Change Username</Button>
                </div>

                <div>
                    <h1 style={{ fontSize: 15 }}>Change your password.</h1>

                    <div className={styles.changeCon}>
                        <span className="ant-statistic-title">New Password</span>

                        <Input
                            style={{
                                marginTop: 5,
                                backgroundColor: 'transparent',
                            }}
                            onChange={(val: any) => {
                                val = val.target.value;

                                if (val.trim().length > 100) return;

                                setState((state) => ({
                                    ...state,
                                    newPassword: val,
                                }));
                            }}
                            placeholder="New Password"
                            value={newPassword !== '' ? newPassword : ''}
                            type="password"
                        />
                    </div>

                    <div>
                        <span className="ant-statistic-title">Password</span>

                        <Input
                            style={{
                                marginTop: 5,
                                backgroundColor: 'transparent',
                            }}
                            onChange={(val: any) => {
                                val = val.target.value;

                                if (val.trim().length > 100) return;

                                setState((state) => ({
                                    ...state,
                                    password: val,
                                }));
                            }}
                            placeholder="Current Password"
                            value={password !== '' ? password : ''}
                            type="password"
                        />
                    </div>

                    <Button onClick={setPassword} className={styles.changeBtn}>Change Password</Button>
                </div>
            </Modal>
        </div>
    );
}
