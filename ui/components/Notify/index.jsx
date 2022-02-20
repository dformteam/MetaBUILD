import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../Alert';
import Loading from '../Loading';
import styles from './Notify.module.scss';

const Notify = (props) => {
    const { openSnack, snackMsg, alertType, openLoading, onClose } = props;

    return (
        <>
            <Loading open={openLoading} />
            <Snackbar
                open={openSnack}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                className={styles.snack_area}
                autoHideDuration={3000}
                onClose={onClose}
            >
                <Alert onClose={onClose} sx={{ width: '100%' }} severity={alertType}>
                    {snackMsg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Notify;
