import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function useDataList(defaultFilters, fetchFunction) {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialFilters = useMemo(() => {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = isNaN(value) ? value : Number(value);
        }
        return { ...defaultFilters, ...params };
    }, [searchParams, defaultFilters]);

    const [filters, setFilters] = useState(initialFilters);
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current) {
            setFilters(initialFilters);
            hasInitialized.current = true;
        }
    }, [initialFilters]);

    const [sort, setSort] = useState({
        field: initialFilters._sort,
        _order: initialFilters._order,
    });
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchDebounce, setSearchDebounce] = useState(initialFilters.search);

    useEffect(() => {
        const params = {};
        Object.entries(filters).forEach(([key, val]) => {
            if (val !== '' && val != null) params[key] = val;
        });
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await fetchFunction(filters);
                setData(data.data);
                setPagination(data.pagination);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters, fetchFunction]);

    const handleSortChange = (field) => {
        setSort((prev) => {
            const nextOrder =
                prev.field === field && prev._order === 'asc' ? 'desc' : 'asc';
            setFilters((f) => ({
                ...f,
                _sort: field,
                _order: nextOrder,
                page: 1,
            }));
            return { field, _order: nextOrder };
        });
    };

    return {
        filters,
        setFilters,
        sort,
        handleSortChange,
        data,
        pagination,
        loading,
        searchDebounce,
        setSearchDebounce,
    };
}