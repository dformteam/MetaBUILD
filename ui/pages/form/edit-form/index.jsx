/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useLayoutEffect, useState } from 'react';
import styles from './CreateForm.module.scss';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import ShortTextOutlinedIcon from '@mui/icons-material/ShortTextOutlined';
import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
// import Header from '../../../components/Elements/Header';
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
import PreviewForm from '../../../components/PreviewForm';
import Semaphore from '../../../backed/semaphore';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Notify from '../../../components/Notify';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

const CreateForm = () => {
    const raws = [];
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;

    const seph = new Semaphore({
        max: 4,
    });

    const [welcomeText, setWelcomeText] = useState('Please fill out and submit this form.');
    const [thanksText, setThanksText] = useState('Your submission has been received.');
    const [forms, setForms] = useState([]);
    const [modalSave, setModalSave] = useState(false);
    const [isSuccess, setSuccess] = useState(false);
    const [modalPreview, setModalPreview] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [raw_forms, setRawForms] = useState([]);

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
        const { id, transactionHashes } = query;
        if (id !== '') {
            if (transactionHashes !== null && transactionHashes !== '' && typeof transactionHashes !== 'undefined') {
                setForms([...(JSON.parse(localStorage.getItem('temp')) || [])]);
            } else {
                onGetFormDetail();
            }
        }
    }, [query]);

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
            ?.get_form_status?.({
                formId: id,
            })
            .then((res) => {
                if (res) {
                    const { owner } = res;
                    const userId = walletConnection.getAccountId();
                    if (userId !== owner) {
                        content = 'You do not have permssion to edit this form!';
                    }

                    if (content !== '') {
                        encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }

                    onGetMaxElement();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onGetMaxElement = () => {
        const { contract } = wallet;
        const { id } = query;

        contract
            ?.get_element_count?.({
                formId: id,
            })
            .then((res) => {
                if (res) {
                    onGetElements({ total: res });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onGetElements = ({ total }) => {
        const { contract, walletConnection } = wallet;
        const num_page = total % 5 === 0 ? total / 5 : parseInt(total / 5) + 1;
        const page_arr = new Array(num_page).fill(0);
        setForms([]);

        const userId = walletConnection.getAccountId();
        const { id } = query;
        page_arr.map((page, index) => {
            return contract
                .get_elements({
                    userId,
                    formId: id,
                    page: index + 1,
                })
                .then((data) => {
                    if (data) {
                        const pIndex = raws.findIndex((x) => x?.page === data?.page);
                        if (pIndex === -1) {
                            raws.push(data);
                            raws.sort((a, b) => {
                                if (a.page < b.page) return -1;
                                if (a.page > b.page) return 1;
                                return 0;
                            });
                            let temp_forms = [];
                            raws.map((raw) => {
                                const transform_form = raw?.data?.map((form_data) => {
                                    return {
                                        bId: form_data.id,
                                        id: listElement?.[form_data.type]?.id,
                                        type: form_data.type,
                                        label: listElement?.[form_data.type]?.label,
                                        icon: ShortTextOutlinedIcon,
                                        defaultValue: {
                                            title: form_data?.title,
                                            meta: form_data?.meta.map((x) => {
                                                return {
                                                    content: x,
                                                    checked: false,
                                                };
                                            }),
                                            isRequired: form_data?.isRequired,
                                            error: '',
                                        },
                                        numth: form_data.numth,
                                    };
                                });
                                temp_forms = [...temp_forms, ...(transform_form || [])];
                                return '';
                            });
                            temp_forms = temp_forms?.sort((x, y) => {
                                if (x?.numth < y?.numth) return -1;
                                if (x?.numth > y?.numth) return 1;
                                return 0;
                            });

                            setRawForms([...temp_forms]);
                            setForms([...temp_forms]);
                        }
                    }
                });
        });
    };

    const onWelcomeTextChange = (e) => {
        setWelcomeText(e.target.value);
    };

    const onThanksTextChange = (e) => {
        setThanksText(e.target.value);
    };

    const onAddNewElement = (item, index) => {
        forms.push({
            ...item,
        });
        setForms([...forms]);
        onShowResult({
            type: 'success',
            msg: `Added new ${item.label} to form`,
        });
    };

    const onElementChanged = ({ index, title, meta, isRequired }) => {
        forms[index] = {
            ...forms[index],
            defaultValue: {
                title,
                meta,
                isRequired,
            },
        };

        setForms([...forms]);
    };

    const onDeleteElement = (index) => {
        forms.splice(index, 1);
        setForms([...forms]);
    };

    const onSaveFormClicked = async () => {
        const valid = onValidateQuestion(forms);
        if (!valid) {
            return;
        }

        localStorage.setItem('temp', JSON.stringify(forms));
        setSuccess(false);
        setModalSave(true);

        await Promise.all(
            forms?.map(async (element, index) => {
                const { bId } = element;
                if (typeof bId === 'undefined' || bId === null || bId === '') {
                    await seph.acquire();
                    const bId_result = await uploadNewElement(element, index);
                    element.bId = bId_result;
                }
            }),
        )
            .then(() => {
                const error_element = forms.filter((x) => typeof x.bId === 'undefined' || x.bId === null || x.bId === '');
                if (error_element.length > 0) {
                    setSuccess(false);
                } else {
                    setSuccess(true);
                }
                setForms([...forms]);
                setModalSave(false);
                setModalSuccess(true);
            })
            .catch((err) => {
                console.log(err);
                setModalSave(false);
                setSuccess(false);
                setModalSuccess(true);
            });
    };

    const uploadNewElement = async (element, index) => {
        const { contract } = wallet;
        const { id } = query;
        const { type, defaultValue } = element;

        let metax = defaultValue.meta;
        if (element.id === 'singleChoice' || element.id === 'multiChoice') {
            metax = defaultValue?.meta?.map?.((x) => x.content);
        }

        return contract
            .new_element({
                formId: id,
                type,
                title: defaultValue.title,
                meta: metax,
                isRequired: defaultValue.isRequired,
                numth: index,
            })
            .then((res) => {
                seph.release();
                return res?.id;
            })
            .catch((err) => {
                seph.release();
                return undefined;
            });
    };

    const onValidateQuestion = (elements) => {
        for (let element of elements) {
            if (element.id === 'multiChoice' || element.id === 'singleChoice') {
                const meta = element?.defaultValue?.meta;
                if (meta.length < 2) {
                    onShowResult({
                        type: 'error',
                        msg: 'Multi choise / Single choice question need to have at least 2 options.',
                    });

                    return false;
                }

                const meta_set = new Set(meta);
                if (meta.length !== meta_set.size) {
                    onShowResult({
                        type: 'error',
                        msg: 'Multi choise / Single choice options could not be duplicated',
                    });

                    return false;
                }
            }
        }

        return true;
    };

    const onUploadElementClick = async (element, index) => {
        const valid = onValidateQuestion([element]);
        if (!valid) {
            return;
        }
        // setExecuting(1);
        // setProcessing(0);
        setModalSave(true);
        const bId = await uploadNewElement(element, index);
        element.bId = bId;
        setForms([...forms]);
        setModalSave(false);
    };

    const onCloseModalSave = () => {
        setModalSave(false);
    };

    const onCloseModalSuccess = () => {
        if (isSuccess) {
            localStorage.removeItem('temp');
            const { id } = query;
            return router.push(`/form/view-form?id=${id}`);
        }
        setModalSuccess(false);
        setSuccess(false);
    };

    const onCloseModalPreview = () => {
        localStorage.removeItem('myForms');
        setModalPreview(false);
    };

    const onPreviewClick = () => {
        setModalPreview(true);
        localStorage.setItem('myForms', JSON.stringify([...raw_forms, ...forms]));
    };

    const renderElements = (item, index) => {
        if (item.id === 'fillBlank' || item.id === 'header') {
            return;
        }
        return (
            <Fragment key={item.id}>
                <div className={styles.line} />
                <div className={styles.element_item} onClick={() => onAddNewElement(item, index)}>
                    <div className={styles.element_icon}>
                        <item.icon className={styles.element_icon_img} fontSize="large" />
                    </div>
                    <div className={styles.element_label}>{item.label}</div>
                </div>
            </Fragment>
        );
    };

    const renderElement = (el, index) => {
        const { type, id, defaultValue } = el;

        const editableType = 'edit';

        switch (id) {
            // case 'header':
            //     return <Header />;
            case 'fullName':
                return <FullName index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'email':
                return <Email index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'address':
                return <Address index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'phone':
                return <Phone index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'datePicker':
                return <DatePicker index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'shortText':
                return <ShortText index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'longText':
                return <LongText index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'time':
                return <Time index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'rating':
                return <StarRating index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'singleChoice':
                return <SingleChoice index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            case 'multiChoice':
                return <MultiChoice index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;
            // case 'fillBlank':
            //     return <FillBlank index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;

            default:
                break;
        }
    };

    const renderForms = (item, index) => {
        return (
            <div className={styles.element_content} key={index}>
                {renderElement(item, index)}
                {modalPreview && (
                    <div className={styles.button_submit}>
                        {index !== 0 && (
                            <div className={styles.button_prev}>
                                <ArrowBackOutlinedIcon className={styles.icon_prev} />
                                Previous
                            </div>
                        )}
                        <div className={styles.button_next} style={index === 0 ? { borderBottomLeftRadius: 24, justifyContent: 'center' } : null}>
                            {index < forms.length - 1 ? 'Next' : 'Submit'} <ArrowForwardOutlinedIcon className={styles.icon_next} />
                        </div>
                    </div>
                )}

                <div className={styles.element_action_area}>
                    {(typeof item.bId === 'undefined' || item.bId === '') && (
                        <button className={styles.element_action_area__edit} onClick={() => onUploadElementClick(item, index)}>
                            <SaveOutlinedIcon className={styles.button_delete_icon} />
                        </button>
                    )}
                    {(typeof item.bId === 'undefined' || item.bId === '') && (
                        <button className={styles.element_action_area__delete} onClick={() => onDeleteElement(index)}>
                            <DeleteForeverOutlinedIcon className={styles.button_delete_icon} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderModalSaveSuccess = () => {
        return (
            <>
                <div className={styles.modal_success}>
                    <CheckCircleIcon className={styles.success_icon} />
                </div>
                <div className={styles.modal_label}>Your form is saved.</div>
            </>
        );
    };

    const renderModalSaveError = () => {
        return (
            <>
                <div className={styles.modal_success}>
                    <CancelIcon className={styles.error_icon} />
                </div>
                <div className={styles.modal_label}>
                    Some questions can't be uploaded.
                    <br /> Please check again!
                </div>
            </>
        );
    };

    const renderModalSaving = () => {
        return (
            <>
                <div className={styles.modal_label + ' ' + styles.margin_top}>Please wait while saving your form.</div>
                <div className={styles.modal_content}>
                    <img src={'/loading.svg'} alt="error" className={styles.modal_loading_icon} />
                </div>
            </>
        );
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.nav}>
                    <div className={styles.label}>Form Elements</div>
                    <div className={styles.element}>
                        {listElement?.map?.((item, index) => {
                            return renderElements(item, index);
                        })}
                    </div>
                </div>
                <div className={styles.container}>
                    <div className={styles.button_area}>
                        <button className={styles.button} onClick={onPreviewClick}>
                            Preview Form
                        </button>
                        <button className={styles.button_save} onClick={onSaveFormClicked}>
                            Save All
                        </button>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.welcome}>
                            <div className={styles.welcome_title}>Welcome!</div>
                            <input className={styles.welcome_text} value={welcomeText} onChange={onWelcomeTextChange} />
                            <button className={styles.welcome_button}>
                                Start <ArrowForwardOutlinedIcon className={styles.icon_next} />
                            </button>
                        </div>
                        {forms?.map?.((item, index) => {
                            return renderForms(item, index);
                        })}
                        <div className={styles.end}>
                            <div className={styles.welcome_title}>Thank You!</div>
                            <input className={styles.welcome_text} value={thanksText} onChange={onThanksTextChange} />
                        </div>
                    </div>
                </div>

                <Modal open={modalSuccess} onClose={onCloseModalSuccess} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            Saved Form
                        </Typography>
                        <div className={styles.line} />
                        {isSuccess ? renderModalSaveSuccess() : renderModalSaveError()}
                    </Box>
                </Modal>

                <Modal open={modalSave} onClose={onCloseModalSave} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h5" component="h2">
                            Saving
                        </Typography>
                        <div className={styles.line} />
                        {renderModalSaving()}
                    </Box>
                </Modal>

                <Modal open={modalPreview} onClose={onCloseModalPreview} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={{ width: '100vw', height: '100vh' }}>
                        <div className={styles.modal_preview_content}>
                            <div className={styles.modal_preview_content_title}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Preview form
                                </Typography>
                                <div className={styles.line} />
                            </div>
                            <div className="form_bg" />
                            <div className={styles.modal_preview_close} onClick={onCloseModalPreview}>
                                <CloseIcon />
                            </div>
                            <div className={styles.preview_content}>
                                <PreviewForm data={forms} />
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default CreateForm;

const listElement = [
    {
        bId: '',
        id: 'header',
        type: 0,
        label: 'Header',
        icon: TitleOutlinedIcon,
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
        icon: AccountCircleOutlinedIcon,
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
        icon: EmailOutlinedIcon,
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
        icon: LocationOnOutlinedIcon,
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
        icon: LocalPhoneOutlinedIcon,
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
        icon: DateRangeOutlinedIcon,
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
        label: 'Short Text',
        icon: ShortTextOutlinedIcon,
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
        icon: ChromeReaderModeOutlinedIcon,
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
        icon: AdjustOutlinedIcon,
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
        icon: CheckBoxOutlinedIcon,
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
        icon: AccessTimeOutlinedIcon,
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
        icon: StarOutlineOutlinedIcon,
        defaultValue: {
            title: ['Type a question', 'Type your description'],
            meta: [],
            isRequired: false,
            error: '',
        },
    },
];

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 400,
    bgcolor: '#fff',
    borderRadius: '24px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
};
