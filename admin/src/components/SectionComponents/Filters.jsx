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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Filters = ({ filters, setFilters, searchDebounce, setSearchDebounce, allExtraFilters }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [activeExtraFilters, setActiveExtraFilters] = useState(() => {
        return allExtraFilters.filter(f => {
            const v = filters[f.key];
            return (
                (f.isBoolean && v != null) ||
                (!f.isBoolean && v !== undefined && v !== '')
            );
        });
    });

    const handleAddFilter = (filter) => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            [filter.key]: filter.isBoolean ? true : ''
        }));
        if (!activeExtraFilters.includes(filter)) {
            setActiveExtraFilters([...activeExtraFilters, filter]);
        }
        handleCloseMenu();
    };

    const handleRemoveFilter = (filter) => {
        setActiveExtraFilters(activeExtraFilters.filter((f) => f.key !== filter.key));
        setFilters((prev) => {
            const updated = { ...prev };
            delete updated[filter.key];
            return updated;
        });
    };

    const handleRemoveAllFilters = () => {
        setActiveExtraFilters([]);
        setFilters((prev) => {
            const updated = { ...prev };
            allExtraFilters.forEach(f => {
                delete updated[f.key];
            });
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
        const val = filters[filter.key] || '';
        const removeBtn = (
            <IconButton size="small" onClick={() => handleRemoveFilter(filter)}>
                <CloseIcon fontSize="small" />
            </IconButton>
        );

        if (filter.isBoolean) {
            return (
                <Box key={filter.key} sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!filters[filter.key]}
                                onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                            />
                        }
                        label={filter.label}
                    />
                    {removeBtn}
                </Box>
            );
        }

        if (filter.isEnum) {
            return (
                <FormControl key={filter.key} sx={{ minWidth: 140 }}>
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                        value={val}
                        label={filter.label}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        endAdornment={removeBtn}
                    >
                        {filter.enumValues.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        if (filter.isTime) {
            return (
                <LocalizationProvider key={filter.key} dateAdapter={AdapterDateFns}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DatePicker
                            label={filter.label}
                            value={val ? new Date(val) : null}
                            onChange={(date) => {
                                const formatted = date ? date.toISOString().split('T')[0] : '';
                                handleFilterChange(filter.key, formatted);
                            }}
                            slotProps={{
                                textField: { variant: 'outlined', size: 'medium' }
                            }}
                        />
                        <IconButton size="small" onClick={() => handleRemoveFilter(filter)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </LocalizationProvider>
            );
        }

        return (
            <TextField
                key={filter.key}
                type={filter.key.includes('min') || filter.key.includes('max') ? 'number' : 'text'}
                label={filter.label}
                value={val}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                InputProps={{ endAdornment: removeBtn }}
            />
        );
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
                <Button variant="outlined" color="error" onClick={handleRemoveAllFilters} disabled={activeExtraFilters.length === 0}>
                    Remove All Filters
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
                {activeExtraFilters.map((filter) => renderFilterField(filter))}
            </Stack>

            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
                {allExtraFilters
                    .filter((f) => !activeExtraFilters.includes(f))
                    .map((filter) => (
                        <MenuItem key={filter.key} onClick={() => handleAddFilter(filter)}>
                            {filter.label}
                        </MenuItem>
                    ))}
                {activeExtraFilters.length === allExtraFilters.length && (
                    <MenuItem disabled>All filters added</MenuItem>
                )}
            </Menu>
        </Box>
    );
};

export default Filters;
