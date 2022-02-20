import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './Calendar.module.scss';
import Kalend, { CalendarView } from 'kalend';
import 'kalend/dist/styles/index.css';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const Calendar = (props) => {
    const events = [];
    const router = useRouter();
    const colorList = ['red', 'blue', 'orange', 'green', 'violet'];
    const [demoEvents, setDemoEvents] = useState(events);
    const wallet = useSelector((state) => state.wallet);

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
                                let eventInfo = {
                                    id: event.id,
                                    startAt: new Date(parseFloat(event.start_date)).toISOString(),
                                    endAt: new Date(parseFloat(event.end_date)).toISOString(),
                                    summary: event.name,
                                    color: colorList[Math.floor(Math.random() * colorList.length)],
                                };
                                events.push(eventInfo);
                            });
                            setDemoEvents([...events]);
                        }
                    });
            }),
        );
    };

    const onNewEventClick = (data) => {
        const msg = `New event click action\n\n Callback data:\n\n${JSON.stringify({
            hour: data.hour,
            day: data.day,
            event: 'click event ',
        })}`;
        console.log(msg);
    };

    const onEventClick = (data) => {
        const msg = `Click on event action\n\n Callback data:\n\n${JSON.stringify(data)}`;
        console.log(msg);
    };

    const onEventDragFinish = (prev, current, data) => {
        setDemoEvents(data);
    };

    const onCreateEventClick = () => {
        router.push('/event/create-event');
    };

    return (
        <div className={styles.root}>
            <div className={styles.button_area}>
                <button className={styles.button_area_button} onClick={onCreateEventClick}>
                    Create Event
                </button>
            </div>
            <Kalend
                kalendRef={props.kalendRef}
                onNewEventClick={onNewEventClick}
                initialView={CalendarView.WEEK}
                disabledViews={[]}
                onEventClick={onEventClick}
                events={demoEvents}
                initialDate={new Date().toISOString()}
                hourHeight={60}
                timezone={'Europe/Berlin'}
                onEventDragFinish={onEventDragFinish}
                onStateChange={props.onStateChange}
                selectedView={props.selectedView}
            />
        </div>
    );
};

export default Calendar;
