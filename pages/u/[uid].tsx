import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../components/user';
import Verify from '../../components/verify';
import ProfileC from '../../components/profile';

export default function Profile() {
    const router = useRouter();
    const { user } = useUser();
    const { uid } = router.query;

    const [userProfile, setUserProfile] = useState(null);

    const getUser = async () => {
        try {
            const data = await user.api.getUserProfile(uid as string);

            if (data.success) setUserProfile(data.user);
        } catch (err) {
            router.push('/dashboard');
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/');
        }

        getUser();
    }, []);

    if (!user || !userProfile) return null;

    return user.discord.id ? <ProfileC userProfile={userProfile} /> : <Verify />;
}
