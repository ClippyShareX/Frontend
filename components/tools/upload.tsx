import Head from 'next/head';
import React, { useState } from 'react';
import Navbar from '../navbar';
import styles from '../../styles/Upload.module.css';
import { Input, notification, Select, Switch, Upload } from 'antd';
import { LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { useUser } from '../user';
import Axios from 'axios';

const { Dragger } = Upload;
const { Option } = Select;

export default function UploadC() {
    const { user } = useUser();
    const { domains } = user;

    const initialState = {
        selectedDomain: {
            name: domains.find((d) => d.name === user.settings.domain.name) ? user.settings.domain.name : 'i.dny.wtf',
            wildcard: domains.find((d) => d.name === user.settings.domain.name) ? domains.find((d) => d.name === user.settings.domain.name).wildcard : false,
            subdomain: user.settings.domain.subdomain !== '' && user.settings.domain.subdomain !== null ? user.settings.domain.subdomain : '',
        },
        showLink: user.settings.showLink || false,
        invisibleUrl: user.settings.invisibleUrl || false,
        randomDomain: user.settings.randomDomain.enabled || false,
    };

    const [{ selectedDomain, showLink, invisibleUrl, randomDomain }, setState] = useState(initialState);

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

    return (
        <div className={styles.container}>
            <Head>
                <title>Upload a File</title>
            </Head>

            <Navbar enabled="upload" />

            <div className={styles.page}>
                <div className={styles.section}>
                    <h1 className={styles.title}>Upload a File</h1>

                    <Dragger
                        action={`${process.env.BACKEND_URL}/files`}
                        headers={{
                            key: user.key,
                            domain: selectedDomain.wildcard && selectedDomain.subdomain !== '' ? `${selectedDomain.subdomain}.${selectedDomain.name}` : selectedDomain.name,
                            showLink: showLink ? 'true' : 'false',
                            invisibleUrl: invisibleUrl ? 'true' : 'false',
                            randomDomain: randomDomain ? 'true' : 'false',
                        }}
                        onDownload={(file) => {
                            if (file.status === 'done') {
                                const { response } = file;

                                notification.success({
                                    message: 'Success',
                                    description: 'Copied file URL to clipboard.',
                                });

                                navigator.clipboard.writeText(response.imageUrl);
                            }
                        }}
                        onPreview={(file) => {
                            window.open(file.response.imageUrl, '_blank');
                        }}
                        listType="picture"
                        showUploadList={{
                            showDownloadIcon: true,
                            downloadIcon: () => {
                                return <LinkOutlined />;
                            },
                        }}
                        onRemove={async ({ response }) => {
                            try {
                                const { data } = await Axios.get(response.deletionUrl);

                                if (data.success) notification.success({
                                    message: 'Success',
                                    description: 'Deleted file successfully.',
                                });
                            } catch (err) {
                                notification.error({
                                    message: 'Something went wrong',
                                    description: err.response.data.error || 'Please try again.',
                                });
                            }
                        }}
                        onChange={({ file }) => {
                            if (file.status === 'done') {
                                const { response } = file;

                                notification.success({
                                    message: 'Success',
                                    description: 'Copied file URL to clipboard.',
                                });

                                navigator.clipboard.writeText(response.imageUrl);
                            } else if (file.status === 'error') {
                                notification.error({
                                    message: 'Something went wrong',
                                    description: 'Upload failed, please try again.',
                                });
                            }
                        }}
                    >
                        <UploadOutlined
                            style={{
                                fontSize: '30px',
                                marginTop: '10px',
                            }}
                        />

                        <p
                            style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                marginTop: '5px',
                            }}
                        >
                            Click or drag a file to this area to upload
                        </p>
                        <p
                            style={{
                                paddingLeft: '30px',
                                paddingRight: '30px',
                                marginBottom: '10px',
                            }}
                        >
                            Your url will automatically be copied to your clipboard.
                        </p>
                    </Dragger>

                    <h1 className={styles.title}>Preferences</h1>

                    <Input
                        value={selectedDomain.subdomain !== '' && selectedDomain.wildcard ? selectedDomain.subdomain : ''}
                        placeholder={selectedDomain.wildcard ? 'Subdomain' : 'Not Available'}
                        onChange={(val) => setDomain(val.target.value)}
                        disabled={selectedDomain.wildcard === false}
                        className={styles.domainInput}
                        addonAfter={domainSelection}
                    />

                    <div className={styles.switchContainer}>
                        <h1 className={styles.title} style={{ marginLeft: 0, marginTop: 5 }}>URL Settings</h1>

                        <div className={styles.switchInput}>
                            <p>Show Link</p>
                            <Switch
                                defaultChecked={showLink}
                                onClick={(val) => {
                                    setState((state) => ({ ...state, showLink: val }));
                                }}
                                style={{
                                    marginLeft: '10px',
                                    width: '55px',
                                }}
                            />
                        </div>

                        <div className={styles.switchInput}>
                            <p>Invisible URL</p>
                            <Switch
                                defaultChecked={invisibleUrl}
                                onClick={(val) => {
                                    setState((state) => ({ ...state, invisibleUrl: val }));
                                }}
                                style={{
                                    marginLeft: '10px',
                                    width: '55px',
                                }}
                            />
                        </div>

                        <div className={styles.switchInput}>
                            <p>Random Domain</p>
                            <Switch
                                defaultChecked={invisibleUrl}
                                onClick={(val) => {
                                    setState((state) => ({ ...state, randomDomain: val }));
                                }}
                                style={{
                                    marginLeft: '10px',
                                    width: '55px',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
