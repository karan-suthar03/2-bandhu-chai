import { Box, Pagination } from '@mui/material';

const PaginationControl = ({ pagination, filters, setFilters }) => {
    if (!pagination || (pagination.totalPages || pagination.pages) <= 1) return null;
    const totalPages = pagination.totalPages || pagination.pages;
    return (
        <Box mt={3} display="flex" justifyContent="flex-end">
            <Pagination
                count={totalPages}
                page={filters.page}
                onChange={(_, page) => setFilters((prev) => ({ ...prev, page }))}
                shape="rounded"
                color="primary"
            />
        </Box>
    );
};

export default PaginationControl;