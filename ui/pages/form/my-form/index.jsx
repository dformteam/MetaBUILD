/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './MyForm.module.scss';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { useRouter, withRouter } from 'next/router';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Notify from '../../../components/Notify';
import Confirmation from '../../../components/Confirmation';

const MyForm = () => {
    const raws = [];
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;
    const mouted = useRef(false);

    const headers = ['Form name', 'Submissions', 'Type', 'Created at', 'status'];
    const [rows, setRows] = useState([]);
    const [filter, setFilter] = useState(query.filter || 'editable');
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [unfiltered, setUnfilterd] = useState([]);
    const [currentForm, setCurrentForm] = useState({});
    const [openLoading, setOpenLoading] = useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [snackMsg, setSnackMsg] = useState('');

    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    const onShowResult = ({ type, msg }) => {
        setOpenSnack(true);
        setOpenLoading(false);
        setAlertType(type);
        setSnackMsg(msg);
    };

    useLayoutEffect(() => {
        mouted.current = true;
        const my_filter = query.filter;
        if (my_filter === null || my_filter === '' || typeof my_filter === 'undefined') {
            router.push(`?filter=editable`);
        }

        onGetMaxRows();
        return () => {
            mouted.current = false;
        };
    }, []);

    const getActiveClassName = () => {
        return router.pathname;
    };

    const navActive = getActiveClassName();

    const onGetMaxRows = () => {
        const { contract, walletConnection } = wallet;
        const userId = walletConnection.getAccountId();
        contract
            ?.get_form_count?.({
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
        setRows([]);
        const userId = walletConnection.getAccountId();
        await Promise.all(
            page_arr.map(async (page, index) => {
                await contract
                    .get_forms({
                        userId,
                        page: index + 1,
                    })
                    .then((data) => {
                        if (data) {
                            const pIndex = raws.findIndex((x) => x?.page === data?.page);
                            if (pIndex === -1) {
                                raws.push(data);
                                raws.sort((a, b) => {
                                    if (a.page < b.page) return -1;
                                    if (a.page > b.page) return 1;
                                    return 0;
                                });
                                let forms = [];
                                raws.map((raw) => {
                                    forms = [...forms, ...(raw?.data || [])];
                                    return raw;
                                });

                                mouted && setUnfilterd([...forms]);
                            }
                        }
                    });
            }),
        );
    };

    const onViewForm = (item) => {
        router.push(`/form/view-form?id=${item.id}`);
    };

    const onDeleteFormClick = (element) => {
        setCurrentForm(element);
        setOpenConfirmation(true);
    };

    const onExportDateTime = (datetime) => {
        try {
            const timestamp = parseFloat(datetime);
            const date = new Date(timestamp);
            const localDate = date.toLocaleDateString();
            const localTime = date.toLocaleTimeString();
            return `${localDate} ${localTime}`;
        } catch {
            return 'unknow';
        }
    };

    const onExportFormStatus = (item) => {
        const { cast_status } = item;
        switch (cast_status) {
            case 0:
                return 'Editable';
            case 1:
                return 'Waiting for publish';
            case 2:
                return 'Publishing';
            case 3:
                return 'Finished';
            default:
                return 'unknown';
        }
    };

    const onNavItemClicked = (item) => {
        router.push(item.url);
    };

    useEffect(() => {
        onFillterTable();
    }, [filter]);

    useEffect(() => {
        onCastFormStatus();
        onFillterTable();
    }, [unfiltered]);

    const onFillterTable = () => {
        const my_filter = query.filter;
        if (my_filter === 'editable') {
            const filterd = unfiltered.filter((x) => {
                return x.status === 0;
            });

            setRows([...filterd]);
        } else if (my_filter === 'publishing') {
            const currenTimeStamp = Date.now();
            const filterd = unfiltered.filter((x) => {
                return x.status === 1 && x.end_date > currenTimeStamp;
            });

            setRows([...filterd]);
        } else if (my_filter === 'finished') {
            const currenTimeStamp = Date.now();
            const filterd = unfiltered.filter((x) => {
                return (x.status === 1 && x.end_date < currenTimeStamp) || x.status === 2;
            });

            setRows([...filterd]);
        } else {
            setRows([...unfiltered]);
        }
    };

    const onCastFormStatus = () => {
        unfiltered?.map((item) => {
            const { status, start_date, end_date } = item;
            const cTimestamp = Date.now();
            if (status === 0) {
                item['cast_status'] = 0;
            }
            if (status === 1 && cTimestamp < start_date) {
                item['cast_status'] = 1;
            }
            if (status === 1 && cTimestamp > start_date && cTimestamp < end_date) {
                item['cast_status'] = 2;
            }
            if ((status === 1 && cTimestamp > end_date) || status === 2) {
                item['cast_status'] = 3;
            }

            return item;
        });
    };

    const onFilterChange = (event) => {
        router
            .push(`?filter=${event.target.value}`)
            .then((res) => {
                if (res) {
                    setFilter(event.target.value);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const onAcceptDeleteForm = () => {
        const { contract } = wallet;
        setOpenConfirmation(false);
        setOpenLoading(true);

        contract
            ?.delete_form?.(
                {
                    id: currentForm?.id,
                },
                50000000000000,
            )
            .then((ret) => {
                if (ret) {
                    onShowResult({
                        type: 'success',
                        msg: 'Form has been deleted',
                    });
                    onGetMaxRows();
                } else {
                    onShowResult({
                        type: 'error',
                        msg: 'Somethings went wrong, try again later',
                    });
                }
            })
            .catch((err) => {
                onShowResult({
                    type: 'success',
                    msg: String(err),
                });
            });
    };

    const onDenyDeleteForm = () => {
        setOpenConfirmation(false);
    };

    return (
        <>
            {openConfirmation && <Confirmation label={confirmationLabel} onAccept={onAcceptDeleteForm} onCancel={onDenyDeleteForm} />}
            <Notify openLoading={openLoading} openSnack={openSnack} alertType={alertType} snackMsg={snackMsg} onClose={onCloseSnack} />
            <div className={styles.root}>
                <div className={styles.nav}>
                    <div className={styles.nav_title}>My Forms</div>
                    {aNav.map((item, index) => {
                        return (
                            <Fragment key={index}>
                                <div className={navActive === item.url ? styles.nav_label_active : styles.nav_label} onClick={() => onNavItemClicked(item)}>
                                    {item.icon && <item.icon className={styles.nav_icon} />}
                                    {item.label}
                                </div>
                                <div className={styles.line} />
                            </Fragment>
                        );
                    })}
                </div>
                <div className={styles.content}>
                    <div className={styles.content_row}>
                        {/* <button
                        className={`${styles.content_button} ${aRowSelected.length !== 1 && styles.disabled}`}
                        disabled={aRowSelected.length !== 1}
                        onClick={onAnalysisForm}
                    >
                        Analysis
                    </button>
                    <button className={`${styles.content_button_delete} ${aRowSelected.length === 0 && styles.disabled}`} disabled={aRowSelected.length === 0}>
                        Delete Selected
                    </button> */}
                        <div className={styles.filter}>Filter:</div>
                        <Select
                            value={filter}
                            onChange={onFilterChange}
                            className={styles.content_button_filter}
                            inputProps={{ 'aria-label': 'Without label' }}
                            displayEmpty
                        >
                            <MenuItem value={'all'}>All</MenuItem>
                            <MenuItem value={'editable'}>Editable</MenuItem>
                            <MenuItem value={'publishing'}>Publishing</MenuItem>
                            <MenuItem value={'finished'}>Finished</MenuItem>
                        </Select>
                    </div>
                    <div className={styles.line} />
                    <div className={styles.table}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {/* <TableCell className={styles.cell_select_area}>
                                    {aRowSelected.length === rows.length && aRowSelected.length > 0 ? (
                                        <CheckBoxIcon className={styles.table_icon_select} onClick={() => onSelectAllRow(false)} />
                                    ) : (
                                        <CheckBoxOutlineBlankIcon className={styles.table_icon_select} onClick={() => onSelectAllRow(true)} />
                                    )}
                                    {aRowFavorite.length === rows.length && aRowSelected.length > 0 ? (
                                        <FavoriteOutlinedIcon className={styles.table_icon_favor} onClick={() => onAddAllFavorite(false)} />
                                    ) : (
                                        <FavoriteBorderOutlinedIcon className={styles.table_icon_favor} onClick={() => onAddAllFavorite(true)} />
                                    )}
                                </TableCell> */}
                                    {headers.map((header, index) => (
                                        <TableCell align="left" key={index} className={styles.table_title}>
                                            {header.toUpperCase()}
                                        </TableCell>
                                    ))}
                                    <TableCell className={styles.table_title}>{'ACTIONS'}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows?.map?.((item, index) => (
                                    <TableRow key={index}>
                                        {/* <TableCell className={styles.cell_select_area}>
                                        <span onClick={() => onSelectRow(item, index)}>
                                            {item.select ? (
                                                <CheckBoxIcon className={styles.table_icon_select} />
                                            ) : (
                                                <CheckBoxOutlineBlankIcon className={styles.table_icon_select} />
                                            )}
                                        </span>
                                        <span onClick={() => onAddFavorite(item, index)}>
                                            {item.favorite ? (
                                                <FavoriteOutlinedIcon className={styles.table_icon_favor} />
                                            ) : (
                                                <FavoriteBorderOutlinedIcon className={styles.table_icon_favor} />
                                            )}
                                        </span>
                                    </TableCell> */}
                                        <TableCell className={styles.cell_title} onClick={() => onViewForm(item)}>
                                            {item.title}
                                        </TableCell>
                                        <TableCell className={styles.cell}>{item.participants?.length}</TableCell>
                                        <TableCell className={styles.cell}>{item.type === 0 ? 'Basic' : 'Card'}</TableCell>
                                        <TableCell className={styles.cell}>{onExportDateTime(item.created_at)}</TableCell>
                                        <TableCell className={styles.cell}>{onExportFormStatus(item)}</TableCell>
                                        <TableCell className={styles.cell_action}>
                                            <div className={styles.action_button_area}>
                                                <button className={styles.table_button_edit} onClick={() => onViewForm(item)}>
                                                    <PreviewOutlinedIcon className={styles.table_button_icon} /> View
                                                </button>
                                                <button className={styles.table_button_delete} onClick={() => onDeleteFormClick(item)}>
                                                    <DeleteOutlinedIcon className={styles.table_button_icon} /> Delete
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withRouter(MyForm);

const aNav = [
    { id: 'all-form', label: 'All Form', url: '/form/my-form', icon: null },
    { id: 'share-with-me', label: 'Share With Me', url: '/form/joined-form', icon: null },
    // { id: 'favorites', label: 'Favorites', icon: FavoriteOutlinedIcon },
];

const confirmationLabel = {
    title: 'Confirmation',
    desc: 'Are you sure to delete this form?',
    accept: 'Accept',
    cancel: 'Deny',
};
