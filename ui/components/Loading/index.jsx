import React from 'react';
import Backdrop from '@mui/material/Backdrop';

const Loading = (props) => {
    const { open } = props;
    return (
        <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={open}>
            <img src={'/loadingWhite.svg'} style={{ width: 100, height: 100 }} alt="img" />
        </Backdrop>
    );
};

export default Loading;
