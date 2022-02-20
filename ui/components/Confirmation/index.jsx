import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import styles from './Confirmation.module.scss';

const Confirmation = ({ label = {}, onAccept, onCancel }) => {
    const handleAccept = () => {
        onAccept?.();
    };

    return (
        <Dialog open={true} aria-labelledby="draggable-dialog-title">
            <div className={styles.root}>
                <div className={styles.root_title}>{label.title}</div>
                <div className={styles.root_content}>
                    <WarningAmberOutlinedIcon className={styles.root_content_icon} />
                    <div className={styles.root_content_text}>{label.desc}</div>
                </div>
                <div className={styles.root_action}>
                    <button onClick={onCancel} className={styles.root_action_cancel}>
                        {label.cancel}
                    </button>
                    <button onClick={handleAccept} className={styles.root_action_accept}>
                        {label.accept}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default Confirmation;
