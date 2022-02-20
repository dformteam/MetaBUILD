import React from 'react';
import styles from './Header.module.scss';
import Account from '../Account';
import NavItem from '../NavItem';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EventIcon from '@mui/icons-material/Event';
import { withRouter, useRouter } from 'next/router';
import Image from 'next/image';
import Logo from './lnc.svg';

const Header = (props) => {
    const router = useRouter();

    const getActiveClassName = () => {
        const { router } = props;
        return router.pathname;
    };
    const cPath = getActiveClassName();

    const onLogoClick = () => {
        router.push('/');
    };

    return (
        <div className={styles.root}>
            <div className={styles.nav}>
                <div className={styles.logo_text} onClick={onLogoClick}>
                    dSuite
                    <FiberManualRecordIcon className={styles.logo_dot} />
                    <div className={styles.line} />
                    <div className={styles.logo_lnc}>
                        <Image src={Logo} layout="fill" alt={'Error'} priority={true} />
                    </div>
                </div>
                <div className={styles.nav_item}>
                    <NavItem
                        icon={<SummarizeOutlinedIcon className={styles.nav_icon} />}
                        content={'FORM'}
                        href={'/form'}
                        actived={cPath.indexOf('/form') === 0}
                    />
                </div>
                <div className={styles.nav_item}>
                    <NavItem icon={<EventIcon className={styles.nav_icon} />} content={'EVENT'} href={'/event'} actived={cPath.indexOf('/event') === 0} />
                </div>
                <div className={styles.nav_item}>
                    <NavItem
                        icon={<DateRangeOutlinedIcon className={styles.nav_icon} />}
                        content={'CALENDAR'}
                        href={'/calendar'}
                        actived={cPath.indexOf('/calendar') === 0}
                    />
                </div>
            </div>
            <div className={styles.account}>
                <Account />
            </div>
        </div>
    );
};

export default withRouter(Header);
