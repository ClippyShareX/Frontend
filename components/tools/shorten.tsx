import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../navbar';
import styles from '../../styles/Shorten.module.css';
import { Button, Input, notification, Select, Switch, Table } from 'antd';
import { useUser } from '../user';
import { APIError } from '../../api';

const { Option } = Select;

export default function ShortenC() {
    let { user, setUser } = useUser();
    const { domains } = user;

    const initialState = {
        selectedDomain: {
            name: domains.find((d) => d.name === user.settings.domain.name) ? user.settings.domain.name : 'i.clippy.gg',
            wildcard: domains.find((d) => d.name === user.settings.domain.name) ? domains.find((d) => d.name === user.settings.domain.name).wildcard : false,
            subdomain: user.settings.domain.subdomain !== '' && user.settings.domain.subdomain !== null ? user.settings.domain.subdomain : '',
        },
        url: '',
        longUrl: user.settings.longUrl || false,
    };

    const [{ selectedDomain, url, longUrl }, setState] = useState(initialState);

    const domainSelection = (
        <Select
            showSearch
            className={styles.domainDropdown}
            defaultValue={selectedDomain.name}
            filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onSelect={(x) => {
                const domain = domains.find((d) => d.name === x);

                if (!domain) return notification.error({
                    message: 'Something went wrong',
                    description: 'Invalid domain selection',
                });

                setState((state) => ({ ...state, selectedDomain: { ...domain, subdomain: domain.wildcard ? '' : selectedDomain.subdomain } }));
            }}
        >
            {domains.map((d) => (
                <Option key={d.name} value={d.name}>
                    {d.name}
                </Option>
            ))}
        </Select>
    );

    const setUrl = (val: string) => {
        val = val.replace(/\s/g, '-');

        if (val.length > 100) return;

        setState((state) => ({ ...state, url: val }));
    };

    const setDomain = (val: string) => {
        val = val.replace(/\W/g, '-');

        if (val.trim().length > 60) return;

        setState((state) => ({
            ...state,
            selectedDomain: {
                ...selectedDomain,
                subdomain: val,
            },
        }));
    };

    const shorten = async () => {
        try {
            const domain = selectedDomain.subdomain ? selectedDomain.subdomain + '.' + selectedDomain.name : selectedDomain.name;
            const data = await user.api.shortenUrl(url, longUrl, user.key, domain);

            if (data.success) {
                user = Object.assign({}, user);
                user.shortenedUrls = user.shortenedUrls.concat([data.document]);

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Copied shortened URL to clipboard.',
                });

                navigator.clipboard.writeText(data.shortendUrl);
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const deleteShortUrl = async (shortId: string) => {
        try {
            const url = user.shortenedUrls.find((s) => s.shortId === shortId);
            const data = await user.api.deleteShortUrl(url.deletionKey);

            if (data.success) {
                user = Object.assign({}, user);
                user.shortenedUrls = user.shortenedUrls.filter((s) => s.shortId !== shortId);

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Deleted shortened URL successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const columns: any = [
        {
            title: 'ID',
            dataIndex: 'shortId',
            key: 'id',
        },
        {
            title: 'Created At',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: string) => (
                <span>{new Date(timestamp).toLocaleString()}</span>
            ),
            responsive: ['md'],
        },
        {
            title: 'Destination',
            dataIndex: 'destination',
            key: 'destination',
            render: (url: string) => (
                <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`ant-btn-link ${styles.actionBtn}`}
                >
                  Click Here
                </a>
            ),
            responsive: ['sm'],
        },
        {
            title: 'Action',
            key: 'action',
            render: (ctx: { shortId: string; }) => (
                <span
                    onClick={() => deleteShortUrl(ctx.shortId)}
                    className={`ant-btn-link ${styles.actionBtn}`}
                >
                    Delete
                </span>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>Shorten a URL</title>
            </Head>

            <Navbar enabled="upload" />

            <div className={styles.page}>
                <div className={styles.section}>
                    <h1 className={styles.title}>Shorten a URL</h1>

                    <Input
                        value={url !== '' ? url : ''}
                        placeholder="Url"
                        onChange={(val) => setUrl(val.target.value)}
                        className={styles.input}
                    />

                    <h1 className={styles.title} style={{ marginTop: 10 }}>Preferences</h1>

                    <Input
                        value={selectedDomain.subdomain !== '' && selectedDomain.wildcard ? selectedDomain.subdomain : ''}
                        placeholder={selectedDomain.wildcard ? 'Subdomain' : 'Not Available'}
                        onChange={(val) => setDomain(val.target.value)}
                        disabled={selectedDomain.wildcard === false}
                        className={styles.input}
                        addonAfter={domainSelection}
                    />

                    <div className={styles.switchInput}>
                        <p>Long URL</p>
                        <Switch
                            defaultChecked={longUrl}
                            onClick={(val) => {
                                setState((state) => ({ ...state, longUrl: val }));
                            }}
                            style={{
                                marginLeft: '10px',
                                width: '55px',
                            }}
                        />
                    </div>

                    <Button
                        onClick={shorten}
                        className={styles.btn}
                    >
                      Shorten URL
                    </Button>
                </div>

                <div className={styles.section}>
                    <h1 className={styles.title}>Shortened URLS</h1>

                    {user.shortenedUrls.length > 0 ?
                        <Table dataSource={user.shortenedUrls} columns={columns} /> :
                        <p className={styles.caption}>You haven&apos;t shortened any urls.</p>
                    }
                </div>
            </div>
        </div>
    );
}
