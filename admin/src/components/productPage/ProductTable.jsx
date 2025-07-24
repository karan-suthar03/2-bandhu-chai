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
    CircularProgress,
    Typography,
} from '@mui/material';
import ProductRow from './ProductRow';

const ProductTable = ({ products, sort, handleSortChange, columns }) => {
    return (
        <Paper>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox color="primary" />
                            </TableCell>
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
                    <TableBody>{
                        products.map((product) => (
                            <ProductRow key={product.id} product={product}/>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ProductTable;
