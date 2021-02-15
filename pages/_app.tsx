import { User } from '../typings';
import { useEffect, useState } from 'react';
import { UserProvider } from '../components/user';
import API from '../api';
import Loading from '../components/loading';
import '../styles/antd.less';
import '../styles/globals.less';

export default function App({ Component, pageProps }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>(null);

    useEffect(() => {
        const refreshToken = async () => {
            try {
                const api = new API();
                const data = await api.refreshToken();
                const { images, storageUsed } = await api.getImages();
                const { invites } = await api.getInvites();
                const { domains } = await api.getDomains();
                const { urls } = await api.getShortenedUrls();

                data.user['domains'] = domains;
                data.user['images'] = images;
                data.user['storageUsed'] = storageUsed;
                data.user['createdInvites'] = invites;
                data.user['shortenedUrls'] = urls;
                data.user['accessToken'] = data.accessToken;
                data.user['api'] = api;

                setUser(data.user);

                setTimeout(() => {
                    setLoading(false);
                }, 500);

                setTimeout(() => {
                    refreshToken();
                }, 780000);
            } catch (err) {
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        };

        if (!user) refreshToken();
    }, []);

    return loading ? <Loading /> : (
        <UserProvider value={{ user, setUser }}>
            <Component {...pageProps} />
        </UserProvider>
    );
}
