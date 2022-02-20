/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import styles from './EditEvent.module.scss';
import Notify from '../../../components/Notify';
import { Web3Storage } from 'web3.storage';
import moment from 'moment';
import { fireEvent } from '@testing-library/react';

const EditEvent = ({ id }) => {
    const wallet = useSelector((state) => state.wallet);
    const { walletConnection } = wallet;
    const userId = walletConnection.getAccountId();
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
    const [start_date, setStartingDate] = useState(Date.now());
    const [end_date, setEndingDate] = useState(Date.now());
    const [event_link, setEventLink] = useState('');

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
        onGetEventDetail();
    }, []);

    const onGetEventDetail = () => {
        const { contract } = wallet;

        contract
            ?.get_event({
                eventId: id,
            })
            .then((res) => {
                if (res) {
                    console.log(res);
                    const { status, owner } = res;
                    if (status === 0 && owner !== userId) {
                        redirectError('You do not permission to access this page');
                    } else {
                        setEventName(res?.title);
                        setStartingDate(res?.start_date);
                        setEndingDate(res?.end_date);
                        setEventDescription(
                            res?.description?.map?.((des) => {
                                return {
                                    value: des,
                                };
                            }),
                        );
                        setEventLink(res?.url);
                        setEventType(res?.type);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onChangeEventName = (e) => {
        setEventName(e.target.value);
    };

    const onChangeCover = (e) => {
        const files = e.target.files;
        fileInput.current = files;
        setImgSelected(files?.[0]?.name);
    };

    const onSaveEventClick = async () => {
        if (!onValidateNewEvent()) {
            return;
        }

        const { contract } = wallet;
        let rootCid = '';
        if (typeof fireEvent.current !== 'undefined') {
            const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_w3key });
            rootCid = await client.put(fileInput.current);
        }

        const des = event_descriptions.filter((x) => x.value !== null && typeof x.value !== 'undefined' && x.value !== '').map((x) => x.value);
        setOpenLoading(true);

        contract
            ?.update_event_info?.(
                {
                    eventId: id,
                    title: event_name,
                    description: des,
                    location: 'Hanoi',
                    privacy: [],
                    cover_img: rootCid,
                    type: parseInt(event_type),
                    start_date,
                    end_date,
                    url: event_link,
                },
                100000000000000,
            )
            .then((res) => {
                if (res) {
                    router.push(`/event/event-detail?id=${id}`);
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Creat event failure',
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

    const onExportDateTime = (datetime) => {
        try {
            const timestamp = parseFloat(datetime);
            const date = new Date(timestamp);
            return moment(date).format('YYYY-MM-DDThh:mm');
        } catch {
            return 'unknow';
        }
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

    const redirectError = (content) => {
        const encoded_content = encodeURIComponent(content);
        router.push(`/error?content=${encoded_content}`);
    };

    const onChangeEventLink = (e) => {
        setEventLink(e?.target?.value);
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.content}>
                    <div className={styles.content_title}>Create Event</div>
                    <div className={styles.content_label}>Event's name</div>
                    <input className={styles.content_input} placeholder="Enter event name" value={event_name} onChange={onChangeEventName} />
                    <div className={styles.content_label}>Starting time</div>
                    <input
                        type={'datetime-local'}
                        className={styles.content_input}
                        placeholder="pick your event starting time"
                        value={onExportDateTime(start_date)}
                        onChange={onStartingTimeChange}
                    />
                    <div className={styles.content_label}>Ending time</div>
                    <input
                        type={'datetime-local'}
                        className={styles.content_input}
                        placeholder="pick your event ending time"
                        value={onExportDateTime(end_date)}
                        onChange={onEndingTimeChange}
                    ></input>
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
                    <button className={styles.content_attend_button} onClick={onAddNewDescriptionClick}>
                        Add new description
                    </button>
                    <div className={styles.content_label}>Image Cover</div>
                    <input className={styles.content_input_file} type={'file'} id={'create_event_file'} ref={fileInput} onChange={onChangeCover} />
                    <label htmlFor={'create_event_file'}>{imgSelected ? imgSelected : 'Choose a file...'}</label>
                    <div className={styles.content_label}>Event Type</div>
                    <div className={styles.content_row}>
                        {eventType?.map?.((item) => {
                            return (
                                <Fragment key={item.id}>
                                    <input
                                        type="radio"
                                        id={item.id}
                                        checked={event_type === item.typeId ? true : false}
                                        name="event_type"
                                        value={item.typeId}
                                        onChange={onEventTypeChange}
                                    />
                                    <label htmlFor={item.id} className={styles.content_row_label}>
                                        {item.label}
                                    </label>
                                </Fragment>
                            );
                        })}
                    </div>
                    <div className={styles.content_label}>Online event link</div>
                    <input className={styles.content_input} placeholder="Enter event link" value={event_link} onChange={onChangeEventLink} />
                    <button className={styles.content_attend_button} onClick={onSaveEventClick}>
                        Save
                    </button>
                </div>
            </div>
        </>
    );
};

EditEvent.getInitialProps = async (ctx) => {
    const id = ctx.query.id;
    return { id };
};

export default EditEvent;

const eventType = [
    { id: 'online', typeId: 0, label: 'Online' },
    { id: 'in_person', typeId: 1, label: 'In Person' },
    { id: 'both', typeId: 2, label: 'Online + In Person' },
];
