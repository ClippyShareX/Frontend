import React, { useState } from 'react';
import Navbar from './navbar';
import styles from '../styles/Dashboard.module.css';
import Head from 'next/head';
import Spoiler from './spoiler';
import { useUser } from './user';
import { Button, Card, List, Modal, notification, Popconfirm, Table } from 'antd';
import { FileOutlined, DatabaseOutlined, DeleteOutlined, KeyOutlined, MailOutlined, RedoOutlined } from '@ant-design/icons';
import { APIError } from '../api';

export default function Dashboard() {
    const [inviteManager, setInvManager] = useState(false);
    let { user, setUser } = useUser();
    const { images } = user;

    const regenKey = async () => {
        try {
            const data = await user.api.regenKey();

            if (data.success) {
                user = Object.assign({}, user);
                user.key = data.key;
                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Regenerated key successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const deleteImage = async (x: any) => {
        if (!x) throw new Error('provide a file');

        const image = user.images.find((i) => i.filename === x.filename);

        if (!image) return notification.error({
            message: 'Something went wrong',
            description: 'Invalid file.',
        });

        try {
            const data = await user.api.deleteImage(image.filename);

            if (data.success) {
                user = Object.assign({}, user);
                user.images = user.images.filter((x: any) => x.filename !== image.filename),
                user.uploads = user.uploads > 0 ? user.uploads - 1 : user.uploads;
                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Deleted file successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const createInvite = async () => {
        const invites = user.invites;

        if (invites <= 0 && !user.admin) return notification.error({
            message: 'Something went wrong',
            description: 'You do not have any invites.',
        });

        try {
            const data = await user.api.createInvite();

            if (data.success) {
                user = Object.assign({}, user);
                user.createdInvites = user.createdInvites.concat([{
                    _id: data.code,
                    dateCreated: data.dateCreated,
                }]);
                if (!user.admin) user.invites = user.invites - 1;

                setUser(user);

                navigator.clipboard.writeText(data.link);

                notification.success({
                    message: 'Success',
                    description: 'Copied invite link to clipboard.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: '_id',
            key: 'code',
        },
        {
            title: 'Created On',
            dataIndex: 'dateCreated',
            key: 'dateCreated',
            render: (record: any) => new Date(record).toLocaleDateString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: any) => (
                <span
                    className={`ant-btn-link ${styles.actionBtn}`}
                    onClick={() => {
                        navigator.clipboard.writeText(`https://dny.gifts/${record._id}`);

                        notification.success({
                            message: 'Success',
                            description: 'Copied invite link to clipboard.',
                        });
                    }}
                >
                    Copy Link
                </span>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>Dny Dashboard</title>
            </Head>

            <Navbar enabled="home" />

            <div className={styles.dashboard}>
                <div className={styles.section}>
                    <h1 className={styles.title} style={{
                        marginLeft: '8px',
                    }}>Welcome, {user.username}!</h1>

                    <div className={styles.statsCon}>
                        <Card className={styles.statsBox}>
                            <div className="ant-statistic-title"><FileOutlined /> Files</div>
                            <div className={styles.statContent}>You have uploaded <strong>{user.uploads}</strong> files.</div>
                        </Card>

                        <Card className={styles.statsBox}>
                            <div className="ant-statistic-title"><DatabaseOutlined /> Storage Used</div>
                            <div className={styles.statContent}>{user.storageUsed}</div>
                        </Card>

                        <Card className={styles.statsBox}>
                            <div className="ant-statistic-title"><MailOutlined /> Invites</div>
                            <Button
                                shape="round"
                                disabled={user.invites <= 0 && user.createdInvites.length <= 0}
                                style={{
                                    marginTop: '3px',
                                }}
                                onClick={() => setInvManager(true)}
                            >
                                Manage Invites (<strong>{user.admin ? '∞' : user.invites}</strong>)
                            </Button>
                        </Card>

                        <Card className={styles.statsBox}>
                            <div className="ant-statistic-title"><KeyOutlined /> Upload Key</div>
                            <div className={styles.keyCon}>
                                <Spoiler />

                                <Popconfirm
                                    onConfirm={regenKey}
                                    title="Are you sure?"
                                    okText="Yes"
                                    okButtonProps={{
                                        style: {
                                            backgroundColor: 'rgb(37, 37, 37)',
                                            borderColor: '#444444',
                                        },
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        style={{
                                            backgroundColor: '#444444',
                                            border: 'none',
                                            marginLeft: '11px',
                                            marginTop: '-2px',
                                        }}
                                        shape="circle"
                                        icon={<RedoOutlined />}
                                        size="small"
                                    />
                                </Popconfirm>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className={styles.section}>
                    <h1 className={styles.title}>Gallery</h1>
                    <p className={styles.galleryCaption}>Here you can view all of your files.</p>

                    <div className={styles.galleryContainer}>
                        <List
                            locale={{ emptyText: 'You haven\'t uploaded any files.' }}
                            dataSource={images}
                            pagination={images.length <= 14 ? false : {
                                pageSize: 14,
                                showSizeChanger: false,
                                responsive: true,
                                style: {
                                    marginLeft: '4px',
                                },
                            }}
                            renderItem={(m) => {
                                return (
                                    <Card
                                        key={m.link}
                                        style={{
                                            width: '241.1px',
                                            height: '170px',
                                            marginBottom: '10px',
                                            marginLeft: '10px',
                                        }}
                                        cover={
                                            <a href={m.link} target="blank">
                                                <img
                                                    style={{
                                                        height: '100px',
                                                        width: '239px',
                                                        objectFit: 'cover',
                                                    }}
                                                    src={m.link}
                                                />
                                            </a>
                                        }
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}>
                                            <span>
                                                <div className="ant-statistic-title" style={{
                                                    marginBottom: '0px',
                                                    marginTop: '-12px',
                                                }}>{m.filename}</div>
                                                <span style={{
                                                    fontSize: '13.6px',
                                                }}>Uploaded at {new Date(m.dateUploaded).toLocaleDateString()}</span>
                                            </span>

                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                marginTop: '-14px',
                                                marginLeft: '15px',
                                                justifyContent: 'center',
                                            }}>

                                                <Button
                                                    type="primary"
                                                    onClick={() => {
                                                        deleteImage(m);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#e03024',
                                                        border: 'none',
                                                    }}
                                                    shape="circle"
                                                    icon={<DeleteOutlined />}
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                );
                            }}
                        />
                    </div>
                </div>

                <Modal
                    title="Invite Manager"
                    visible={inviteManager}
                    onCancel={() => setInvManager(false)}
                    footer={null}
                >
                    <Table
                        rowKey="code"
                        pagination={false}
                        locale={{ emptyText: 'You haven\'t made any invites.' }}
                        dataSource={user.createdInvites}
                        columns={columns}
                    />

                    <Button
                        shape="round"
                        disabled={user.admin ? false : user.invites <= 0}
                        style={{
                            marginTop: '20px',
                            height: '35px',
                            width: '150px',
                        }}
                        onClick={createInvite}
                    >
                        Create Invite <strong> ({user.admin ? '∞' : user.invites})</strong>
                    </Button>
                </Modal>
            </div>
        </div>
    );
}


