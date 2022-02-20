import { useRouter } from 'next/router';
import styles from './Home.module.scss';

const Home = () => {
    const aContent = [
        { id: 'form', title: 'Form', label: 'Change for the better. Click, Create, Use.', router: '/form', icon: 'basic_form.svg' },
        { id: 'event', title: 'Event', label: 'Connect to the world. Create your event, now!', router: '/event', icon: '/card_form.svg' },
        { id: 'calendar', title: 'Calendar', label: 'Simple solutions to complex problems.', router: '/calendar', icon: 'calendar.svg' },
    ];

    const router = useRouter();

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                <div className={styles.content_title}>dSuite</div>
                <div className={styles.content_sub}>Your vision, Our future</div>
                {aContent.map((item) => {
                    return (
                        <div className={styles.content_item} key={item.id}>
                            <img src={item.icon} className={styles.content_item_icon} alt="" />
                            <div className={styles.content_item_content}>
                                <div className={styles.content_item_title}>{item.title}</div>
                                <div className={styles.content_item_label}>{item.label}</div>
                            </div>
                            <button className={styles.content_item_button} onClick={() => router.push(item.router)}>
                                Explore
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
