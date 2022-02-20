import React, { useState, useEffect, useRef, Fragment } from 'react';
import styles from './Account.module.scss';
import { useSelector } from 'react-redux';
import { Popover } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import EventIcon from '@mui/icons-material/Event';
import { useRouter } from 'next/router';

const UserAccount = () => {
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const aMenu = [
        { id: 'my-form', label: 'My Form', icon: AssignmentOutlinedIcon, router: '/form/my-form' },
        { id: 'my-event', label: 'My Event', icon: EventIcon, router: '/event/my-event' },
        { id: 'my-calendar', label: 'My Calendar', icon: DateRangeOutlinedIcon, router: '/calendar' },
    ];
    const wrapperRef = useRef(null);

    const [popoverVisible, setPopoverVisible] = useState(false);

    useEffect(() => {
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, []);

    const handleClick = (event) => {
        const { target } = event;
        if (wrapperRef.current && !wrapperRef.current.contains(target)) {
            setPopoverVisible(false);
        }
    };

    const onNavItemClick = (route) => {
        setPopoverVisible(false);
        router.push(route);
    };

    const [state, setState] = useState({
        anchorEl: null,
        popoverOpen: false,
        popoverId: undefined,
    });
    const onRequestConnectWallet = () => {
        const { nearConfig, walletConnection } = wallet;
        walletConnection?.requestSignIn?.(nearConfig?.contractName);
    };

    const onRequestSignOut = () => {
        const { walletConnection } = wallet;
        walletConnection.signOut();
        router.push('/');
    };

    const onRenderSignInButton = () => {
        return (
            <div className={styles.signIn_area}>
                <button className={styles.signIn_button} onClick={onRequestConnectWallet}>
                    Connect the wallet
                </button>
            </div>
        );
    };

    const onOpenAccountPopover = (e) => {
        setPopoverVisible(false);
        setPopoverVisible(!popoverVisible);
    };

    const onCloseAccountPopover = () => {
        setState({
            anchorEl: null,
            popoverOpen: false,
            popoverId: undefined,
        });
    };

    const onRenderAccountDetail = () => {
        const { walletConnection } = wallet;
        const { anchorEl, popoverOpen, popoverId } = state;
        const accountId = walletConnection?.getAccountId?.();
        let popoverRight = 1000;
        if (typeof window !== 'undefined') {
            popoverRight = window?.screen?.width - 15;
        }
        return (
            <div className={styles.signIn_area} ref={wrapperRef}>
                <button className={styles.account_button} onClick={onOpenAccountPopover}>
                    <AccountCircleIcon className={styles.account_button_icon} />
                    <div className={styles.account_button_accountId_area}>{accountId}</div>
                    <ArrowDropDownIcon className={styles.account_button_drop_icon} />
                </button>
                {popoverVisible && (
                    <div className={styles.account_popover}>
                        {aMenu.map((item, index) => {
                            return (
                                <Fragment key={index}>
                                    <div className={styles.account_popover_label} onClick={() => onNavItemClick(item.router)}>
                                        <item.icon className={styles.account_popover_icon} />
                                        {item.label}
                                    </div>
                                    <div className={styles.line} />
                                </Fragment>
                            );
                        })}
                        <div className={styles.account_popover_label} onClick={onRequestSignOut}>
                            <LogoutSharpIcon className={styles.account_popover_icon} />
                            Log out
                        </div>
                    </div>
                )}
                <Popover
                    id={popoverId}
                    open={popoverOpen}
                    anchorEl={anchorEl}
                    onClose={onCloseAccountPopover}
                    anchorReference="anchorPosition"
                    anchorPosition={{ top: 70, left: popoverRight }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    className={styles.popover_container}
                >
                    <div className={styles.signOut_area}>
                        <button className={styles.signOut_button} onClick={onRequestSignOut}>
                            <LogoutSharpIcon className={styles.signOut_button_icon} />
                            <div className={styles.signOut_button_content}>Logout</div>
                        </button>
                    </div>
                </Popover>
            </div>
        );
    };

    const onRenderScene = () => {
        const { walletConnection } = wallet;
        const isSigned = walletConnection?.isSignedIn?.();
        if (isSigned) {
            return onRenderAccountDetail();
        }
        return onRenderSignInButton();
    };

    return <div className={styles.root}>{onRenderScene()}</div>;
};

export default UserAccount;
