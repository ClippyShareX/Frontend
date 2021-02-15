import { LogoutOutlined } from '@ant-design/icons';
import { SiDiscord } from 'react-icons/si';
import { useRouter } from 'next/router';
import { useUser } from './user';
import { Button } from 'antd';
import React from 'react';
import styles from '../styles/Verify.module.css';

export default function Verify() {
    const { setUser, user } = useUser();
    const router = useRouter();

    const logout = async () => {
        try {
            await user.api.logout();

            setUser(null);

            router.push('/');
        } catch (err) {
            router.push('/');
        }
    };

    const discordBtn = {
        marginRight: '5px',
        marginTop: '-10px',
        backgroundColor: '#7289DA',
        border: 'none',
    };

    return (
        <div className={styles.container}>
            <h2>Thank you for registering, just one last step!</h2>

            <p className={styles.caption}>
                Please link your Discord account to Clippy, this is to verify your identity and join the Discord server.
            </p>

            <div className={styles.buttons}>
                <Button
                    size="large"
                    type="primary"
                    style={discordBtn}
                    icon={<SiDiscord className={styles.discordIcon} />}
                    href={`${process.env.BACKEND_URL}/auth/discord/link`}
                >
                    Link Account
                </Button>

                <Button
                    size="large"
                    onClick={logout}
                    icon={<LogoutOutlined />}
                    className={styles.logoutButton}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}
