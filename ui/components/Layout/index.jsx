import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../Header';
import styles from './Layout.module.scss';

const Layout = (props) => {
    const [scrolling, setScrolling] = useState(false);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleScroll = () => {
        if (window.scrollY === 0) {
            setScrolling(false);
        }
        if (window.scrollY !== 0) {
            setScrolling(true);
        }
    };

    const { children } = props;

    return (
        <div className={styles.root}>
            <Head {...props}>
                <title>Decentralize Form</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=DM+Sans&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
                <link rel="icon" href="/logo.png" />
            </Head>
            <div className={styles.header} style={scrolling ? { background: '#fff' } : null}>
                <Header />
            </div>
            <div className={styles.body}>
                <div className={styles.main}>{children}</div>
                {/* <div className={styles.footer}>
                    <Footer />
                </div> */}
            </div>
        </div>
    );
};

export default Layout;
