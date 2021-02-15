import React, { useEffect } from 'react';
import { useUser } from '../../components/user';
import { useRouter } from 'next/router';
import Verify from '../../components/verify';
import ShortenC from '../../components/tools/shorten';

export default function Shorten() {
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, []);

    if (!user) return null;

    return user.discord.id ? <ShortenC /> : <Verify />;
}
