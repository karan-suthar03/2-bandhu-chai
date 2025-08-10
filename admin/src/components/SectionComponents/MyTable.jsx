import {
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableSortLabel,
    Checkbox,
    Typography,
} from '@mui/material';

const MyTable = ({ children, sort, handleSortChange, columns }) => {
    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ overflow: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell key={col.label}>
                                    {col.key ? (
                                        <TableSortLabel
                                            active={sort.field === col.key}
                                            direction={sort.field === col.key ? sort._order : 'asc'}
                                            onClick={() => handleSortChange(col.key)}
                                        >
                                            <Typography noWrap fontWeight="bold">{col.label}</Typography>
                                        </TableSortLabel>
                                    ) : (
                                        <Typography noWrap fontWeight="bold">{col.label}</Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {children}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default MyTable;
