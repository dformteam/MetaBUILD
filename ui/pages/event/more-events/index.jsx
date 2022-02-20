import { useState, useLayoutEffect } from 'react';
import styles from './MoreEvent.module.scss';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Notify from '../../../components/Notify';


const MoreEvent = () => {
    const [type, setType] = useState('both');
    const [eventList, setEventList] = useState([]);
    const [isInterest, setIsInterest] = useState(false);
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');
    const [searchEventValue, setSearchEventValue] = useState('');

    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();

    const aEvents = [
        // {
        //     id: 1,
        //     name: 'Demo day © 2021 Learn NEAR Club © 2021 Learn NEAR Club © 2021 Learn NEAR Club',
        //     type: 'Online',
        //     date: 'Sat, Jan 15 @ 5:30 PM',
        //     attendees: 16,
        // },
        // { id: 2, name: '© 2021 Learn NEAR Club', type: 'Online + In person', date: 'Sat, Jan 15 @ 5:30 PM', attendees: 66 },
        // { id: 3, name: 'Event 3', type: 'In person', date: 'Sat, Jan 15 @ 5:30 PM', attendees: 16 },
        // { id: 4, name: 'Event 4', type: 'Online', date: 'Sat, Jan 15 @ 5:30 PM', attendees: 16 },
    ];

    const onTypeChange = (e) => {
        setType(e.target.value);
    };

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    useLayoutEffect(() => {
        onGetMaxRows();
    }, []);

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
        await Promise.all(
            page_arr.map(async (page, index) => {
                await contract
                    .get_events({
                        userId,
                        page: index + 1,
                    })
                    .then((data) => {
                        if (data) {
                            data.data.map((event) => {
                                let event_type = 'Online';
                                switch (event.event_type) {
                                    case 1:
                                        event_type = 'In person';
                                        break;
                                    case 2:
                                        event_type = 'Online + In person';
                                        break;
                                }
                                let eventInfo = {
                                    id: event.id,
                                    name: event.name,
                                    type: event_type,
                                    date: onExportDateTime(event.start_date),
                                    attendees: event.participants.length
                                }
                                aEvents.push(eventInfo);
                            });
                            setEventList([...aEvents]);
                        }
                    });
            }),
        );
    };

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    const onGetSharedLink = (id) => {
        const uri = new URL(window.location.href);
        const { origin } = uri;
        navigator.clipboard.writeText(`${origin}/event/event-detail?id=${id}`);
        onShowResult({
            type: 'success',
            msg: 'copied',
        });
    };

    const onEventFavoriteClick = (id) => {
        const { contract } = wallet;
        setOpenLoading(true);
        if (!isInterest) {
            contract
                ?.interest_event(
                    {
                        eventId: id,
                    },
                    50000000000000,
                )
                .then((res) => {
                    if (res) {
                        onShowResult({
                            type: 'success',
                            msg: 'Interested',
                        });
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
            setIsInterest(true);
        } else {
            contract
                ?.not_interest_event(
                    {
                        eventId: id,
                    },
                    50000000000000,
                )
                .then((res) => {
                    if (res) {
                        onShowResult({
                            type: 'success',
                            msg: 'Disinterested',
                        });
                    } else {
                        onShowResult({
                            type: 'error',
                            msg: 'Error when disinterested',
                        });
                    }
                })
                .catch((err) => {
                    onShowResult({
                        type: 'error',
                        msg: String(err),
                    });
                });
            setIsInterest(false);
        }
    };

    const onEventItemClick = (id) => {
        router.push(`/event/event-detail?id=${id}`);
    };

    const onSearchEvent = (id) => {
        if (id != '') {
            router.push(`/event/event-detail?id=${id}`);
        }
    };

    return (
        <>
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.search}>
                    <div className={styles.search_row}>
                        <div className={styles.search_area}>
                            <input placeholder={'Find your next event'} className={styles.search_input} value={searchEventValue} onChange={e => { setSearchEventValue(e.currentTarget.value); }} />
                            <SearchIcon className={styles.search_icon} />
                        </div>
                        <input className={styles.search_input_location} placeholder={'Location'} />
                        <Select
                            value={type}
                            onChange={onTypeChange}
                            className={styles.search_button_select}
                            inputProps={{ 'aria-label': 'Without label' }}
                            displayEmpty
                        >
                            <MenuItem value={'both'}>Online + In person</MenuItem>
                            <MenuItem value={'online'}>Online</MenuItem>
                            <MenuItem value={'inPerson'}>In person</MenuItem>
                        </Select>
                        <input type={'date'} className={styles.search_input_location} placeholder={'Date'} />
                        <button className={styles.search_button} onClick={() => onSearchEvent(searchEventValue)}>Search</button>
                    </div>
                </div>
                <div className={styles.event}>
                    <div className={styles.line} />
                    {eventList?.map?.((item) => {
                        return (
                            <div className={styles.event_item} key={item.id}>
                                <img src={'/calendar.svg'} className={styles.event_item_img} alt="img" />
                                <div className={styles.event_item_info}>
                                    <div className={styles.event_item_date}>{item.date}</div>
                                    <div className={styles.event_item_name} onClick={() => onEventItemClick(item.id)}>{item.name}</div>
                                    <div className={styles.event_item_attendees}>{item.attendees} attendees</div>
                                </div>
                                <div className={styles.event_item_share}>
                                    <ShareOutlinedIcon className={styles.event_item_icon} onClick={() => onGetSharedLink(item.id)} />
                                    <FavoriteBorderIcon className={styles.event_item_icon_favor} onClick={() => onEventFavoriteClick(item.id)} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default MoreEvent;
