/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import styles from './FormAnalysis.module.scss';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Header from '../../../components/Elements/Header';
import FullName from '../../../components/Elements/FullName';
import Email from '../../../components/Elements/Email';
import Address from '../../../components/Elements/Address';
import Phone from '../../../components/Elements/Phone';
import DatePicker from '../../../components/Elements/DatePicker';
import ShortText from '../../../components/Elements/ShortText';
import LongText from '../../../components/Elements/LongText';
import Time from '../../../components/Elements/Time';
import StarRating from '../../../components/Elements/StarRating';
import SingleChoice from '../../../components/Elements/SingleChoice';
import MultiChoice from '../../../components/Elements/MultiChoice';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Notify from '../../../components/Notify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 800,
    bgcolor: '#efefef',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
    maxHeight: 'calc(100vh - 50px)',
    overflow: 'auto',
};

const FormAnalysis = () => {
    let raw_answers = [];

    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;

    const [form, setForm] = useState({});
    const [participant, setParticipant] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [cParticipant, setCurrentParticipant] = useState('');
    const [notify, setNotify] = useState('Choose a participant to see the answer');
    const [cStauts, setCurrentStatus] = useState('Loading...');
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [raws, setRaws] = useState({});

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
    }, []);

    const onGetFormDetail = () => {
        const { contract } = wallet;
        const { id } = query;

        if (id === null || id === '' || typeof id === 'undefined') {
            return redirectError('Could not found any object have that id!');
        }

        contract
            ?.get_form?.({
                id,
            })
            .then((res) => {
                if (res) {
                    const { start_date, participants, status } = res;
                    const content = '';
                    const currentTimestamp = Date.now().toString();
                    if (status === 0) {
                        return redirectError('This form has not been published!');
                    } else if (currentTimestamp < start_date) {
                        return redirectError('This form has not been started');
                    }

                    if (content !== '') {
                        const encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }

                    setForm(res);
                    const prt = participants?.map((pt) => {
                        return {
                            name: pt,
                            checked: false,
                        };
                    });
                    setParticipant([...prt]);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onParticipantDetailClicked = (item, index) => {
        setAnswers([]);
        participant[index].checked = true;
        const { walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        if (userId !== form.owner && userId !== item) {
            setCurrentParticipant('');
            return setNotify('You only see your answers!');
        }

        setParticipant([...participant]);
        setCurrentParticipant(item);
        getMaxAnswers(item);
    };

    const getMaxAnswers = (part) => {
        setOpenLoading(true);
        const { contract } = wallet;
        const { id } = query;
        contract
            ?.get_passed_element_count?.({
                formId: id,
                userId: part,
            })
            .then((res) => {
                if (res) {
                    getAnswers(part, res);
                } else {
                    setCurrentStatus('Nothing to be shown');
                    setOpenLoading(false);
                }
            })
            .catch((err) => {
                onShowResult({
                    type: 'error',
                    msg: String(err),
                });
            });
    };

    const getAnswers = async (part, total) => {
        if (typeof raws[part] !== 'undefined') {
            setOpenLoading(false);
            return setAnswers([...raws[part]]);
        }
        const { contract } = wallet;
        const { id } = query;
        const num_page = total % 5 === 0 ? parseInt(total / 5) : parseInt(total / 5) + 1;
        const page_arr = new Array(num_page).fill(0);
        setAnswers([]);
        raw_answers = [];
        let tmp_answers = [];
        await Promise.all(
            page_arr.map(async (page, index) => {
                await contract
                    .get_answer_statistical(
                        {
                            userId: part,
                            formId: id,
                            page: index + 1,
                        },
                        50000000000000,
                    )
                    .then((datax) => {
                        if (datax) {
                            const pIndex = raw_answers.findIndex((x) => x?.page === datax?.page);
                            if (pIndex === -1) {
                                raw_answers.push(datax);
                                raw_answers.sort((a, b) => {
                                    if (a.page < b.page) return -1;
                                    if (a.page > b.page) return 1;
                                    return 0;
                                });
                                tmp_answers = [];
                                raw_answers.map((raw) => {
                                    const transform_form = raw?.data?.map((form_data) => {
                                        const tmp_data = {
                                            bId: form_data.element_id,
                                            id: listElement?.[form_data.type]?.id,
                                            type: form_data.type,
                                            label: listElement?.[form_data.type]?.label,
                                            defaultValue: {
                                                title: form_data?.title,
                                                isRequire: form_data?.isRequired,
                                                meta: form_data?.answer,
                                            },
                                            numth: form_data.numth,
                                        };

                                        if (tmp_data.id === 'singleChoice' || tmp_data.id === 'multiChoice') {
                                            tmp_data.defaultValue.meta = form_data?.meta?.map((x) => {
                                                return {
                                                    content: x,
                                                    check: form_data?.answer?.includes(x) ? true : false,
                                                };
                                            });
                                        }
                                        return tmp_data;
                                    });
                                    tmp_answers = [...tmp_answers, ...(transform_form || [])];
                                    return '';
                                });

                                tmp_answers = tmp_answers?.sort((x, y) => {
                                    if (x?.numth < y?.numth) return -1;
                                    if (x?.numth > y?.numth) return 1;
                                    return 0;
                                });
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }),
        )
            .then(() => {
                raws[part] = [...tmp_answers];
                setRaws({
                    ...raws,
                });
                setAnswers([...tmp_answers]);
                setOpenLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setOpenLoading(false);
            });
    };

    const onRandomColorBg = () => {
        return color[Math.floor(Math.random() * 5)];
    };

    const onCloseModal = () => {
        setOpenModal(false);
    };

    const redirectError = (content) => {
        const encoded_content = encodeURIComponent(content);
        router.push(`/error?content=${encoded_content}`);
    };

    const renderElement = (el, index) => {
        const { type, id, defaultValue } = el;
        switch (id) {
            case 'header':
                return <Header />;
            case 'fullName':
                return <FullName index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'email':
                return <Email index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'address':
                return <Address index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'phone':
                return <Phone index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'datePicker':
                return <DatePicker index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'shortText':
                return <ShortText index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'longText':
                return <LongText index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'time':
                return <Time index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'rating':
                return <StarRating index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'singleChoice':
                return <SingleChoice index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            case 'multiChoice':
                return <MultiChoice index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;
            // case 'fillBlank':
            //     return <FillBlank index={index} elType={type} type={'analysis'} defaultValue={defaultValue} />;

            default:
                break;
        }
    };

    const renderAnswer = () => {
        if (answers?.length === 0) {
            return <div className={styles.cStatus}>{cStauts}</div>;
        } else {
            return answers?.map?.((item, index) => {
                return (
                    <div className={styles.element_content} key={index}>
                        {renderElement(item, index)}
                    </div>
                );
            });
        }
    };

    const onRenderParticipant = (item, index) => {
        const { name } = item;
        const shortName = `${name?.[0]}${name?.[1]}`;
        return (
            <div className={styles.participant_area} key={index} onClick={() => onParticipantDetailClicked(name, index)}>
                <div className={styles.participant_area_avata} style={{ background: onRandomColorBg() }}>
                    {shortName}
                </div>
                <div
                    className={styles.participant_area_name}
                    style={{
                        color: item.checked ? 'var(--color-secondary)' : '',
                    }}
                >
                    {name}
                </div>
            </div>
        );
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.content}>
                    <div className={styles.content_left}>
                        <div className={styles.form_analysis_title}>{form?.title}</div>
                        <div className={styles.form_analysis_text}>Total Question(s): {form?.elements?.length}</div>
                        <div className={styles.form_analysis_text}>Total Participant(s): {form?.participants?.length}</div>
                        {participant?.length > 0 ? (
                            <div className={styles.participant_root}>
                                <div className={styles.participant_list}>
                                    {participant.map((item, index) => {
                                        return onRenderParticipant(item, index);
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.participant_nothing}>
                                <div className={styles.nothing_text}>Nothing to display</div>
                            </div>
                        )}
                    </div>
                    {cParticipant !== '' && (
                        <div className={styles.participant_preview}>
                            <Typography id="modal-modal-title" variant="h5" component="h2">
                                Result of: <span style={{ color: 'var(--color-link)' }}>{cParticipant}</span>
                            </Typography>

                            <div className={styles.line}></div>
                            <div className={styles.modal_content}>{renderAnswer()}</div>
                        </div>
                    )}
                    {cParticipant === '' && <div className={styles.participant_notify}>{notify}</div>}
                </div>

                <Modal open={openModal} onClose={onCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={style}></Box>
                </Modal>
            </div>
        </>
    );
};

export default FormAnalysis;

const color = [
    'linear-gradient(135deg, #007AFF, #23D2FF)',
    'linear-gradient(135deg, #FFD3A5, #FD6585)',
    'linear-gradient(135deg, #FC3B63, #711DDF)',
    'linear-gradient(135deg, #69F9CC, #F8B0AD, #F6E884)',
    'linear-gradient(135deg, #EE9AB1, #FCFF00)',
    'linear-gradient(135deg, #EE9AE5, #5961F9)',
    '#FFD166',
    '#FA8F54',
];

const listElement = [
    {
        bId: '',
        id: 'header',
        type: 0,
        label: 'Header',
        defaultValue: {
            title: [],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'fullName',
        type: 1,
        label: 'Full Name',
        defaultValue: {
            title: ['Name', 'Type your description', 'First Name', 'Last Name'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'email',
        type: 2,
        label: 'Email',
        defaultValue: {
            title: ['Email', 'Type your description', 'Email.'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'address',
        type: 3,
        label: 'Address',
        defaultValue: {
            title: ['Address', 'Street Address', 'Street Address Line 2', 'City', 'State / Province', 'Postal / Zip Code'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'phone',
        type: 4,
        label: 'Phone',
        defaultValue: {
            title: ['Phone Number', 'Type your description', 'Please enter a valid phone number.'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'datePicker',
        type: 5,
        label: 'Date Picker',
        defaultValue: {
            title: ['Date Picker', 'Type your description', 'Please pick a date.'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'fillBlank',
        type: 6,
        label: 'Fill in the Blank',
        defaultValue: {
            title: ['Type a question'],
            meta: [],
            isRequired: false,
        },
    },
    {
        bId: '',
        id: 'shortText',
        type: 7,
        label: 'Shot Text',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'longText',
        type: 8,
        label: 'Long text',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'singleChoice',
        type: 9,
        label: 'Single Choice',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'multiChoice',
        type: 10,
        label: 'Multi Choice',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'time',
        type: 11,
        label: 'Time',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
    {
        bId: '',
        id: 'rating',
        type: 12,
        label: 'Rating',
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
];
