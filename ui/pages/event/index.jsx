/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import styles from './Event.module.scss';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/router';
import ModalShare from '../../components/Share';
import { useSelector } from 'react-redux';
import Notify from '../../components/Notify';
import { Web3Storage } from 'web3.storage';

const Event = () => {
    const router = useRouter();

    const [eventType, setType] = useState('both');
    const [modalShare, setModalShare] = useState(false);
    const [searchEventValue, setSearchEventValue] = useState('');
    const [eventList, setEventList] = useState([]);
    const [newestEventList, setNewestEventList] = useState([]);
    const [nextEvent, setNextEvent] = useState({});
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [link, setLink] = useState('');
    const [isInterestedLoad, setIsInterestedLoad] = useState(false);
    const [interestList, setInterestList] = useState([]);

    const wallet = useSelector((state) => state.wallet);

    const aEvents = [];

    const newestEvents = useRef([]);

    useEffect(() => {
        if (JSON.stringify(newestEventList) !== '[]' && !isInterestedLoad) {
            onGetMaxInterestedRows();
            setIsInterestedLoad(true);
        }
    }, [newestEventList]);

    useLayoutEffect(() => {
        onGetMaxRows();
    }, []);

    useLayoutEffect(() => {
        onGetNewestEvents();
    }, []);

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    // useEffect(() => {
    //     if (nextEvent !== {}) {
    //         retrieveImagesCover(nextEvent);
    //     }
    // }, [nextEvent]);

    useEffect(() => {
        if (interestList !== []) {
            interestList.map((item) => {
                setNewestEventList(
                    [...newestEventList].map((event) => {
                        if (event.id === item) {
                            event.isInterested = true;
                        }
                        return event;
                    }),
                );

                return item;
            });
        }
    }, [interestList]);

    const retrieveImagesCover = async (event) => {
        setNextEvent({ ...event });
        if (typeof event.cover_image !== 'undefined' && event.cover_image !== '') {
            const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_w3key });
            const res = await client.get(event?.cover_image || '');
            if (res.ok) {
                const files = await res.files();
                for (const file of files) {
                    let reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (e) => {
                        event.img = e.target.result;
                        setNextEvent({ ...event });
                    };
                }
            }
        }
    };

    const onGetMaxInterestedRows = () => {
        const { contract, walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        contract
            ?.get_interested_event_count?.({
                userId: userId,
            })
            .then((total) => {
                onGetInterestedRows({ total });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onGetInterestedRows = async ({ total }) => {
        const { contract, walletConnection } = wallet;
        const num_page = total % 5 === 0 ? total / 5 : parseInt(total / 5) + 1;
        const page_arr = new Array(num_page).fill(0);
        const userId = walletConnection.getAccountId();
        await Promise.all(
            page_arr.map(async (page, index) => {
                await contract
                    .get_interested_events({
                        userId,
                        page: index + 1,
                    })
                    .then((data) => {
                        if (data) {
                            let listId = [];
                            data.data.map((event) => {
                                listId.push(event.id);
                            });
                            setInterestList(listId);
                        }
                    });
            }),
        );
    };

    const generateEvent = (event) => {
        let event_type = 'Online';
        switch (event.event_type) {
            case 1:
                event_type = 'In person';
                break;
            case 2:
                event_type = 'Online + In person';
                break;

            default:
                break;
        }
        return {
            id: event.id,
            owner: event.owner,
            name: event.name,
            type: event_type,
            date: onExportDateTime(event.start_date),
            end_timestamp: event.end_date,
            date_timestamp: event.start_date,
            attendees: event.participants.length,
            cover_image: event.cover_image,
            img: '/calendar.svg',
            isInterested: false,
        };
    };

    const onGetNewestEvents = () => {
        const { contract } = wallet;
        newestEvents.current = [];
        contract
            ?.get_newest_events?.({})
            .then(async (newest_events) => {
                if (newest_events) {
                    const now = Date.now();
                    await newest_events.data.map(async (event) => {
                        let eventInfo = generateEvent(event);
                        if (eventInfo.end_timestamp > now) {
                            newestEvents.current.push(eventInfo);
                        }
                    });

                    newestEvents.current.sort(function (a, b) {
                        return a.date_timestamp - b.date_timestamp;
                    });
                    setNewestEventList([...newestEvents.current]);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onEventFavoriteClick = (item) => {
        const { contract, walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        if (userId === item.owner) {
            onShowResult({
                type: 'error',
                msg: 'You are the owner of this event',
            });
            return;
        }
        setOpenLoading(true);
        contract
            ?.interest_event(
                {
                    eventId: item.id,
                },
                50000000000000,
            )
            .then((res) => {
                if (res) {
                    onShowResult({
                        type: 'success',
                        msg: res,
                    });
                    item.isInterested = res === 'Interested' ? true : false;
                    setNewestEventList(
                        [...newestEventList].map((event) => {
                            if (event.id === item.id) {
                                return item;
                            } else {
                                return event;
                            }
                        }),
                    );
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Error when interested',
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

    const onGetMaxRows = () => {
        const { contract, walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        contract
            ?.get_event_count?.({
                userId: userId,
            })
            .then((total) => {
                onGetRows({ total });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onExportDateTime = (datetime) => {
        try {
            const timestamp = parseFloat(datetime);
            const date = new Date(timestamp);
            const localDate = date.toLocaleDateString();
            const localTime = date.toLocaleTimeString();
            return `${localDate} @ ${localTime}`;
        } catch {
            return 'unknow';
        }
    };

    const onGetRows = async ({ total }) => {
        const { contract, walletConnection } = wallet;
        const num_page = total % 5 === 0 ? total / 5 : parseInt(total / 5) + 1;
        const page_arr = new Array(num_page).fill(0);
        const userId = walletConnection.getAccountId();
        const current_timestamp = Date.now();
        await Promise.all(
            page_arr.map(async (page, index) => {
                await contract
                    .get_events({
                        userId,
                        page: index + 1,
                    })
                    .then((data) => {
                        if (data) {
                            let current_event = {};
                            current_event.img = '/calendar.svg';
                            let dt = -1;
                            data?.data?.map((event) => {
                                let event_type = 'Online';
                                switch (event?.event_type) {
                                    case 1:
                                        event_type = 'In person';
                                        break;
                                    case 2:
                                        event_type = 'Online + In person';
                                        break;
                                    default:
                                        break;
                                }
                                let eventInfo = {
                                    id: event.id,
                                    name: event.name,
                                    type: event_type,
                                    date: onExportDateTime(event.start_date),
                                    attendees: event.participants.length,
                                    cover_image: event.cover_image,
                                    // img: '/calendar.svg'
                                };
                                aEvents.push(eventInfo);
                                let tmp_dt = current_timestamp - event.start_date;
                                if (dt === -1 || tmp_dt < dt) {
                                    dt = tmp_dt;
                                    // current_event = event;
                                }

                                current_event = {
                                    id: event.id,
                                    name: event.name,
                                    type: event_type,
                                    start_date: event.start_date,
                                    date: onExportDateTime(event.start_date),
                                    attendees: event.participants.length,
                                    cover_image: event.cover_image,
                                    img: '/calendar.svg',
                                };

                                return event;
                            });
                            retrieveImagesCover(current_event);
                            // setNextEvent(current_event);
                            if (eventList.length < 9) {
                                setEventList([...aEvents]);
                            }
                        }
                    });
            }),
        );
    };

    const onTypeChange = (e) => {
        setType(e.target.value);
    };

    const renderInterestedIcon = (item) => {
        if (item.isInterested) {
            return <FavoriteIcon className={styles.event_item_icon_favor} onClick={() => onEventFavoriteClick(item)} />;
        } else {
            return <FavoriteBorderIcon className={styles.event_item_icon_favor} onClick={() => onEventFavoriteClick(item)} />;
        }
    };

    const onCreateEvent = () => {
        router.push('/event/create-event');
    };

    const onCloseModalShare = () => {
        setModalShare(false);
    };

    const onSearchEvent = (id) => {
        if (id !== '') {
            router.push(`/event/event-detail?id=${id}`);
        }
    };

    const onGetSharedLink = (id) => {
        const uri = new URL(window.location.href);
        const { origin } = uri;
        setLink(`${origin}/event/event-detail?id=${id}`);
        setModalShare(true);
    };

    const onSuccess = () => {
        onShowResult({
            type: 'success',
            msg: 'copied',
        });
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.label_create}>Start to create your event</div>
                <button className={styles.button_create} onClick={onCreateEvent}>
                    Create Event
                </button>
                <div className={styles.label}>
                    <div className={styles.label_title}>Your next event</div>
                    <div className={styles.label_text} onClick={() => router.push('/event/my-event')}>
                        More events you're attending <ChevronRightOutlinedIcon className={styles.icon_collapse} />
                    </div>
                </div>
                <div className={styles.line} />
                {nextEvent.id && nextEvent.id !== null ? (
                    <div className={styles.attend_event}>
                        <div className={styles.attend_item_header}>
                            <div className={styles.attend_item_type}>{'Online'}</div>
                            <img src={nextEvent.img} className={styles.attend_item_img} alt="img" />
                        </div>
                        <div className={styles.attend_item_info} onClick={() => router.push(`/event/event-detail?id=${nextEvent.id}`)}>
                            {/* <div className={styles.attend_item_date}>{'Sat, Jan 15 @ 5:30 PM'}</div> */}
                            {/* <div className={styles.attend_item_name}>{'Demo day © 2021 Learn NEAR Club © 2021 Learn NEAR Club © 2021 Learn NEAR Club'}</div> */}
                            <div className={styles.attend_item_date}>{onExportDateTime(nextEvent.start_date)}</div>
                            <div className={styles.attend_item_name}>{nextEvent.name}</div>
                        </div>
                        <div className={styles.attend_item_footer}>
                            <div className={styles.attending}>
                                <CheckCircleIcon className={styles.attending_icon} />
                                Attending
                            </div>
                            <ShareOutlinedIcon className={styles.attend_item_icon} onClick={() => onGetSharedLink(nextEvent.id)} />
                        </div>
                    </div>
                ) : (
                    <div className={styles.attend_event_nothing}>You don't have any events</div>
                )}
                <div className={styles.label}>
                    <div className={styles.label_title}>Find your event</div>
                </div>
                <div className={styles.search_row}>
                    <div className={styles.search_area}>
                        <input
                            placeholder={'Find your event'}
                            className={styles.input_search}
                            value={searchEventValue}
                            onChange={(e) => {
                                setSearchEventValue(e.currentTarget.value);
                            }}
                        />
                        <SearchIcon className={styles.search_icon} />
                    </div>
                    {/* <input className={styles.input_location} placeholder={'Location'} />
                    <Select value={type} onChange={onTypeChange} className={styles.button_select} inputProps={{ 'aria-label': 'Without label' }} displayEmpty>
                        <MenuItem value={'both'}>Online + In person</MenuItem>
                        <MenuItem value={'online'}>Online</MenuItem>
                        <MenuItem value={'inPerson'}>In person</MenuItem>
                    </Select>
                    <input type={'date'} className={styles.input_location} placeholder={'Date'} /> */}
                    <button className={styles.button_search} onClick={() => onSearchEvent(searchEventValue)}>
                        Search
                    </button>
                </div>
                <div className={styles.label}>
                    <div className={styles.label_title}>Attend upcoming events</div>
                    <div className={styles.label_text} onClick={() => router.push('/event/more-events')}>
                        More events <ChevronRightOutlinedIcon className={styles.icon_collapse} />
                    </div>
                </div>
                <div className={styles.line} />
                <div className={styles.list_event}>
                    {newestEventList.map((item) => (
                        <EventItem item={item} onGetSharedLink={onGetSharedLink} renderInterestedIcon={renderInterestedIcon} key={item.id} />
                    ))}
                </div>

                {modalShare && <ModalShare link={link} onCloseModal={onCloseModalShare} onSuccess={onSuccess} />}
            </div>
        </>
    );
};

const EventItem = (props) => {
    const { item, onGetSharedLink, renderInterestedIcon } = props;
    const router = useRouter();
    const [img, setImg] = useState('');

    useEffect(() => {
        retrieveImagesCover();
    }, []);

    const retrieveImagesCover = async () => {
        if (item && item.cover_image && item.cover_image !== '' && item.img === '/calendar.svg') {
            const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_w3key });
            const res = await client.get(item.cover_image);
            if (res.ok) {
                const files = await res.files();
                for (const file of files) {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        setImg(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    return (
        <div className={styles.event_item} key={item.id}>
            <div className={styles.event_item_header}>
                <div className={styles.event_item_type}>{item.type}</div>
                <img src={img} className={styles.event_item_img} alt="img" onClick={() => router.push(`/event/event-detail?id=${item.id}`)} />
            </div>
            <div className={styles.event_item_info}>
                <div className={styles.event_item_date}>{item.date}</div>
                <div className={styles.event_item_name} onClick={() => router.push(`/event/event-detail?id=${item.id}`)}>
                    {item.name}
                </div>
                <div className={styles.event_item_footer}>
                    <div className={styles.event_item_attendees}>{item.attendees} attendees</div>
                    <ShareOutlinedIcon
                        className={styles.event_item_icon}
                        onClick={() => {
                            onGetSharedLink(item.id);
                        }}
                    />
                    {renderInterestedIcon(item)}
                </div>
            </div>
        </div>
    );
};

export default Event;
