/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import styles from './CreateEvent.module.scss';
import Notify from '../../../components/Notify';
import { utils } from 'near-api-js';
import { Web3Storage } from 'web3.storage';
import PreviewEvent from '../../../components/PreviewEvent';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

const CreateEvent = () => {
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const [event_name, setEventName] = useState('');
    const [event_descriptions, setEventDescription] = useState([
        {
            value: '',
        },
    ]);
    const [imgSelected, setImgSelected] = useState();
    const [event_type, setEventType] = useState(0);
    const fileInput = useRef();
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [start_date, setStartingDate] = useState('');
    const [end_date, setEndingDate] = useState('');
    const [event_link, setEventLink] = useState('');
    const [modalPreview, setModalPreview] = useState(false);

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    useEffect(() => {
        if (router.query.transactionHashes) {
            router.push(`/event/event-detail?id=created`);
        }
    }, [router.query]);

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    const onChangeEventName = (e) => {
        setEventName(e.target.value);
    };

    const onChangeCover = (e) => {
        const files = e.target.files;
        fileInput.current = files;
        setImgSelected(files?.[0]?.name);
        let reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (file) => {
            let img = file.target.result;
            localStorage.setItem('temp_image', img);
        };
    };

    const getEventInfo = () => {
        let type_name = '';
        eventType.map((type) => {
            if (event_type === type.typeId) {
                type_name = type.label;
            }

            return type;
        });
        const { walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        let event_info = {
            name: event_name,
            owner: userId,
            start_date: parseInt(start_date),
            end_date: parseInt(end_date),
            type: type_name,
            descriptions: event_descriptions,
            link: event_link,
        };
        localStorage.setItem('temp_event', JSON.stringify(event_info));
        return event_info;
    };

    const onAttendEventClick = async () => {
        if (!onValidateNewEvent()) {
            return;
        }

        const { contract } = wallet;
        setOpenLoading(true);
        const depositAmount = utils.format.parseNearAmount('1');

        const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_w3key });

        const rootCid = await client.put(fileInput.current);

        const des = event_descriptions.filter((x) => x.value !== null && typeof x.value !== 'undefined' && x.value !== '').map((x) => x.value);
        contract
            ?.init_new_event?.(
                {
                    title: event_name,
                    location: 'Hanoi',
                    description: des,
                    privacy: [],
                    cover_image: rootCid,
                    type: parseInt(event_type),
                    start_date,
                    end_date,
                    url: event_link,
                },
                100000000000000,
                depositAmount,
            )
            .then((res) => {
                if (res) {
                    router.push(`/event/event-detail?id=created`);

                    // localStorage.setItem('date_info', JSON.stringify({
                    //     start_date: start_date,
                    //     end_date: end_date
                    // }));
                    // console.log(localStorage.getItem('date_info'));
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Create event failure',
                    });
                }
            })
            .catch((err) => {
                onShowResult({
                    type: 'error',
                    msg: String(err),
                });
            });
        localStorage.removeItem('temp_event');
        localStorage.removeItem('temp_image');
    };

    const onValidateNewEvent = () => {
        if (event_name === '') {
            onShowResult({
                type: 'error',
                msg: 'Event name could not be null or empty',
            });
            return false;
        }

        const event_description_filter = event_descriptions.filter((x) => x.value === '' || x.value === null || typeof x.value === 'undefined');

        if (event_descriptions.length === event_description_filter.length) {
            onShowResult({
                type: 'error',
                msg: 'Event description could not be null or empty',
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

        if (fileInput.current === null || typeof fileInput.current === 'undefined' || fileInput.current.length === 0) {
            onShowResult({
                type: 'error',
                msg: 'Cover image could not be empty',
            });
        }
        return true;
    };

    const onChangeEventDescription = (index, e) => {
        event_descriptions[index].value = e.target.value;
        setEventDescription([...event_descriptions]);
    };

    const onEventTypeChange = (e) => {
        setEventType(e.target.value);
    };

    const onStartingTimeChange = (e) => {
        const date = new Date(e.target.value);
        setStartingDate(date.getTime().toString());
    };

    const onEndingTimeChange = (e) => {
        const date = new Date(e.target.value);
        setEndingDate(date.getTime().toString());
    };

    const onAddNewDescriptionClick = () => {
        event_descriptions.push({
            value: '',
        });

        setEventDescription([...event_descriptions]);
    };

    const onPreviewClick = () => {
        setModalPreview(true);
    };

    const onChangeEventLink = (e) => {
        setEventLink(e.target.value);
    };

    const onCloseModalPreview = () => {
        setModalPreview(false);
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.button_area}>
                    <button className={styles.button_area_button} onClick={onPreviewClick}>
                        Preview Event
                    </button>
                    <button className={styles.button_area_button_save} onClick={onAttendEventClick}>
                        Save
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.content_title}>Create Event</div>
                    <div className={styles.content_label}>Event's name</div>
                    <input className={styles.content_input} placeholder="Enter event name" value={event_name} onChange={onChangeEventName} />
                    <div className={styles.content_row}>
                        <div className={styles.content_time}>
                            <div className={styles.content_label}>Starting time</div>
                            <input
                                type={'datetime-local'}
                                className={styles.content_input}
                                placeholder="pick your event starting time"
                                onChange={onStartingTimeChange}
                            />
                        </div>
                        <div className={styles.content_time_right}>
                            <div className={styles.content_label}>Ending time</div>
                            <input
                                type={'datetime-local'}
                                className={styles.content_input}
                                placeholder="pick your event ending time"
                                onChange={onEndingTimeChange}
                            />
                        </div>
                    </div>
                    <div className={styles.content_label}>Details</div>
                    {event_descriptions?.map?.((des, index) => {
                        return (
                            <textarea
                                key={index}
                                className={styles.content_detail}
                                rows={3}
                                value={des.value}
                                onChange={(e) => onChangeEventDescription(index, e)}
                            />
                        );
                    })}
                    <button className={styles.content_add_des} onClick={onAddNewDescriptionClick}>
                        + Add new description
                    </button>
                    <div className={styles.content_label}>Image Cover</div>
                    <input className={styles.content_input_file} type={'file'} id={'create_event_file'} ref={fileInput} onChange={onChangeCover} />
                    <label htmlFor={'create_event_file'}>{imgSelected ? imgSelected : 'Choose a file...'}</label>
                    <div className={styles.content_label}>Event Type</div>
                    <div className={styles.content_row}>
                        {eventType?.map?.((item) => {
                            return (
                                <Fragment key={item.id}>
                                    <input type="radio" id={item.id} name="event_type" value={item.typeId} onChange={onEventTypeChange} />
                                    <label htmlFor={item.id} className={styles.content_row_label}>
                                        {item.label}
                                    </label>
                                </Fragment>
                            );
                        })}
                    </div>
                    <div className={styles.content_label}>Online event link</div>
                    <input className={styles.content_input} placeholder="Enter event link" value={event_link} onChange={onChangeEventLink} />
                </div>

                <Modal open={modalPreview} onClose={onCloseModalPreview} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                    <Box sx={{ width: '100vw', height: '100vh' }}>
                        <div className={styles.modal_preview_content}>
                            <div className={styles.modal_preview_content_title}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Preview event
                                </Typography>
                                <div className={styles.line} />
                            </div>
                            <div className="form_bg" />
                            <div className={styles.modal_preview_close} onClick={onCloseModalPreview}>
                                <CloseIcon />
                            </div>
                            <div className={styles.preview_content}>
                                <PreviewEvent event_info={getEventInfo()} />
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>
        </>
    );
};

export default CreateEvent;

const eventType = [
    { id: 'online', typeId: 0, label: 'Online' },
    { id: 'in_person', typeId: 1, label: 'In Person' },
    { id: 'both', typeId: 2, label: 'Online + In Person' },
];
