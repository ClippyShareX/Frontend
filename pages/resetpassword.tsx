import React, { useEffect, useState } from 'react';
import { APIError } from '../api';
import { LockOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Form, Input, notification } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useUser } from '../components/user';
import { useRouter } from 'next/router';
import { resetPassword as resetPasswordF } from '../api';
import Axios from 'axios';
import styles from '../styles/PasswordResets.module.css';

export default function ResetPassword({ query, valid }) {
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, []);

    const initialState = {
        password: '',
        confirmPassword: '',
    };

    const [{ password, confirmPassword }, setState] = useState(initialState);
    const [form] = useForm();

    const setInput = (property: string, val: string) => {
        setState((state) => ({ ...state, [property]: val }));
    };

    const resetPassword = async () => {
        if (confirmPassword !== password) return notification.error({
            message: 'Something went wrong',
            description: 'Confirmation must match the password',
        });

        try {
            const data = await resetPasswordF(query, password, confirmPassword);

            if (data.success) notification.success({
                message: 'Success',
                description: 'Reset password successfully.',
            });
        } catch (err) {
            if (err instanceof APIError) return notification.error({
                message: 'Something went wrong',
                description: err.message,
            });
        }
    };

    if (user) return null;

    return !valid ? <h1>invalid key</h1> : (
        <div className={styles.container}>
            <main className={styles.main}>
                <Form form={form}>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Provide a valid password',
                                min: 5,
                            },
                        ]}
                    >
                        <Input.Password
                            onChange={(val) => setInput('password', val.target.value)}
                            size="large"
                            placeholder="New Password"
                            prefix={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Provide a valid confirmation',
                                min: 5,
                            },
                        ]}
                    >
                        <Input.Password
                            onChange={(val) => setInput('confirmPassword', val.target.value)}
                            size="large"
                            placeholder="Confirm Password"
                            prefix={<RedoOutlined />}
                        />
                    </Form.Item>

                    <Button block size="large" onClick={resetPassword}>
                        Reset Password
                    </Button>
                </Form>
            </main>
        </div>
    );
}

export async function getServerSideProps(context: { query: { key: string; }; }) {
    let valid = true;

    try {
        await Axios.get(`${process.env.BACKEND_URL}/auth/password_resets/${context.query.key}`);
    } catch (err) {
        valid = false;
    }

    return {
        props: {
            valid,
            query: context.query.key ? context.query.key : null,
        },
    };
};
