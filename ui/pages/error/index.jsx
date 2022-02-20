/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router';
import { useLayoutEffect, useState } from 'react';
import styles from './Error.module.scss';

const Error = () => {
    const router = useRouter();
    const { query } = router;

    const [content, setContent] = useState('');

    useLayoutEffect(() => {
        onLoadErrorContent();
    }, [query]);

    const onLoadErrorContent = () => {
        const encoded_content = query?.content;
        setContent(decodeURIComponent(encoded_content));
    };

    return (
        <div className={styles.root}>
            <div className={styles.root__error}>Error</div>
            <div className={styles.root__content}>{content}</div>
        </div>
    );
};

export default Error;
