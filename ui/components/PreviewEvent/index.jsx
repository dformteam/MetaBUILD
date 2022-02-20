import React, { useEffect, useState } from 'react';
import styles from './PreviewEvent.module.scss';
import AccessAlarmOutlinedIcon from '@mui/icons-material/AccessAlarmOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';

const PreviewEvent = (event_info) => {
    const [attendees, setAttend] = useState([
        { id: '1', wallet: 'bob.near' },
        { id: '2', wallet: 'alice.near' },
    ]);
    const [start_date, setStartingDate] = useState('');
    // const [start_time, setStartingTime] = useState('');
    const [end_date, setEndDate] = useState('');
    const [event_link, setEventLink] = useState('');
    const [event_name, setEventName] = useState('');
    const [event_descriptions, setEventDescription] = useState([
        {
            value: '',
        },
    ]);
    const [event_type, setEventType] = useState('');
    const [event_owner, setEventOwner] = useState('');

    const formatAMPM = (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    useEffect(() => {
        let start_date_str = 'Your start date';
        let start_time_str = 'Your start time';
        let temp_event = JSON.parse(localStorage.getItem('temp_event'));
        let st_date = new Date(temp_event.start_date);
        if (temp_event.start_date) {
            start_date_str = `${days[st_date.getDay()]}, ${st_date.toLocaleString('en-US', { month: 'long' })} ${st_date.getDate()}, ${st_date.getFullYear()}`;
            start_time_str = formatAMPM(st_date);
        }

        setEventName(temp_event.name);
        setEventOwner(temp_event.owner);
        setEventLink(temp_event.link);
        setEventDescription(temp_event.descriptions);
        setEventType(temp_event.type);
        setStartingDate(temp_event.start_date);
        setEndDate(temp_event.end_date);
        // setStartingTime(start_time_str);
    }, []);

    const exportStartDate = (date) => {
        return new Date(parseFloat(date)).toLocaleString();
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <div className={styles.content_info}>
                    <div className={styles.content_info_date}>{days[new Date().getDay()]}, {new Date().toLocaleString('en-US', { month: 'long' })} {new Date().getDate()}, {new Date().getFullYear()}</div>
                    <div className={styles.content_info_name}>{event_name}</div>
                    <div className={styles.content_info_row}>
                        <img src={'/calendar.svg'} className={styles.content_info_row_icon} />
                        <div className={styles.content_info_row_info}>
                            <div className={styles.content_info_row_info_host}>Hosted By</div>
                            <div className={styles.content_info_row_info_wallet}>{event_owner}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.content_detail}>
                    <div className={styles.content_detail_row}>
                        <div className={styles.content_detail_cover}>
                            <img src={localStorage.getItem('temp_image') || '/calendar.svg'} alt="cover" className={styles.content_detail_cover_img} />
                        </div>
                        <div className={styles.content_detail_info}>
                            <div className={styles.content_detail_info_row}>
                                <AccessAlarmOutlinedIcon className={styles.content_detail_info_icon} />
                                <div className={styles.content_detail_info_column}>
                                    {/* <div className={styles.content_detail_info_date}>{start_date}</div>
                                    <div className={styles.content_detail_info_date}>{start_time}</div> */}
                                    <div className={styles.content_detail_info_date}>{exportStartDate(start_date)}</div>
                                    <div className={styles.content_detail_info_date}>to</div>
                                    <div className={styles.content_detail_info_date}>{exportStartDate(end_date)}</div>
                                    {/* <div className={styles.content_detail_info_add}>Add to calendar</div> */}
                                </div>
                            </div>
                            <div className={styles.content_detail_info_row}>
                                <AttachFileOutlinedIcon className={styles.content_detail_info_icon} />
                                <div className={styles.content_detail_info_column}>
                                    <div className={styles.content_detail_info_date}>{event_type}</div>
                                    <div className={styles.content_detail_info_link}>{event_link || 'https://example.net/'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.content_detail_label}>Details</div>
                    <div className={styles.content_detail_text}>
                        {event_descriptions?.map?.((des) => {
                            return (
                                <div>
                                    {des.value || ''}
                                    <br />
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.content_detail_label}>Attendees ({attendees?.length || 0})</div>
                    <div className={styles.content_detail_list}>
                        {attendees?.map?.((item) => {
                            return (
                                <div className={styles.content_detail_list_wallet} key={item.id}>
                                    {item.wallet}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewEvent;
