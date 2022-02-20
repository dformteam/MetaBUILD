import styles from './Header.module.scss';

const Header = () => {
    return (
        <div className={styles.root_header}>
            <div className={styles.header_content}>
                <input className={styles.heading_input} placeholder={'Heading'} />
                <input className={styles.subheader_input} placeholder={'Type a subheader'} />
                {/* <div className={styles.header_text}>1 question(s)</div> */}
            </div>
        </div>
    );
};

export default Header;
