import { DownloadOutlined, SaveOutlined, ToolOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Input, Modal, notification, Select, Switch, Tooltip } from 'antd';
import { useUser } from '../user';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import styles from '../../styles/Settings.module.css';
import { APIError } from '../../api';
import ms from 'ms';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import TextArea from 'antd/lib/input/TextArea';

const { Option } = Select;

export default function General() {
    const router = useRouter();
    let { user, setUser } = useUser();
    const { domains } = user;
    const { domain, embed } = user.settings;

    const initialState = {
        selectedDomain: {
            name: domains.find((d) => d.name === domain.name) ? domain.name : 'i.clippy.gg',
            wildcard: domains.find((d) => d.name === domain.name) ? domains.find((d) => d.name === domain.name).wildcard : false,
            subdomain: domain.subdomain !== '' && domain.subdomain !== null ? domain.subdomain : '',
        },
        autoWipeManager: false,
        embedEditor: false,
        fakeUrlManager: false,
    };

    const [{ selectedDomain, autoWipeManager, embedEditor, fakeUrlManager }, setState] = useState(initialState);

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

    const saveDomain = async () => {
        try {
            const domain = domains.find((d) => d.name === selectedDomain.name);

            if (!domain) return notification.error({
                message: 'Something went wrong',
                description: 'Invalid domain selection.',
            });

            const data = await user.api.saveDomain({
                domain: domain.name,
                subdomain: selectedDomain.subdomain,
            });

            if (data.success) {
                user = Object.assign({}, user);
                user.settings.domain = {
                    name: domain.name,
                    subdomain: selectedDomain.subdomain,
                };

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Updated domain successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const enable = async (property: string, value: boolean) => {
        const options = ['longUrl', 'showLink', 'invisibleUrl', 'embeds', 'autoWipe', 'randomDomain', 'fakeUrl'];

        try {
            let data: any = {};

            for (const prop of options) {
                if (prop === property) data[property] = value;
            }

            data = await user.api.updateSettings(data);

            if (data.success) {
                user = Object.assign({}, user);

                switch (property) {
                    case 'randomDomain':
                        user.settings.randomDomain.enabled = value;
                        break;
                    case 'fakeUrl':
                        user.settings.fakeUrl.enabled = value;
                        break;
                    case 'autoWipe':
                        user.settings.autoWipe.enabled = value;
                        break;
                    case 'embeds':
                        embed.enabled = value;
                        break;
                    default:
                        user.settings[property] = value;
                        break;
                }

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: `${value ? 'Enabled' : 'Disabled'} ${property} successfully.`,
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const setWipeInterval = async (val: number) => {
        try {
            const data = await user.api.setWipeInterval(val);

            if (data.success) {
                user = Object.assign({}, user);
                user.settings.autoWipe.interval = val;

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Updated auto-wipe interval successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const AutoCompleteOptions = [
        { value: '{size}' },
        { value: '{username}' },
        { value: '{filename}' },
        { value: '{uploads}' },
        { value: '{date}' },
        { value: '{time}' },
        { value: '{timestamp}' },
        { value: '{domain}' },
        { value: '{fakeurl}' },
    ];

    const formatEmbedField = (fmt: string) => {
        const date = new Date();
        fmt = fmt
            .replace('{size}', '9.16 MB')
            .replace('{username}', user.username)
            .replace('{filename}', 'file.png')
            .replace('{uploads}', user.uploads.toString())
            .replace('{date}', date.toLocaleDateString())
            .replace('{time}', date.toLocaleTimeString())
            .replace('{timestamp}', date.toLocaleString())
            .replace('{domain}', selectedDomain.subdomain !== '' && selectedDomain.wildcard ? `${selectedDomain.subdomain}.${selectedDomain.name}` : selectedDomain.name)
            .replace('{fakeurl}', user.settings.fakeUrl.url);

        const TIMEZONE_REGEX = /{(time|timestamp):([^}]+)}/i;
        let match = fmt.match(TIMEZONE_REGEX);

        while (match) {
            try {
                const formatted = match[1] === 'time' ? date.toLocaleTimeString('en-US', {
                    timeZone: match[2],
                }) : date.toLocaleString('en-US', {
                    timeZone: match[2],
                });

                fmt = fmt.replace(match[0], formatted);
                match = fmt.match(TIMEZONE_REGEX);
            } catch (err) {
                break;
            }
        }

        return fmt;
    };

    const saveEmbed = async () => {
        const { embed } = user.settings;

        try {
            const data = await user.api.updateEmbed({
                color: embed.color,
                title: embed.title,
                description: embed.description,
                author: embed.author,
                randomColor: embed.randomColor,
            });

            if (data.success) notification.success({
                message: 'Success',
                description: 'Updated embed settings.',
            });
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };
    const saveUrl = async () => {
        const { fakeUrl } = user.settings;

        try {
            const data = await user.api.setFakeUrl(fakeUrl.url);

            if (data.success) notification.success({
                message: 'Success',
                description: 'Updated fakeUrl.',
            });
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    return (
        <div>
            <div className={styles.section}>
                <h1 className={styles.title}>Config Generator</h1>
                <p className={styles.caption}>Click on the button to download the config.</p>

                <Button
                    href={`${process.env.BACKEND_URL}/files/config?key=${user.key}`}
                    className={styles.btn}
                    icon={<DownloadOutlined style={{ paddingTop: '3px' }} />}
                >
                    <span style={{ paddingTop: '2px' }}>
                            Download Sharex Config
                    </span>
                </Button>
                <Button
                    href={"https://www.icloud.com/shortcuts/a45e807b561a48b7802303eca0cd86d9"}
                    className={styles.btn}
                    icon={<DownloadOutlined style={{ paddingTop: '3px' }} />}
                >
                    <span style={{ paddingTop: '2px' }}>
                            Download IOS Shortcut
                    </span>
                </Button>
            </div>

            <div className={styles.section}>
                <h1 className={styles.title}>Domain Preferences</h1>
                <p className={styles.caption}>Your current domain is<span style={{ fontWeight: 500 }}>{' '}
                    {selectedDomain.subdomain !== '' && selectedDomain.wildcard ? `${selectedDomain.subdomain}.${selectedDomain.name}` : selectedDomain.name}
                </span>.</p>

                <Input
                    value={selectedDomain.subdomain !== '' && selectedDomain.wildcard ? selectedDomain.subdomain : ''}
                    placeholder={selectedDomain.wildcard ? 'Subdomain' : 'Not Available'}
                    onChange={(val) => setDomain(val.target.value)}
                    disabled={selectedDomain.wildcard === false}
                    className={styles.domainInput}
                    addonAfter={domainSelection}
                />

                <Button
                    className={styles.btn}
                    icon={<SaveOutlined />}
                    onClick={saveDomain}
                >
                    Save Domain
                </Button>
            </div>

            <div className={styles.section}>
                <h1 className={styles.title}>General Settings</h1>

                <div className={styles.switchCon}>
                    <div style={{ marginRight: 20 }}>
                        <p className={`ant-statistic-title ${styles.switchCap}`}>URL Settings</p>

                        <div className={styles.switch}>
                            <Tooltip placement="topRight" title="Long URL will make your filename 17 characters instead of 7.">
                                <p style={{ cursor: 'pointer', marginRight: 16 }}>Long URL</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.longUrl}
                                onClick={(val) => enable('longUrl', val)}
                                className={styles.switchChild}
                            />
                        </div>

                        <div className={styles.switch}>
                            <Tooltip placement="topRight" title="Show Link will stop discord hiding image links.">
                                <p style={{ cursor: 'pointer', marginRight: 14 }}>Show Link</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.showLink}
                                onClick={(val) => enable('showLink', val)}
                                className={styles.switchChild}
                            />
                        </div>

                        <div className={styles.switch}>
                            <Tooltip placement="topRight" title="Invisible Filename will get rid of the filename at the end of the link of the image.">
                                <p style={{ cursor: 'pointer' }}>Invisible Filename</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.invisibleUrl}
                                onClick={(val) => enable('invisibleUrl', val)}
                                className={styles.switchChild}
                            />
                        </div>
                        <div className={styles.switch} >
                            {user.settings.fakeUrl.enabled && <Button
                                type="primary"
                                onClick={() => setState((state) => ({ ...state, fakeUrlManager: true }))}
                                style={{
                                    backgroundColor: '#444444',
                                    border: 'none',
                                    marginRight: '10px',
                                    marginTop: '-1px',
                                }}
                                shape="circle"
                                icon={<ToolOutlined />}
                                size="small"
                            />}

                            <Tooltip placement="topRight" title="Fake URL will show fake urls, this only works on discord and might be patched soon!">
                                <p style={{ cursor: 'pointer', marginRight: 1 }}>Fake URL</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.fakeUrl.enabled}
                                onClick={(val) => enable('fakeUrl', val)}
                                className={styles.switchChild}
                            />
                        </div>
                    </div>

                    <div>
                        <p className={`ant-statistic-title ${styles.switchCap}`}>Misc Settings</p>

                        <div className={styles.switch}>
                            {embed.enabled && <Button
                                type="primary"
                                onClick={() => setState((state) => ({ ...state, embedEditor: true }))}
                                style={{
                                    backgroundColor: '#444444',
                                    border: 'none',
                                    marginRight: '10px',
                                    marginTop: '-1px',
                                }}
                                shape="circle"
                                icon={<ToolOutlined />}
                                size="small"
                            />}

                            <Tooltip placement="topRight" title="Embeds will allow you to have a custom title, description, and color on your images.">
                                <p style={{ cursor: 'pointer', marginRight: 3 }}>Discord Embeds</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.embed.enabled}
                                onClick={(val) => enable('embeds', val)}
                                className={styles.switchChild}
                            />
                        </div>

                        <div className={styles.switch} >
                            {user.settings.autoWipe.enabled && <Button
                                type="primary"
                                onClick={() => setState((state) => ({ ...state, autoWipeManager: true }))}
                                style={{
                                    backgroundColor: '#444444',
                                    border: 'none',
                                    marginRight: '10px',
                                    marginTop: '-1px',
                                }}
                                shape="circle"
                                icon={<ToolOutlined />}
                                size="small"
                            />}

                            <Tooltip placement="topRight" title="Auto-file wiping will automatically wipe your files based on a interval you provide.">
                                <p style={{ cursor: 'pointer', marginRight: 1 }}>Auto File Wiping</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.autoWipe.enabled}
                                onClick={(val) => enable('autoWipe', val)}
                                className={styles.switchChild}
                            />
                        </div>

                        <div className={styles.switch} style={{ marginBottom: 5 }}>
                            {user.settings.randomDomain.enabled && <Button
                                type="primary"
                                onClick={() => router.push('/settings/domains')}
                                style={{
                                    backgroundColor: '#444444',
                                    border: 'none',
                                    marginRight: '10px',
                                    marginTop: '-1px',
                                }}
                                shape="circle"
                                icon={<ToolOutlined />}
                                size="small"
                            />}

                            <Tooltip placement="topRight" title="Random domain will choose a random domain from a list you provide.">
                                <p style={{ cursor: 'pointer' }}>Random Domain</p>
                            </Tooltip>

                            <Switch
                                defaultChecked={user.settings.randomDomain.enabled}
                                onClick={(val) => enable('randomDomain', val)}
                                className={styles.switchChild}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                className="embedEditor"
                footer={null}
                title="Embed Editor"
                visible={embedEditor}
                onCancel={() => setState((state) => ({ ...state, embedEditor: false }))}
            >
                <div className={styles.previewCon}>
                    <div className={styles.embedSettings}>
                        <Checkbox
                            defaultChecked={embed.randomColor}
                            onChange={(val) => {
                                user = Object.assign({}, user);
                                user.settings.embed.randomColor = val.target.checked;

                                setUser(user);
                            }}
                        >
                            Random Embed Color
                        </Checkbox>

                        <p className={`ant-statistic-title ${styles.embedCap}`}>Embed Color</p>
                        <input
                            onChange={(val) => {
                                user = Object.assign({}, user);
                                user.settings.embed.color = val.target.value;

                                setUser(user);
                            }}
                            value={embed.color}
                            type="color"
                            className={styles.embedColorInput}
                            disabled={embed.randomColor}
                        />

                        <div>
                            <p className={`ant-statistic-title ${styles.embedCap}`}>Embed Title</p>

                            <AutoComplete
                                placeholder="Title"
                                options={AutoCompleteOptions}
                                className={styles.embedInput}
                                onChange={(val) => {
                                    if ((val.length + embed.title.length) > 200) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.title = val;

                                    setUser(user);
                                }}
                                value={
                                    embed.title && embed.title !== '' && embed.title !== 'default' ? embed.title : ''
                                }
                                filterOption={(input, option) => {
                                    return (
                                        input.split(' ').splice(-1)[0].startsWith('{') &&
                                            option.value.startsWith(input.split(' ').splice(-1)) &&
                                            !input.endsWith('}')
                                    );
                                }}
                                onSelect={(_input, option) => {
                                    if (embed.title.length > 200) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.title = `${embed.title === 'default' ? '' : embed.title}${embed.title.length > 0 && embed.title !== 'default' ?
                                        option.value.split(embed.title.split(' ').splice(-1))[1] :
                                        option.value}`;

                                    setUser(user);
                                }}
                            >
                                <TextArea allowClear />
                            </AutoComplete>
                        </div>

                        <div>
                            <p className={`ant-statistic-title ${styles.embedCap}`}>Embed Description</p>

                            <AutoComplete
                                placeholder="Description"
                                options={AutoCompleteOptions}
                                className={styles.embedInput}
                                onChange={(val) => {
                                    if ((val.length + embed.description.length) > 2000) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.description = val;

                                    setUser(user);
                                }}
                                value={
                                    embed.description && embed.description !== '' && embed.description !== 'default' ? embed.description : ''
                                }
                                filterOption={(input, option) => {
                                    return (
                                        input.split(' ').splice(-1)[0].startsWith('{') &&
                                            option.value.startsWith(input.split(' ').splice(-1)) &&
                                            !input.endsWith('}')
                                    );
                                }}
                                onSelect={(_input, option) => {
                                    if (embed.description.length > 2000) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.description = `${embed.description === 'default' ? '' : embed.description}${embed.description.length > 0 && embed.description !== 'default' ?
                                        option.value.split(embed.description.split(' ').splice(-1))[1] :
                                        option.value}`;

                                    setUser(user);
                                }}
                            >
                                <TextArea
                                    allowClear
                                />
                            </AutoComplete>
                        </div>

                        <div>
                            <p className={`ant-statistic-title ${styles.embedCap}`}>Embed Author</p>

                            <AutoComplete
                                placeholder="Author"
                                options={AutoCompleteOptions}
                                className={styles.embedInput}
                                onChange={(val) => {
                                    if ((val.length + embed.title.length) > 200) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.author = val;

                                    setUser(user);
                                }}
                                value={
                                    embed.author && embed.author !== '' && embed.author !== 'default' ? embed.author : ''
                                }
                                filterOption={(input, option) => {
                                    return (
                                        input.split(' ').splice(-1)[0].startsWith('{') &&
                                            option.value.startsWith(input.split(' ').splice(-1)) &&
                                            !input.endsWith('}')
                                    );
                                }}
                                onSelect={(_input, option) => {
                                    if (embed.author.length > 200) return;

                                    user = Object.assign({}, user);
                                    user.settings.embed.author = `${embed.author === 'default' ? '' : embed.author}${embed.author.length > 0 && embed.author !== 'default' ?
                                        option.value.split(embed.author.split(' ').splice(-1))[1] :
                                        option.value}`;

                                    setUser(user);
                                }}
                            >
                                <TextArea
                                    allowClear
                                />
                            </AutoComplete>
                        </div>
                    </div>

                    <div
                        className={styles.embedPreview}
                        style={(embed.title !== '' && embed.description === '' && embed.author === '') || (embed.title === '' && embed.description !== '' && embed.author === '') || (embed.title === '' && embed.description === '' && embed.author !== '') || (embed.title === '' && embed.description === '' && embed.author === '') ? {
                            borderLeft: `5px solid ${embed.randomColor ? `#${((1 << 24) * Math.random() | 0).toString(16)}` : embed.color}`,
                        } : {
                            borderLeft: `5px solid ${embed.randomColor ? `#${((1 << 24) * Math.random() | 0).toString(16)}` : embed.color}`,
                        }}
                    >
                        {embed.author !== '' && <span className={styles.embedAuthor}>
                            {embed.author === 'default' ? user.username : formatEmbedField(embed.author)}
                        </span>}

                        {embed.title !== '' && <span
                            className={styles.embedTitle}
                            style={!embed.author ? {
                                marginTop: '20px',
                            } : null}
                        >
                            {embed.title === 'default' ? 'file.png' : formatEmbedField(embed.title)}
                        </span>}

                        {embed.description !== '' && <span
                            className={styles.embedDescription}
                            style={!embed.author && !embed.title ? {
                                marginTop: '20px',
                            } : null}
                        >
                            {embed.description === 'default'? `Uploaded at ${new Date().toLocaleString()} by ${user.username}.` : formatEmbedField(embed.description)}
                        </span>}

                        <img
                            style={embed.title === '' || embed.description === '' || embed.author === '' ? {
                                width: (embed.title !== '' && embed.description === '' && embed.author === '') || (embed.title === '' && embed.description !== '' && embed.author === '') || (embed.title === '' && embed.description === '' && embed.author !== '') || (embed.title === '' && embed.description === '' && embed.author === '') ? '280px' : '250px',
                            } : null}
                            src="https://imgur.com/yLIXHjk.png"
                            className={styles.embedImage}
                        />
                    </div>
                </div>

                <Button
                    style={{
                        marginTop: 19,
                        marginBottom: 0,
                    }}
                    className={`${styles.btn} ${styles.embedBtn}`}
                    icon={<SaveOutlined />}
                    onClick={saveEmbed}
                >
                    Save Embed
                </Button>
            </Modal>

            <Modal
                title="Auto-Wipe Interval"
                centered
                footer={null}
                visible={autoWipeManager}
                onCancel={() => setState((state) => ({ ...state, autoWipeManager: false }))}
            >
                <Select
                    onSelect={(val) => setWipeInterval(val)}
                    defaultValue={user.settings.autoWipe.interval}
                    style={{ width: '100%', textAlign: 'center' }}
                >
                    <Option value={ms('1h')}>1 Hour</Option>
                    <Option value={ms('2h')}>2 Hours</Option>
                    <Option value={ms('12h')}>12 Hours</Option>
                    <Option value={ms('24h')}>24 Hours</Option>
                    <Option value={ms('1w')}>1 Week</Option>
                    <Option value={ms('2w')}>2 Weeks</Option>
                    <Option value={2147483647}>1 Month</Option>
                </Select>
            </Modal>
            <Modal
                className="fakeUrlManager"
                footer={null}
                title="Manage Fake URL"
                visible={fakeUrlManager}
                onCancel={() => setState((state) => ({ ...state, fakeUrlManager: false }))}
            >
                <div className={styles.previewCon}>
                    <div className={styles.fakeUrlSettings}>
                        <div>
                            <AutoComplete
                                placeholder="Fake URL"
                                className={styles.embedInput}
                                options={AutoCompleteOptions}
                                onChange={(val) => {
                                    if ((val.length) > 100) return;

                                    user = Object.assign({}, user);
                                    user.settings.fakeUrl.url = val;

                                    setUser(user);
                                }}
                                value={
                                    user.settings.fakeUrl.url
                                }
                                onSelect={(_input, option) => {
                                    user = Object.assign({}, user);
                                    user.settings.fakeUrl.url = option.value;

                                    setUser(user);
                                }}
                            >
                                <TextArea
                                    allowClear
                                />
                            </AutoComplete>
                        </div>
                    </div>
                </div>

                <Button
                    style={{
                        marginTop: 19,
                        marginBottom: 0,
                    }}
                    className={`${styles.btn} ${styles.embedBtn}`}
                    icon={<SaveOutlined />}
                    onClick={saveUrl}
                >
                    Save Url
                </Button>
            </Modal>
        </div>
    );
}
