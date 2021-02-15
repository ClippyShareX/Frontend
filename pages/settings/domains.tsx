import React, { useEffect } from 'react';
import { useUser } from '../../components/user';
import { useRouter } from 'next/router';
import Verify from '../../components/verify';
import DomainsC from '../../components/domains';

export default function Domains() {
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        if (!user) {
            router.push('/');
        }
    }, []);

    if (!user) return null;

    return user.discord.id ? <DomainsC /> : <Verify />;
}
