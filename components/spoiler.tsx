import React, { useState } from 'react';
import { notification } from 'antd';
import { useUser } from './user';

export default function Spoiler() {
    const { user } = useUser();
    const [hovering, setHovering] = useState(false);

    return (
        <span
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
                notification.success({
                    message: 'Success',
                    description: 'Copied key to clipboard.',
                });

                navigator.clipboard.writeText(user.key);
            }}
            style={
                hovering ? {
                    wordBreak: 'break-all',
                    transitionDuration: '0.2s',
                    cursor: 'pointer',
                } : {
                    wordBreak: 'break-all',
                    transitionDuration: '0.2s',
                    cursor: 'pointer',
                    filter: 'blur(4px)',
                }
            }
        >
            {user.key}
        </span>
    );
}
