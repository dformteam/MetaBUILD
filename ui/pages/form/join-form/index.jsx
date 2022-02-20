/* eslint-disable react-hooks/exhaustive-deps */
import styles from './JoinForm.module.scss';
import { utils } from 'near-api-js';
import { useRouter } from 'next/router';
import { useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import Notify from '../../../components/Notify';

const JoinForm = () => {
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;

    const [form, setForm] = useState({});

    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    useLayoutEffect(() => {
        onGetFormDetail();
    }, []);

    const onGetFormDetail = () => {
        const { contract, walletConnection } = wallet;
        const { id } = query;

        if (!walletConnection.isSignedIn()) {
            return redirectError('Please login to your wallet first');
        }

        if (id === null || id === '' || typeof id === 'undefined') {
            return redirectError('Could not found any object have that id!');
        }

        contract
            ?.get_form?.({
                id,
            })
            .then((res) => {
                if (res) {
                    const { start_date, end_date, participants, limit_participants, owner } = res;
                    const content = '';
                    const currentTimestamp = Date.now().toString();
                    if (0 === owner) {
                        return redirectError('This form has not been published!');
                    } else if (currentTimestamp > end_date) {
                        return redirectError('This form has been ended');
                    } else if (currentTimestamp < start_date) {
                        return redirectError('This form has not been started');
                    } else if (limit_participants > 0 && participants?.length >= limit_participants) {
                        return redirectError('This form has been reached the limitation of participant ');
                    }

                    if (content !== '') {
                        const encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }

                    setForm(res);
                    getParticipantFormDetail();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const getParticipantFormDetail = () => {
        const { contract, walletConnection } = wallet;
        const { id } = query;

        if (!walletConnection.isSignedIn()) {
            return redirectError('Please login to your wallet first');
        }

        const userId = walletConnection.getAccountId();

        if (id === null || id === '' || typeof id === 'undefined') {
            return redirectError('Could not found any object have that id!');
        }

        contract
            ?.get_participant_form_status?.({
                userId,
                formId: id,
            })
            .then((res) => {
                if (res && res.joined) {
                    router.push(`/form/form-answer?id=${id}`);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onJoinForm = () => {
        const { contract } = wallet;
        const { id } = query;
        const { enroll_fee: fee } = form;
        setOpenLoading(true);

        if (fee === '0') {
            contract
                ?.join_form(
                    {
                        formId: id,
                    },
                    100000000000000,
                )
                .then((res) => {
                    if (res) {
                        router.push(`/form/form-answer?id=${id}`);
                    } else {
                        onShowResult({
                            type: 'error',
                            msg: 'Somethings went wrong, try again later!',
                        });
                    }
                })
                .catch((err) => {
                    onShowResult({
                        type: 'error',
                        msg: String(err),
                    });
                });
        } else if (fee !== '0') {
            // const yoctoNear = utils.format.parseNearAmount(`${fee}`);
            contract
                ?.join_form(
                    {
                        formId: id,
                    },
                    100000000000000,
                    fee,
                )
                .then((res) => {
                    if (res) {
                        router.push(`/form/form-answer?id=${id}`);
                    } else {
                        onShowResult({
                            type: 'error',
                            msg: 'Somethings went wrong, try again later!',
                        });
                    }
                })
                .catch((err) => {
                    onShowResult({
                        type: 'error',
                        msg: 'Somethings went wrong, try again later!',
                    });
                });
        }
    };

    const redirectError = (content) => {
        const encoded_content = encodeURIComponent(content);
        router.push(`/error?content=${encoded_content}`);
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.content}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Form Detail
                    </Typography>
                    <div className={styles.form_row}>
                        <div className={styles.form_label}>Name</div>
                        <div className={styles.form_input}>{form.title}</div>
                    </div>
                    <div className={styles.form_row}>
                        <div className={styles.form_label}>Description</div>
                        <div className={styles.form_input}>{form.description}</div>
                    </div>
                    <div className={styles.fee_row}>
                        <div className={styles.fee_label}>Joining Fee</div>
                        <div className={styles.fee_input}>
                            {form?.enroll_fee !== '0' ? utils.format.formatNearAmount(form?.enroll_fee || 0) + ' Ⓝ' : 'FREE'}
                        </div>
                    </div>
                    <div className={styles.fee_row}>
                        <div className={styles.fee_label}>Starting time</div>
                        <input
                            className={styles.fee_input_date}
                            disabled
                            type={'datetime-local'}
                            value={new Date(parseInt(form?.start_date || 0)).toISOString().replace('Z', '')}
                        />
                        <div className={styles.fee_label_paid}>Ending time</div>
                        <input
                            className={styles.fee_input_date}
                            disabled
                            type={'datetime-local'}
                            value={new Date(parseInt(form?.end_date || 0)).toISOString().replace('Z', '')}
                        />
                    </div>
                    <div className={styles.form_row_button}>
                        <button className={styles.form_create_button} onClick={onJoinForm}>
                            Join form
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JoinForm;
