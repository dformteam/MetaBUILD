/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import styles from './JoinedForm.module.scss';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const MyForm = () => {
    const raws = [];
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const mouted = useRef(false);
    const aNav = [
        { id: 'all-form', label: 'All Form', url: '/form/my-form', icon: null },
        { id: 'share-with-me', label: 'Share With Me', url: '/form/joined-form', icon: null },
        // { id: 'favorites', label: 'Favorites', icon: FavoriteOutlinedIcon },
    ];

    const headers = ['Form name', 'Type', 'Last summited'];
    const [rows, setRows] = useState([]);

    useLayoutEffect(() => {
        mouted.current = true;
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
            ?.get_joined_forms_count?.({
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
                    .get_joined_forms({
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

                                setRows([...forms]);
                            }
                        }
                    });
            }),
        );
    };

    const onExportDateTime = (datetime) => {
        try {
            if (datetime === '0') {
                return 'unknown';
            }

            const timestamp = parseFloat(datetime);
            const date = new Date(timestamp);
            const localDate = date.toLocaleDateString();
            const localTime = date.toLocaleTimeString();
            return `${localDate} ${localTime}`;
        } catch {
            return 'unknow';
        }
    };

    const onAnalysisForm = (item) => {
        router.push(`form-analysis?id=${item.form_id}`);
    };

    const onNavItemClicked = (item) => {
        router.push(item.url);
    };

    return (
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
                <div className={styles.content_title}>
                    Your joined form
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
                                    <TableCell className={styles.cell}>{item.form_title}</TableCell>
                                    <TableCell className={styles.cell}>{item.type === 0 ? 'Basic' : 'Card'}</TableCell>
                                    <TableCell className={styles.cell}>{onExportDateTime(item.last_summited)}</TableCell>
                                    <TableCell className={styles.cell_action}>
                                        <button className={styles.table_button_edit} onClick={() => onAnalysisForm(item)}>
                                            View Analysis
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default MyForm;
