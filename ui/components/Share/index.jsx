import React from 'react';
import styles from './Share.module.scss';
import {
    FacebookShareButton,
    TwitterShareButton,
    TelegramShareButton,
    EmailShareButton,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    EmailIcon,
} from 'react-share';
import LinkIcon from '@mui/icons-material/Link';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 400,
    bgcolor: '#fff',
    borderRadius: '24px',
    boxShadow: 24,
    p: 4,
    outline: 'none',
    paddingTop: '20px',
};

const Share = (props) => {
    const shareUrl = props.link;
    const title = 'dSuite';

    const onCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        props.onCloseModal();
        props.onSuccess();
    };

    return (
        <Modal open={true} onClose={props.onCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2" textAlign={'center'}>
                    Share this event
                </Typography>
                <div className={styles.line_gradient} />
                <div className={styles.container}>
                    <FacebookShareButton url={shareUrl} quote={title} className={styles.container_network}>
                        <FacebookIcon size={32} round />
                        <div className={styles.container_network_title}>Facebook</div>
                    </FacebookShareButton>

                    <TwitterShareButton url={shareUrl} title={title} className={styles.container_network}>
                        <TwitterIcon size={32} round />
                        <div className={styles.container_network_title}>Twitter</div>
                    </TwitterShareButton>

                    <TelegramShareButton url={shareUrl} title={title} className={styles.container_network}>
                        <TelegramIcon size={32} round />
                        <div className={styles.container_network_title}>Telegram</div>
                    </TelegramShareButton>

                    <EmailShareButton url={shareUrl} title={title} className={styles.container_network}>
                        <EmailIcon size={32} round />
                        <div className={styles.container_network_title}>Email</div>
                    </EmailShareButton>

                    <button className={styles.container_network} onClick={onCopyLink}>
                        <div className={styles.container_network_icon}>
                            <LinkIcon className={styles.container_network_icon_svg} />
                        </div>
                        <div className={styles.container_network_title}>Copy link</div>
                    </button>
                </div>
            </Box>
        </Modal>
    );
};

export default Share;
