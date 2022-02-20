import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import styles from './Customtable.module.scss';

function DataTable({ title, data }) {
    const headers = [];
    data[0]?.answers?.map?.((item) => headers.push(item?.title));

    return (
        <Paper className={styles.paper}>
            {title && (
                <Typography variant='h4' color='inherit'>
                    {title}
                </Typography>
            )}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className={styles.cell}>{'USER ID'}</TableCell>
                        {headers?.map?.((header, index) => (
                            <TableCell align='left' key={index} className={styles.cell}>
                                {header?.toUpperCase()}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map?.((emp, index) => (
                        <TableRow key={index}>
                            <TableCell className={styles.cell}>{emp?.userId}</TableCell>
                            {emp?.answers?.map?.((item, ind) => (
                                <TableCell align='left' key={ind} className={styles.cell}>
                                    {item?.answer}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}

export default DataTable;
