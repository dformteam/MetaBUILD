/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from './Publish.module.scss';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
// import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Notify from '../../../components/Notify';
import { utils } from 'near-api-js';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 600,
    bgcolor: '#fff',
    borderRadius: '24px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
};

const Publish = () => {
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;
    const [status, setStatus] = useState('private');
    // const [focus, setFocus] = useState(false);
    const [open, setOpen] = useState(false);
    const [free, setFree] = useState(true);
    const [fee, setFee] = useState('0');
    const [participant, setParticipant] = useState(0);
    const [black_list, setBlackList] = useState([]);
    const [white_list, setWhiteList] = useState([]);
    const [start_date, setStartDate] = useState('');
    const [black_account, setBlackAccount] = useState('');
    const [white_account, setWhiteAccount] = useState('');
    const [end_date, setEndDate] = useState('');
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [sharedLink, setSharedLink] = useState('');

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    useEffect(() => {
        onGetFormDetail();
        return () => {
            localStorage.removeItem('myForms');
        };
    }, []);

    const onGetFormDetail = () => {
        const { contract, walletConnection } = wallet;
        const { id } = query;
        let content = '';
        let encoded_content = encodeURIComponent(content);
        if (id === null || id === '' || typeof id === 'undefined') {
            content = 'Could not found any object have that id!';
            router.push(`/error?content=${encoded_content}`);
        }
        contract
            ?.get_form?.({
                id: id,
            })
            .then((res) => {
                if (res) {
                    const { owner } = res;
                    const userId = walletConnection.getAccountId();
                    if (userId !== owner) {
                        content = 'You do not have permssion to edit this form!';
                    }

                    if (res.status !== 0) {
                        content = 'Form has been published before!';
                    }

                    if (content !== '') {
                        encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const aStatus = [
        { id: 'private', title: 'PRIVATE FORM', sub: 'Only available to invited people' },
        { id: 'public', title: 'PUBLIC FORM', sub: 'Available to everyone' },
        // { id: 'share', title: 'SHARE FORM AS A TEMPLATE', sub: 'Share your form as a template ' },
    ];

    const onStatusItemClick = (item) => {
        setStatus(item.id);
        if (item.id === 'share') {
            setOpen(true);
        }
    };

    const onCloseModalShare = () => {
        setOpen(false);
    };

    // const onInputEmailFocus = () => {
    //     setFocus(true);
    // };

    // const onCloseInputEmail = () => {
    //     setFocus(false);
    // };

    const onFeeChange = (e) => {
        setFee(e.target.value);
    };

    const onStartingDateChange = (e) => {
        const date = new Date(e.target.value);
        setStartDate(date.getTime().toString());
    };

    const onEndingDateChange = (e) => {
        const date = new Date(e.target.value);
        setEndDate(date.getTime().toString());
    };

    const onBlackListChange = (e) => {
        setBlackAccount(e.target.value);
    };

    const onAddToBlackList = () => {
        if (black_account === '') {
            onShowResult({
                type: 'error',
                msg: 'Black list account could not be empty',
            });
            return;
        }
        if (white_list.includes(black_account)) {
            onShowResult({
                type: 'error',
                msg: 'This account has been already defined in white list',
            });
            return;
        }

        onShowResult({
            type: 'success',
            msg: `Added ${black_account} into black list`,
        });
        black_list.push(black_account);
        setBlackList([...black_list]);
        setBlackAccount('');
    };

    const onWhiteListChange = (e) => {
        setWhiteAccount(e.target.value);
    };

    const onAddToWhiteList = () => {
        if (white_account === '') {
            onShowResult({
                type: 'error',
                msg: 'White list account could not be empty',
            });
            return;
        }
        if (black_list.includes(white_account)) {
            onShowResult({
                type: 'error',
                msg: 'This account has been already defined in black list',
            });
            return;
        }

        onShowResult({
            type: 'success',
            msg: `Added ${white_account} into white list`,
        });
        white_list.push(white_account);
        setWhiteList([...white_list]);
        setWhiteAccount('');
    };

    const onGetSharedLink = () => {
        navigator.clipboard.writeText(sharedLink);
        onShowResult({
            type: 'success',
            msg: 'copied',
        });
    };

    const onPublishForm = () => {
        if (!onValidate()) {
            return;
        }

        const { contract } = wallet;
        let black_list_set = new Set(black_list);
        let white_list_set = new Set(white_list);
        let enroll_fee = fee;
        const { id } = query;

        if (status.id === 'public') {
            black_list_set = new Set();
            white_list_set = new Set();
            enroll_fee = 0;
        }

        setOpenLoading(true);

        let yocto_enroll_fee = utils.format.parseNearAmount(`${enroll_fee}`);
        // console.log(yocto_enroll_fee);

        contract
            ?.publish_form?.({
                formId: id,
                limit_participants: parseInt(participant || 0),
                enroll_fee: yocto_enroll_fee,
                start_date,
                end_date,
                black_list: [...black_list_set],
                white_list: [...white_list_set],
            })
            .then((res) => {
                if (res) {
                    const uri = new URL(window.location.href);
                    const { origin } = uri;
                    setSharedLink(`${origin}/form/form-answer?id=${id}`);
                    onShowResult({
                        type: 'success',
                        msg: 'Form has been published',
                    });
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Somethings went wrong, please try again!',
                    });
                }
            })
            .catch((err) => {
                onShowResult({
                    type: 'error',
                    msg: String(err),
                });
            });
    };

    const onValidate = () => {
        if (fee < 0) {
            onShowResult({
                type: 'error',
                msg: 'enroll fee could be negative',
            });
            return false;
        }

        if (participant < 0) {
            onShowResult({
                type: 'error',
                msg: 'limited participant could be negative',
            });
            return false;
        }

        if (start_date === '' || typeof start_date === 'undefined' || start_date === null) {
            onShowResult({
                type: 'error',
                msg: 'starting time could not be empty',
            });
            return false;
        }

        if (end_date === '' || typeof end_date === 'undefined' || end_date === null) {
            onShowResult({
                type: 'error',
                msg: 'ending date could not be empty',
            });
            return false;
        }

        if (end_date < start_date) {
            onShowResult({
                type: 'error',
                msg: 'ending date could not less than starting date',
            });
            return false;
        }

        const cTime = Date.now();
        if (end_date < cTime) {
            onShowResult({
                type: 'error',
                msg: 'ending date could not less than current time',
            });
            return false;
        }
        return true;
    };

    const renderStatus = () => {
        switch (status) {
            case 'private':
                return (
                    <div className={styles.publish_title_button}>
                        <LockOutlinedIcon className={styles.icon_lock} />
                        Private Form
                    </div>
                );
            case 'public':
                return (
                    <div className={styles.publish_title_button_public}>
                        <LockOpenOutlinedIcon className={styles.icon_lock} />
                        Public Form
                    </div>
                );
            case 'share':
                return (
                    <div className={styles.publish_title_button_share}>
                        <ShareOutlinedIcon className={styles.icon_lock} />
                        SHARE FORM AS A TEMPLATE
                    </div>
                );

            default:
                break;
        }
    };

    const renderActiveStatus = (id) => {
        if (status === id) {
            let tmp = 'publish_status_content_active_' + id;
            return styles[tmp];
        }
    };

    const onParticipantChange = (e) => {
        setParticipant(e.target.value);
    };

    const onGoBack = () => {
        router.back();
    };

    const onDeleteBlackItem = (chipToDelete) => {
        setBlackList([...black_list.filter((chip) => chip !== chipToDelete)]);
    };

    const onDeleteWhiteItem = (chipToDelete) => {
        setWhiteList([...white_list.filter((chip) => chip !== chipToDelete)]);
    };

    const ListItem = styled('div')(({ theme }) => ({
        margin: theme.spacing(1),
    }));

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.publish_content}>
                    <div className={styles.publish_title}>
                        <div className={styles.publish_title_text}>Publish Form</div>
                        <div className={styles.publish_title_status}>{renderStatus()}</div>
                        {sharedLink === '' && (
                            <div className={styles.publish_button_area}>
                                <button className={styles.publish_button} onClick={onPublishForm}>
                                    Publish
                                </button>
                            </div>
                        )}
                        {sharedLink !== '' && (
                            <div className={styles.publish_button_area}>
                                <button className={styles.publish_button} onClick={onGoBack}>
                                    Go back
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.line} />
                    {sharedLink !== '' && (
                        <>
                            <div className={styles.publish_share_label}>Link to share:</div>
                            <div className={styles.publish_row}>
                                <LinkOutlinedIcon className={styles.publish_icon_link} />
                                <div className={styles.publish_link_input}>{sharedLink}</div>
                                <div className={styles.publish_link_copy} onClick={onGetSharedLink}>
                                    Copy link
                                </div>
                            </div>
                        </>
                    )}
                    {aStatus.map((item, index) => {
                        return (
                            <div
                                className={styles.publish_status_content + ' ' + renderActiveStatus(item.id)}
                                onClick={() => onStatusItemClick(item)}
                                key={index}
                            >
                                <div className={styles.publish_status_title}>{item.title}</div>
                                <div className={styles.publish_status_sub}>{item.sub}</div>
                                {status === item.id && <CheckCircleIcon className={styles.publish_icon_check} />}
                            </div>
                        );
                    })}
                    <div className={styles.publish_row_input} style={{ height: status === 'private' ? 64 : 0 }}>
                        <input className={styles.publish_black_input} value={black_account} onChange={onBlackListChange} placeholder={'Enter black list'} />
                        <div className={styles.publish_black_button} onClick={onAddToBlackList}>
                            Add to Black List
                        </div>
                        <input className={styles.publish_black_input} value={white_account} onChange={onWhiteListChange} placeholder={'Enter white list'} />
                        <div className={styles.publish_white_button} onClick={onAddToWhiteList}>
                            Add to White List
                        </div>
                    </div>
                    <div className={styles.publish_fee_row + ' ' + styles.margin_top}>
                        <div className={styles.publish_fee_label}>Limit participant</div>
                        <input
                            className={styles.publish_fee_input}
                            type={'number'}
                            onChange={onParticipantChange}
                            placeholder={`Leave blank if you don't want to the limitation`}
                        />
                    </div>
                    <div className={styles.publish_fee_row}>
                        <div className={styles.publish_fee_label}>Joining Fee</div>
                        <button className={free ? styles.publish_fee_button_active : styles.publish_fee_button} onClick={() => setFree(true)}>
                            Free
                        </button>
                        <button className={!free ? styles.publish_fee_button_active : styles.publish_fee_button} onClick={() => setFree(false)}>
                            Paid
                        </button>
                        {!free && (
                            <input
                                className={styles.publish_fee_input}
                                type={'number'}
                                onChange={onFeeChange}
                                placeholder={'The amount need to be paid by a participant'}
                            />
                        )}
                    </div>
                    <div className={styles.publish_fee_row}>
                        <div className={styles.publish_fee_label}>Starting time</div>
                        <input className={styles.publish_fee_input_date} type={'datetime-local'} onChange={onStartingDateChange} />
                        <div className={styles.publish_fee_label_paid}>Ending time</div>
                        <input className={styles.publish_fee_input_date} type={'datetime-local'} onChange={onEndingDateChange} />
                    </div>
                    {/* <div className={styles.publish_invite}>INVITE BY NEAR ACCOUNT</div>
                    <div className={styles.publish_invite_content}>
                        <EmailOutlinedIcon className={styles.publish_invite_email_icon} />
                        <div className={styles.publish_invite_label}>To:</div>
                        <input className={styles.publish_invite_input} placeholder={'Enter Near account to send invitation'} onFocus={onInputEmailFocus} />
                    </div>
                    <div className={styles.publish_invite_onfocus} style={{ height: focus ? 225 : 0 }}>
                        <textarea className={styles.publish_invite_message} rows={5} placeholder={'Add an invitation message'} />
                        <div className={styles.publish_invite_row_button}>
                            <button className={styles.publish_invite_button} onClick={onCloseInputEmail}>
                                Cancel
                            </button>
                            <button className={styles.publish_invite_button_send}>Send invitation</button>
                        </div>
                    </div> */}
                </div>
                {status === 'private' && (
                    <div className={styles.list}>
                        <div className={styles.list_label}>Black list:</div>
                        <div className={styles.list_content}>
                            {black_list?.length > 0 ? (
                                <>
                                    {black_list.map((data) => {
                                        return (
                                            <ListItem key={data}>
                                                <Chip label={data} onDelete={() => onDeleteBlackItem(data)} variant="outlined" color="error" />
                                            </ListItem>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className={styles.list_nothing}>Nothing to display</div>
                            )}
                        </div>
                        <div className={styles.list_label}>White list:</div>
                        <div className={styles.list_content}>
                            {white_list?.length > 0 ? (
                                <>
                                    {white_list.map((data) => {
                                        return (
                                            <ListItem key={data}>
                                                <Chip label={data} onDelete={() => onDeleteWhiteItem(data)} variant="outlined" color="success" />
                                            </ListItem>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className={styles.list_nothing}>Nothing to display</div>
                            )}
                        </div>
                    </div>
                )}

                <Modal open={open} onClose={onCloseModalShare} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Share form as template
                        </Typography>
                        <div className={styles.publish_modal_content}>
                            <div className={styles.publish_modal_row}>
                                <div className={styles.publish_modal_label}>Template Title</div>
                                <input className={styles.publish_modal_input} placeholder={'Enter title here'} />
                            </div>
                            <div className={styles.publish_modal_row}>
                                <div className={styles.publish_modal_label}>Description</div>
                                <textarea className={styles.publish_modal_textarea} rows={5} placeholder={'Enter description here'} />
                            </div>
                            <div className={styles.publish_invite_row_button}>
                                <button className={styles.publish_modal_button} onClick={onCloseModalShare}>
                                    Cancel
                                </button>
                                <button className={styles.publish_modal_button_share}>Share</button>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default Publish;
