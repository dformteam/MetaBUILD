/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import styles from './ViewForm.module.scss';
import ShortTextOutlinedIcon from '@mui/icons-material/ShortTextOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedOutlinedIcon from '@mui/icons-material/UnpublishedOutlined';
import InsertChartOutlinedOutlinedIcon from '@mui/icons-material/InsertChartOutlinedOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
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
import FillBlank from '../../../components/Elements/FillBlank';
import PreviewForm from '../../../components/PreviewForm';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Notify from '../../../components/Notify';
import Confirmation from '../../../components/Confirmation';

const CreateForm = () => {
    const raws = [];
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;

    const [actions, setAction] = useState([]);
    const [form, setForm] = useState({});
    const [elements, setElements] = useState([]);
    const [modalPreview, setModalPreview] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [forms_status] = useState('');
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [editingElement, setEditingElement] = useState({});
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [openConfirmUnpublish, setOpenConfirmUnpublish] = useState(false);
    const [currentElement, setCurrentElement] = useState({});
    const [sharedLink, setSharedLink] = useState('');
    const [can_edit, setCanEdit] = useState(false);

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

    useEffect(() => {
        onGetMaxElement();
    }, [forms_status]);

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

                    if (content !== '') {
                        encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }

                    setForm({ ...res });
                    renderAction(res);
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
        setElements([]);

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
                            let temp_elements = [];
                            raws.map((raw) => {
                                const transform_form = raw?.data?.map((tmp_data) => {
                                    return {
                                        bId: tmp_data.id,
                                        id: listElement?.[tmp_data.type]?.id,
                                        type: tmp_data.type,
                                        label: listElement?.[tmp_data.type]?.label,
                                        icon: ShortTextOutlinedIcon,
                                        defaultValue: {
                                            title: tmp_data?.title,
                                            meta: tmp_data?.meta?.map((x) => {
                                                return {
                                                    content: x,
                                                    checked: false,
                                                };
                                            }),
                                            isRequired: tmp_data?.isRequired,
                                            error: '',
                                        },
                                        edited: false,
                                        editable: false,
                                        numth: tmp_data.numth,
                                    };
                                });

                                temp_elements = [...temp_elements, ...(transform_form || [])];
                                return '';
                            });

                            temp_elements = temp_elements?.sort((x, y) => {
                                if (x?.numth < y?.numth) return -1;
                                if (x?.numth > y?.numth) return 1;
                                return 0;
                            });
                            setElements([...temp_elements]);
                        }
                    }
                });
        });
    };

    const onPublishForm = () => {
        const id = query.id;
        router.push(`/form/publish-form?id=${id}`);
    };

    const onDeleteElement = (element) => {
        setCurrentElement(element);
        setOpenConfirmation(true);
    };

    const onCloseModalPreview = () => {
        localStorage.removeItem('myForms');
        setModalPreview(false);
    };

    const onCloseModalEdit = () => {
        setModalEdit(false);
    };

    const onPreviewClick = () => {
        localStorage.setItem('myForms', JSON.stringify(elements));
        setModalPreview(true);
    };

    const onAddNewQuestion = () => {
        const id = query.id;
        router.push(`/form/edit-form?id=${id}`);
    };

    const onEditElementClick = (item) => {
        setEditingElement({
            ...item,
        });
        setModalEdit(true);
    };

    const onUnPublishFormClick = () => {
        setOpenConfirmUnpublish(true);
    };

    const onAcceptUnPublishForm = () => {
        const { contract } = wallet;
        setOpenConfirmUnpublish(false);
        setOpenLoading(true);

        return contract
            .unpublish_form({
                formId: query.id,
            })
            .then((res) => {
                if (res) {
                    onShowResult({
                        type: 'success',
                        msg: 'Unpublish form successfully',
                    });
                    setSharedLink('');
                    onGetFormDetail();
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Something went wrong, please try again!',
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

    const onSaveQuestionChange = () => {
        setModalEdit(false);
        setOpenLoading(true);

        const { contract } = wallet;

        const { id } = query;
        const { defaultValue } = editingElement;

        return contract
            .update_element({
                formId: id,
                id: editingElement.bId,
                title: defaultValue.title,
                meta: defaultValue.meta,
                isRequired: defaultValue.isRequired,
            })
            .then((res) => {
                if (res) {
                    onGetMaxElement();
                    onShowResult({
                        type: 'success',
                        msg: 'Update question successfully',
                    });
                    onGetFormDetail();
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Something went wrong, please try again!',
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

    const onDenyUnPublishForm = () => {
        setOpenConfirmUnpublish(false);
    };

    const onAnalysisClick = () => {
        const id = query.id;
        router.push(`/form/form-analysis?id=${id}`);
    };

    const renderAction = (element) => {
        const { status, start_date, end_date } = element;
        const cTimestamp = Date.now();
        let action = [];
        if (status === 0) {
            setCanEdit(true);
            action = [
                {
                    title: 'Add new question',
                    onClick: onAddNewQuestion,
                },
                {
                    title: 'Preview',
                    onClick: onPreviewClick,
                },
                {
                    title: 'Publish',
                    onClick: onPublishForm,
                },
            ];
        } else if (status === 1 && cTimestamp < start_date) {
            setCanEdit(false);
            onSetShareLink();
            action = [
                {
                    title: 'Unpublish',
                    onClick: onUnPublishFormClick,
                },
                {
                    title: 'Preview',
                    onClick: onPreviewClick,
                },
            ];
        } else if (status === 1 && cTimestamp > start_date && cTimestamp < end_date) {
            setCanEdit(false);
            onSetShareLink();
            action = [
                {
                    title: 'Unpublish',
                    onClick: onUnPublishFormClick,
                },
                {
                    title: 'Preview',
                    onClick: onPreviewClick,
                },
                {
                    title: 'Analysis',
                    onClick: onAnalysisClick,
                },
            ];
        } else if ((status === 1 && cTimestamp > end_date) || status === 2) {
            setCanEdit(false);
            action = [
                {
                    title: 'Preview',
                    onClick: onPreviewClick,
                },
                {
                    title: 'Analysis',
                    onClick: onAnalysisClick,
                },
            ];
        }

        setAction([...action]);
    };

    const onSetShareLink = () => {
        const uri = new URL(window.location.href);
        const { origin } = uri;
        const { id } = query;
        setSharedLink(`${origin}/form/form-answer?id=${id}`);
    };

    const onElementChanged = ({ index, title, meta, isRequired }) => {
        // elements[index] = {
        //     ...elements[index],
        //     defaultValue: {
        //         title,
        //         meta,
        //         isRequired,
        //     },
        //     edited: true,
        // };

        const editElement = {
            ...editingElement,
            defaultValue: {
                title,
                meta,
                isRequired,
            },
        };

        setEditingElement({ ...editElement });
    };

    const onAcceptDeleteElement = () => {
        const { contract } = wallet;
        const { bId } = currentElement;
        setOpenConfirmation(false);
        setOpenLoading(true);

        return contract
            .delete_element({
                formId: query.id,
                id: bId,
            })
            .then((res) => {
                if (res) {
                    onGetMaxElement();
                    onShowResult({
                        type: 'success',
                        msg: 'Delete element successfully',
                    });
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Something went wrong, please try again!',
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

    const onDenyDeleteElement = () => {
        setOpenConfirmation(false);
    };

    const renderElement = (el, index, edit) => {
        const { type, id, defaultValue } = el;

        const editableType = edit ? 'edit' : 'view';

        switch (id) {
            case 'header':
                return <Header />;
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
            case 'fillBlank':
                return <FillBlank index={index} onChange={onElementChanged} elType={type} type={editableType} defaultValue={defaultValue} />;

            default:
                break;
        }
    };

    const renderForms = (item, index) => {
        return (
            <div className={styles.element_content} key={index}>
                {renderElement(item, index)}
                {can_edit && (
                    <div className={styles.element_action_area}>
                        <button className={styles.element_action_area__edit} onClick={() => onEditElementClick(item)}>
                            <EditIcon className={styles.button_delete_icon} />
                        </button>
                        <button className={styles.element_action_area__delete} onClick={() => onDeleteElement(item)}>
                            <DeleteForeverOutlinedIcon className={styles.button_delete_icon} />
                        </button>
                    </div>
                )}
                {/* <div className={styles.element_bg}></div> */}
            </div>
        );
    };

    const renderIcon = (title) => {
        switch (title) {
            case 'Edit':
                return <EditIcon className={styles.button_area_icon} />;
            case 'Preview':
                return <VisibilityOutlinedIcon className={styles.button_area_icon} />;
            case 'Unpublish':
                return <UnpublishedOutlinedIcon className={styles.button_area_icon} />;
            case 'Analysis':
                return <InsertChartOutlinedOutlinedIcon className={styles.button_area_icon} />;
            case 'Add new question':
                return <AddOutlinedIcon className={styles.button_area_icon} />;
            case 'Publish':
                return <PublishIcon className={styles.button_area_icon} />;

            default:
                break;
        }
    };

    const onGetSharedLink = () => {
        navigator.clipboard.writeText(sharedLink);
        onShowResult({
            type: 'success',
            msg: 'copied',
        });
    };

    return (
        <>
            {openConfirmation && <Confirmation label={confirmationLabel} onAccept={onAcceptDeleteElement} onCancel={onDenyDeleteElement} />}
            {openConfirmUnpublish && <Confirmation label={unpublishConfirmationLabel} onAccept={onAcceptUnPublishForm} onCancel={onDenyUnPublishForm} />}
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.container}>
                    <div className={styles.button_area}>
                        {actions?.map((action, index) => {
                            return (
                                <button className={styles.button} onClick={action.onClick} key={index}>
                                    {renderIcon(action.title)}
                                    {action.title}
                                </button>
                            );
                        })}
                    </div>
                    {sharedLink !== '' && (
                        <>
                            <div className={styles.root_share_label}>Link to share:</div>
                            <div className={styles.root_row}>
                                <LinkOutlinedIcon className={styles.root_icon_link} />
                                <div className={styles.root_link_input}>{sharedLink}</div>
                                <div className={styles.root_link_copy} onClick={onGetSharedLink}>
                                    Copy link
                                </div>
                            </div>
                        </>
                    )}
                    <div className={styles.root__title}>{form?.title}</div>
                    <div className={styles.root__description}>{form?.description}</div>
                    <div className={styles.content}>
                        {elements?.map?.((item, index) => {
                            return renderForms(item, index);
                        })}
                    </div>
                </div>

                <Modal open={modalPreview} onClose={onCloseModalPreview} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box
                        sx={{
                            width: '100vw',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fff',
                            position: 'relative',
                        }}
                    >
                        <div className={styles.modal_preview_content}>
                            <div className="form_bg" />
                            <div className={styles.modal_preview_content_title}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Preview form
                                </Typography>
                                <div className={styles.line} />
                            </div>
                            <div className={styles.modal_preview_close} onClick={onCloseModalPreview}>
                                <CloseIcon />
                            </div>
                            <div className={styles.preview_content}>
                                <PreviewForm data={elements} />
                            </div>
                        </div>
                    </Box>
                </Modal>
                <Modal open={modalEdit} onClose={onCloseModalEdit} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className={styles.modal_edit_content}>
                            <div className={styles.modal_preview_content_title}>
                                <Typography className={styles.modal_edit_title} variant="h5" component="h2">
                                    Edit question
                                </Typography>
                                <div className={styles.line} />
                            </div>
                            <div className="form_bg" />
                            <div className={styles.modal_preview_close} onClick={onCloseModalEdit}>
                                <CloseIcon />
                            </div>
                            <div className={styles.element_content}>{renderElement(editingElement, 0, true)}</div>
                            <div className={styles.modal_edit_row}>
                                <button className={styles.modal_edit_button} onClick={onCloseModalEdit}>
                                    Cancel
                                </button>
                                <button className={styles.modal_edit_button_save} onClick={onSaveQuestionChange}>
                                    Save
                                </button>
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
            title: ['Address', 'Type your description', 'Street Address', 'Street Address Line 2', 'City', 'State / Province', 'Postal / Zip Code'],
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

const confirmationLabel = {
    title: 'Confirmation',
    desc: 'Are you sure to delete this question?',
    accept: 'Accept',
    cancel: 'Deny',
};

const unpublishConfirmationLabel = {
    title: 'Confirmation',
    desc: `Are you sure to unpublish,\n data of submission will be deleted!`,
    accept: 'Accept',
    cancel: 'Deny',
};
