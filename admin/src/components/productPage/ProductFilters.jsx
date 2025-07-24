import React, { useState } from 'react';
import {
    Box,
    Stack,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Menu,
    Checkbox,
    FormControlLabel,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const allExtraFilters = [
    'id', 'description', 'badge',
    'category', 'minPrice', 'maxPrice',
    'minStock', 'maxStock', 'featured',
    'organic', 'isNew', 'fastDelivery'
];

const ProductFilters = ({ filters, setFilters, searchDebounce, setSearchDebounce }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [activeExtraFilters, setActiveExtraFilters] = useState([]);

    const handleAddFilter = (filter) => {
        if (!activeExtraFilters.includes(filter)) {
            setActiveExtraFilters([...activeExtraFilters, filter]);
        }
        handleCloseMenu();
    };

    const handleRemoveFilter = (filter) => {
        setActiveExtraFilters(activeExtraFilters.filter((f) => f !== filter));
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[filter];
            return updated;
        });
    };

    const handleCloseMenu = () => setAnchorEl(null);
    const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchDebounce(value);
        if (window.searchDebounceTimeout) clearTimeout(window.searchDebounceTimeout);
        window.searchDebounceTimeout = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: value, page: 1 }));
        }, 400);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const renderFilterField = (filter) => {
        const val = filters[filter] || '';

        const removeBtn = (
            <IconButton size="small" onClick={() => handleRemoveFilter(filter)}>
                <CloseIcon fontSize="small" />
            </IconButton>
        );

        switch (filter) {
            case 'featured':
            case 'organic':
            case 'isNew':
            case 'fastDelivery':
                return (
                    <Box key={filter} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters[filter] || false}
                                    onChange={(e) => handleFilterChange(filter, e.target.checked)}
                                />
                            }
                            label={filter}
                        />
                        {removeBtn}
                    </Box>
                );

            default:
                return (
                    <TextField
                        key={filter}
                        type={filter.includes('min') || filter.includes('max') ? 'number' : 'text'}
                        label={filter}
                        value={val}
                        onChange={(e) => handleFilterChange(filter, e.target.value)}
                        InputProps={{
                            endAdornment: removeBtn
                        }}
                    />
                );
        }
    };


    return (
        <Box>
            <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                <TextField label="Search" value={searchDebounce} onChange={handleSearchChange} />

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Per Page</InputLabel>
                    <Select
                        value={filters.limit}
                        label="Per Page"
                        onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    >
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={24}>24</MenuItem>
                        <MenuItem value={48}>48</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="outlined" onClick={handleOpenMenu}>
                    More Filters
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
                {activeExtraFilters.map((filter) => renderFilterField(filter))}
            </Stack>

            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
                {allExtraFilters
                    .filter((f) => !activeExtraFilters.includes(f))
                    .map((filter) => (
                        <MenuItem key={filter} onClick={() => handleAddFilter(filter)}>
                            {filter}
                        </MenuItem>
                    ))}
                {activeExtraFilters.length === allExtraFilters.length && (
                    <MenuItem disabled>All filters added</MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default ProductFilters;
