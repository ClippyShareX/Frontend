import { SettingOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { FaSitemap } from 'react-icons/fa';
import { useRouter } from 'next/router';
import React from 'react';
import styles from '../styles/Settings.module.css';

const { Sider } = Layout;

export default function Sidebar({ selectedTab, render }: { selectedTab: 'general' | 'domains', render: any }) {
    const router = useRouter();

    return (
        <Layout>
            <Sider collapsed={true} className={styles.sidebar}>
                <Menu
                    theme="dark"
                    selectedKeys={[selectedTab]}
                    mode="inline"
                    onClick={({ key }) => {
                        router.push(`/${key === 'general' ? 'settings' : 'settings/domains'}`);
                    }}
                >
                    <Menu.Item
                        key="general"
                        icon={<SettingOutlined />}
                    >
                        General
                    </Menu.Item>

                    <Menu.Item
                        key="domains"
                        icon={<FaSitemap style={{ paddingTop: '4px' }} />}
                    >
                        Domains
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout className={styles.settings}>
                <Content style={{ marginTop: '30px' }} className={styles.fade}>
                    {render}
                </Content>
            </Layout>
        </Layout>
    );
}
