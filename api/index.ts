import Axios, { Method } from 'axios';

/**
 * Send a register request.
 * @param {string} username The user's username
 * @param {string} password The user's password.
 * @param {string} email The email to register with.
 * @param {string} invite The invite to register with.
 */
async function register(username: string, password: string, email: string, invite: string) {
    try {
        const { data } = await Axios.post(`${process.env.BACKEND_URL}/auth/register`, {
            username,
            password,
            email,
            invite,
        }, {
            withCredentials: true,
        });

        return data;
    } catch (err) {
        err = err.response.data.error;

        throw new APIError(
            `${err.charAt(0).toUpperCase() + err.slice(1)}.`
        );
    }
}

/**
 * Send a password reset email to a user.
 * @param {string} email The email to send a reset to.
 */
async function sendPasswordReset(email: string) {
    try {
        const { data } = await Axios.post(`${process.env.BACKEND_URL}/auth/password_resets/send`, {
            email,
        }, {
            withCredentials: true,
        });

        return data;
    } catch (err) {
        err = err.response.data.error;

        throw new APIError(
            `${err.charAt(0).toUpperCase() + err.slice(1)}.`
        );
    }
}

/**
 * Reset a user's password.
 * @param {string} key The password reset key.
 * @param {string} password The password.
 * @param {string} confirmPassword The password confirmation.
 */
async function resetPassword(key: string, password: string, confirmPassword: string) {
    try {
        const { data } = await Axios.post(`${process.env.BACKEND_URL}/auth/password_resets/reset`, {
            key,
            password,
            confirmPassword,
        });

        return data;
    } catch (err) {
        err = err.response.data.error;

        throw new APIError(
            `${err.charAt(0).toUpperCase() + err.slice(1)}.`
        );
    }
}

/**
 * The class for api errors.
 */
export class APIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * The api class.
 */
export default class API {
    /**
     * The user's access token.
     */
    accessToken: string;

    constructor() {
        this.accessToken;
    }

    /**
     * Send a request to the api.
     * @param {object} param0 The request data.
     */
    async request({ endpoint, method, body, headers }: {
      endpoint: string;
      method: Method;
      body?: object;
      headers?: object;
    }) {
        try {
            const baseUrl = process.env.BACKEND_URL;

            const { data } = await Axios({
                url: `${baseUrl}${endpoint}`,
                method,
                data: body ? body: null,
                headers: {
                    ...headers,
                    'x-access-token': `Bearer ${this.accessToken}`,
                },
                withCredentials: true,
            });

            return data;
        } catch (err) {
            err = err.response.data.error;

            throw new APIError(
                `${err.charAt(0).toUpperCase() + err.slice(1)}.`
            );
        }
    }

    /**
     * Get a user's refresh token.
     */
    async refreshToken() {
        const data = await this.request({
            endpoint: '/auth/token',
            method: 'POST',
        });

        this.accessToken = data.accessToken;

        return data;
    }

    /**
     * Send a login request.
     * @param {string} username The user's username.
     * @param {string} password The user's password.
     */
    async login(username: string, password: string) {
        const data = await this.request({
            endpoint: '/auth/login',
            method: 'POST',
            body: {
                username,
                password,
            },
        });

        this.accessToken = data.accessToken;

        return data;
    }

    /**
     * Logout of the site.
     */
    async logout() {
        return await this.request({
            endpoint: '/auth/logout',
            method: 'GET',
        });
    }

    /**
     * Get all of the user's images, plus storage used.
     */
    async getImages() {
        return await this.request({
            endpoint: '/users/@me/images',
            method: 'GET',
        });
    }

    /**
     * Regen a user's key.
     */
    async regenKey() {
        return await this.request({
            endpoint: '/users/@me/regen_key',
            method: 'POST',
        });
    }

    /**
     * Get all of the user's created invites.
     */
    async getInvites() {
        return await this.request({
            endpoint: '/users/@me/created_invites',
            method: 'GET',
        });
    }

    /**
     * Create a invite.
     */
    async createInvite() {
        return await this.request({
            endpoint: '/invites',
            method: 'POST',
        });
    }

    /**
     * Delete a file.
     * @param {string} id The filename.
     */
    async deleteImage(id: string) {
        return await this.request({
            endpoint: `/files/${id}`,
            method: 'DELETE',
        });
    }

    /**
     * Get all of the domains.
     */
    async getDomains() {
        return await this.request({
            endpoint: '/domains',
            method: 'GET',
        });
    }

    /**
     * Update a user's domain settings.
     * @param {{ domain: string, subdomain: string }} param0 The domain.
     */
    async saveDomain({ domain, subdomain }: { domain: string; subdomain: string | null; }) {
        return await this.request({
            endpoint: '/users/@me/settings/domain',
            method: 'PUT',
            body: {
                domain,
                subdomain,
            },
        });
    }

    /**
     * Update a user's upload preferences.
     * @param {any} data The request body.
     */
    async updateSettings(data: any) {
        return await this.request({
            endpoint: '/users/@me/settings/preferences',
            method: 'PUT',
            body: data,
        });
    }

    /**
     * Update a user's auto-wipe interval.
     * @param {number} value The new interval.
     */
    async setWipeInterval(value: number) {
        return await this.request({
            endpoint: '/users/@me/settings/wipe_interval',
            method: 'PUT',
            body: {
                value,
            },
        });
    }
    /**
     * Update a user's fake url.
     * @param {string} url The new url.
     */
    async setFakeUrl(url: string) {
        return await this.request({
            endpoint: '/users/@me/settings/fakeUrl',
            method: 'PUT',
            body: {
                url,
            },
        });
    }

    /**
     * Update a user's embed settings.
     * @param {object} param0 The user's embed settings.
     */
    async updateEmbed({ color, title, description, author, randomColor }:
      { color: string; title: string; description: string; author: string; randomColor: boolean; }) {
        return await this.request({
            endpoint: '/users/@me/settings/embed',
            method: 'PUT',
            body: {
                color,
                title,
                description,
                author,
                randomColor,
            },
        });
    }

    /**
     * Add a custom domain to dny.
     * @param {string} name The domain name.
     * @param {boolean} wildcard Whether or not the domain should be wildcarded.
     * @param {boolean} userOnly Whether or not the domain should only be useable by the donator.
     */
    async addDomain(name: string, wildcard: boolean, userOnly: boolean) {
        return await this.request({
            endpoint: '/domains/custom',
            method: 'POST',
            body: {
                name,
                wildcard,
                userOnly,
            },
        });
    }

    /**
     * Add a random domain to the array.
     * @param {string} domain The domain to add.
     */
    async addRandomDomain(domain: string) {
        return await this.request({
            endpoint: '/users/@me/settings/random_domain',
            method: 'POST',
            body: {
                domain,
            },
        });
    }

    /**
     * Delete a random domain from the array.
     * @param {string} domain The domain to delete.
     */
    async deleteRandomDomain(domain: string) {
        return await this.request({
            endpoint: '/users/@me/settings/random_domain',
            method: 'DELETE',
            body: {
                domain,
            },
        });
    }

    /**
     * Get all of the user's shortened urls.
     */
    async getShortenedUrls() {
        return await this.request({
            endpoint: '/shortener/urls',
            method: 'GET',
        });
    }

    /**
     * Shorten a url.
     * @param {string} url The url to shorten.
     * @param {boolean} longUrl Whether or not the url should be long.
     * @param {string} key The user's key.
     *  @param {string} domain The user's key.
     */
    async shortenUrl(url: string, longUrl: boolean, key: string, domain: string) {
        return await this.request({
            endpoint: '/shortener',
            method: 'POST',
            body: {
                url,
            },
            headers: {
                key,
                longUrl,
                domain,
            },
        });
    }

    /**
     * Delete a short url.
     * @param {string} deletionKey The deletion key.
     */
    async deleteShortUrl(deletionKey: string) {
        return await this.request({
            endpoint: `/shortener/delete?key=${deletionKey}`,
            method: 'GET',
        });
    }

    /**
     * Wipe the user's files.
     */
    async wipeFiles() {
        return await this.request({
            endpoint: '/files/wipe',
            method: 'POST',
        });
    }

    /**
     * Disable a user's account.
     */
    async disableAccount() {
        return await this.request({
            endpoint: '/users/@me/disable',
            method: 'POST',
        });
    }

    /**
     * Change a user's username.
     * @param {string} username The new username.
     * @param {string} password The current password.
     */
    async changeUsername(username: string, password: string) {
        return await this.request({
            endpoint: '/users/@me/change_username',
            method: 'PUT',
            body: {
                username,
                password,
            },
        });
    }

    /**
     * Change a user's password.
     * @param {string} newPassword The user's new password.
     * @param {string} password The user's current password.
     */
    async changePassword(newPassword: string, password: string) {
        return await this.request({
            endpoint: '/users/@me/change_password',
            method: 'PUT',
            body: {
                newPassword,
                password,
            },
        });
    }

    /**
     * Get a user's profile via their uid.
     * @param {string} uid The user's uid.
     */
    async getUserProfile(uid: string) {
        return await this.request({
            endpoint: `/users/profile/${uid}`,
            method: 'GET',
        });
    }
};

export {
    register,
    sendPasswordReset,
    resetPassword
};
