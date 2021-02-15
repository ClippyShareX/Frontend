import { DeleteOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Input, notification, Table, Tag, Checkbox, Select } from 'antd';
import { APIError } from '../../api';
import { useUser } from '../user';
import React, { useState } from 'react';
import styles from '../../styles/Domains.module.css';

const { Option } = Select;

export default function Domains() {
    let { user, setUser } = useUser();
    const { domains } = user;

    const initialState = {
        wildcard: true,
        userOnly: false,
        domain: '',
        selectedDomain: {
            name: 'i.clippy.gg',
            wildcard: false,
            subdomain: '',
        },
    };

    const [{ wildcard, userOnly, domain, selectedDomain }, setState] = useState(initialState);

    const addDomain = async () => {
        if (!user.premium) return notification.error({
            message: 'Something went wrong',
            description: 'You do not have permission to add custom domains.',
        });

        try {
            const data = await user.api.addDomain(domain, wildcard, userOnly);

            if (data.success) {
                data.domain.users = 0;

                user = Object.assign({}, user);
                user.domains = user.domains.concat([data.domain]);

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Added domain successfully, please wait up to 48 hours for it to propagate.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

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

    const addRandomDomain = async () => {
        try {
            let domain: any = domains.find((d) => d.name === selectedDomain.name);

            if (!domain) return notification.error({
                message: 'Something went wrong',
                description: 'Invalid domain selection.',
            });

            domain = selectedDomain.wildcard && selectedDomain.subdomain !== '' ? `${selectedDomain.subdomain}.${selectedDomain.name}` : selectedDomain.name;

            const data = await user.api.addRandomDomain(domain);

            if (data.success) {
                user = Object.assign({}, user);
                user.settings.randomDomain.domains = user.settings.randomDomain.domains.concat([domain]);

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Added random domain successfully.',
                });
            }
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    const deleteRandomDomain = async (domain: string) => {
        try {
            const findDomain = user.settings.randomDomain.domains.find((d) => d === domain);

            if (!findDomain) return notification.error({
                message: 'Something went wrong',
                description: 'Invalid domain.',
            });

            const data = await user.api.deleteRandomDomain(domain);

            if (data.success) {
                user = Object.assign({}, user);
                user.settings.randomDomain.domains = user.settings.randomDomain.domains.filter((d) => d !== domain);

                setUser(user);

                notification.success({
                    message: 'Success',
                    description: 'Deleted random domain successfully.',
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Wildcard',
            dataIndex: 'wildcard',
            key: 'wildcard',
            render: (wildcard: boolean) => (
                <span>{wildcard ? 'Yes' : 'No'}</span>
            ),
        },
        {
            title: 'Date Added',
            dataIndex: 'dateAdded',
            key: 'dateAdded',
            render: (date: Date) => (
                <span>{new Date(date).toLocaleString()}</span>
            ),
            sorter: (a: any, b: any) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
            responsive: ['sm'],
        },
        {
            title: 'Users',
            dataIndex: 'users',
            key: 'users',
            sorter: (a: { users: number; }, b: { users: number; }) => a.users - b.users,
            responsive: ['sm'],
        },
        {
            title: 'Tags',
            key: 'tags',
            render: (domain: { wildcard: boolean; donated: boolean; userOnly: boolean; }) => (
                <div>
                    {domain.wildcard && <Tag color="gold">
                        WILDCARD
                    </Tag>}

                    <Tag color="green">
                        {!domain.donated ? 'OFFICIAL' : 'DONATED'}
                    </Tag>

                    <Tag>
                        {domain.userOnly ? 'PRIVATE' : 'PUBLIC'}
                    </Tag>
                </div>
            ),
            responsive: ['md'],
        },
    ];

    return (
        <div>
            {user.premium && <div className={styles.section}>
                <h1 className={styles.title}>Add a Domain</h1>
                <p className={styles.caption}>You can add domains for your use only, or allow others to use them.</p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="ant-statistic-title" style={{ marginTop: -7 }}><WarningOutlined /> These settings are not changeable later.</span>

                    <Checkbox
                        defaultChecked={wildcard}
                        onChange={(val) => setState((state) => ({ ...state, wildcard: val.target.checked }))}
                    >
                        Allow Subdomain
                    </Checkbox>

                    <Checkbox
                        defaultChecked={userOnly}
                        style={{ marginTop: 3, marginLeft: 0 }}
                        onChange={(val) => setState((state) => ({ ...state, userOnly: val.target.checked }))}
                    >
                        Private Domain
                    </Checkbox>
                </div>

                <Input
                    onChange={(val: any) => {
                        val = val.target.value.replace(/\s/g, '-');

                        if (val.trim().length > 60) return;

                        setState((state) => ({ ...state, domain: val }));
                    }}
                    value={domain !== '' ? domain : ''}
                    className={styles.domainInput}
                    placeholder="Domain Name"
                />

                <Button
                    onClick={addDomain}
                    className={styles.btn}
                    icon={<PlusOutlined />}
                >
                    Add Domain
                </Button>
            </div>}

            {user.settings.randomDomain.enabled && (
                <div className={styles.section}>
                    <h1 className={styles.title}>Random Domains</h1>
                    <span className={styles.caption}>
                        Your random domain selections are: <span style={{ fontWeight: 500 }}>
                            {user.settings.randomDomain.domains.length <= 0 ? 'None.' : user.settings.randomDomain.domains.map((m) => (
                                <div className={styles.randomDomainContainer} key={m}>
                                    <p
                                        style={{
                                            marginBottom: '-2px',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {m}
                                    </p>

                                    <Button
                                        onClick={() => deleteRandomDomain(m)}
                                        className={`ant-btn ant-btn-text ant-btn-sm ant-btn-icon-only ${styles.trashBtn}`}
                                        icon={<DeleteOutlined />}
                                    />
                                </div>
                            ))}
                        </span>
                    </span>

                    <Input
                        value={selectedDomain.subdomain !== '' && selectedDomain.wildcard ? selectedDomain.subdomain : ''}
                        placeholder={selectedDomain.wildcard ? 'Subdomain' : 'Not Available'}
                        disabled={selectedDomain.wildcard === false}
                        onChange={(val: any) => {
                            val = val.target.value.replace(/\W/g, '-');

                            if (val.trim().length > 60) return;

                            setState((state) => ({
                                ...state,
                                selectedDomain: {
                                    ...selectedDomain,
                                    subdomain: val,
                                },
                            }));
                        }}
                        className={styles.domainInput}
                        addonAfter={domainSelection}
                    />

                    <Button
                        onClick={addRandomDomain}
                        className={styles.btn}
                        icon={<PlusOutlined />}
                    >
                        Add Domain
                    </Button>
                </div>
            )}

            <div className={styles.section}>
                <h1 className={styles.title}>Domains</h1>
                <p className={styles.caption}>There are currently <strong>{domains.filter((d) => d.userOnly === false).length}</strong> public domain(s).</p>

                <Table
                    pagination={{ responsive: true }}
                    dataSource={domains}
                    columns={columns}
                    style={{
                        marginTop: 3,
                    }}
                />
            </div>
        </div>
    );
}
