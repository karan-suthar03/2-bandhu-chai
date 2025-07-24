import { Box, Pagination } from '@mui/material';

const PaginationControl = ({ pagination, filters, setFilters }) => {
    if (pagination.pages <= 1) return null;
    return (
        <Box mt={3} display="flex" justifyContent="flex-end">
            <Pagination
                count={pagination.pages}
                page={filters.page}
                onChange={(_, page) => setFilters((prev) => ({ ...prev, page }))}
                shape="rounded"
                color="primary"
            />
        </Box>
    );
};

export default PaginationControl;