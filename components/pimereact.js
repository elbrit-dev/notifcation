
import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Slider } from "primereact/slider";
import { FilterMatchMode } from "primereact/api";
import { Image } from "primereact/image";

const PrimeDataTable = ({
  data = [],
  columns = [],
  columnGroups = null,
  loading = false,
  footerTotals = false,
  footerTotalsConfig = {
    showTotals: true,
    showAverages: false,
    showCounts: false,
    numberFormat: 'en-IN',
    currency: 'INR',
    precision: 0,
    includeColumns: [], // Specific columns to include (empty = all numeric)
    excludeColumns: []  // Specific columns to exclude
  },
  enableSearch = true,
  enableExport = true,
  enableColumnManagement = true,
  enableRowActions = false,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  customFormatters = {},
  rowActions = [],
  enableRowExpansion = false,
  rowExpansionTemplate,
  enableEditable = false,
  onRowEditComplete,
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  enableLazyLoading = false,
  onLazyLoad = () => {},
  className = "",
  style = {},
  onRowClick,
  onRowSelect,
  onPageChange,
  onFilterChange,
  onSortChange,
  onSearch,
  showGridlines = true,
  stripedRows = true,
  responsiveLayout = "scroll",
  tableHeight = "600px"
}) => {
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(columns);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [editingRows, setEditingRows] = useState({});
  const [lazyData, setLazyData] = useState([]);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  useEffect(() => {
    if (graphqlQuery && enableLazyLoading) {
      const params = { 
        first, 
        rows: pageSize, 
        filters, 
        globalFilterValue, 
        variables: graphqlVariables,
        sortField,
        sortOrder
      };
      onLazyLoad(params);
    }
  }, [first, filters, globalFilterValue, graphqlVariables, graphqlQuery, enableLazyLoading, pageSize, onLazyLoad, sortField, sortOrder]);

  const displayedData = graphqlQuery ? lazyData : data;

  // Call onGraphqlData when lazy data changes
  useEffect(() => {
    if (graphqlQuery && lazyData.length > 0 && onGraphqlData) {
      onGraphqlData({ data: lazyData });
    }
  }, [lazyData, graphqlQuery, onGraphqlData]);

  // Function to update lazy data (called from parent component)
  const updateLazyData = (newData, total) => {
    setLazyData(newData);
    if (total !== undefined) {
      setTotalRecords(total);
    }
  };

  // Expose updateLazyData function to parent
  useEffect(() => {
    if (window && window.updatePrimeDataTableLazyData) {
      window.updatePrimeDataTableLazyData = updateLazyData;
    }
  }, []);

  // Initialize with sample data if no data provided (for testing)
  useEffect(() => {
    if (data.length === 0 && columns.length === 0 && !graphqlQuery) {
      const sampleData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering', salary: 75000, active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing', salary: 65000, active: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales', salary: 80000, active: false },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Engineering', salary: 78000, active: true },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, department: 'HR', salary: 60000, active: true }
      ];
      // Note: This is just for testing - in production, you would pass data as props
      console.log('PrimeDataTable: No data provided, showing sample data for testing');
    }
  }, [data, columns, graphqlQuery]);

  // Generate columns from data if no columns provided
  const defaultColumns = useMemo(() => {
    let cols = [];
    if (columns.length > 0) {
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => columns.find(col => col.field === key)).filter(Boolean)
        : columns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.field));
    } else if (displayedData.length > 0) {
      const sampleRow = displayedData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
          type = 'datetime';
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          type = 'date';
        } else if (typeof value === 'string' && value.includes('@')) {
          type = 'email';
        }
        
        return {
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type,
          filterType: type === 'number' ? 'number' : type === 'date' || type === 'datetime' ? 'calendar' : 'text',
          minWidth: "120px",
          align: type === 'number' ? 'right' : type === 'boolean' ? 'center' : 'left'
        };
      });
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.field === key)).filter(Boolean)
        : autoColumns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.field));
    }
    return cols;
  }, [columns, displayedData, hiddenColumns, columnOrder]);

  const tableColumns = useMemo(() => selectedColumns.length ? selectedColumns : defaultColumns, [selectedColumns, defaultColumns]);

  const applyGlobalFilter = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, global: { value, matchMode: FilterMatchMode.CONTAINS } }));
    setGlobalFilterValue(value);
    if (onSearch) {
      onSearch({ searchTerm: value });
    }
  };

  const totalRow = useMemo(() => {
    if (!footerTotals || !data.length) return null;
    const totals = {};
    const averages = {};
    const counts = {};
    
    // Use tableColumns (which includes auto-generated columns) instead of just columns prop
    const columnsToProcess = tableColumns.length > 0 ? tableColumns : defaultColumns;
    
    columnsToProcess.forEach(col => {
      const field = col.field || col.key;
      if (!field) return;
      
      // Check if this column should be included/excluded
      if (footerTotalsConfig.includeColumns.length > 0 && !footerTotalsConfig.includeColumns.includes(field)) {
        return;
      }
      if (footerTotalsConfig.excludeColumns.includes(field)) {
        return;
      }
      
      if (typeof data[0][field] === "number") {
        const values = data.map(row => row[field] || 0).filter(val => val !== null && val !== undefined);
        
        if (footerTotalsConfig.showTotals) {
          totals[field] = values.reduce((sum, val) => sum + val, 0);
        }
        
        if (footerTotalsConfig.showAverages) {
          averages[field] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        }
        
        if (footerTotalsConfig.showCounts) {
          counts[field] = values.length;
        }
      }
    });
    
    return { totals, averages, counts };
  }, [data, tableColumns, defaultColumns, footerTotals, footerTotalsConfig]);

  const renderFooter = (col) => {
    if (!footerTotals || !totalRow) return null;
    const field = col.field || col.key;
    if (!field) return null;
    
    const { totals, averages, counts } = totalRow;
    const parts = [];
    
    if (footerTotalsConfig.showTotals && totals[field] !== undefined) {
      try {
        const formattedTotal = new Intl.NumberFormat(footerTotalsConfig.numberFormat || 'en-US', {
          style: footerTotalsConfig.currency ? 'currency' : 'decimal',
          currency: footerTotalsConfig.currency,
          minimumFractionDigits: footerTotalsConfig.precision || 2,
          maximumFractionDigits: footerTotalsConfig.precision || 2
        }).format(totals[field]);
        parts.push(`Total: ${formattedTotal}`);
      } catch (error) {
        console.warn('Footer total formatting error:', error);
        parts.push(`Total: ${totals[field].toLocaleString()}`);
      }
    }
    
    if (footerTotalsConfig.showAverages && averages[field] !== undefined) {
      try {
        const formattedAvg = new Intl.NumberFormat(footerTotalsConfig.numberFormat || 'en-US', {
          style: footerTotalsConfig.currency ? 'currency' : 'decimal',
          currency: footerTotalsConfig.currency,
          minimumFractionDigits: footerTotalsConfig.precision || 2,
          maximumFractionDigits: footerTotalsConfig.precision || 2
        }).format(averages[field]);
        parts.push(`Avg: ${formattedAvg}`);
      } catch (error) {
        console.warn('Footer average formatting error:', error);
        parts.push(`Avg: ${averages[field].toLocaleString()}`);
      }
    }
    
    if (footerTotalsConfig.showCounts && counts[field] !== undefined) {
      parts.push(`Count: ${counts[field]}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : null;
  };

  const getFilterElement = (col) => {
    const handleFilterChange = (value, matchMode) => {
      const newFilters = { ...filters, [col.field]: { value, matchMode } };
      setFilters(newFilters);
      if (onFilterChange) {
        onFilterChange({ column: col.field, filterConfig: newFilters[col.field] });
      }
    };

    switch (col.filterType) {
      case 'dropdown':
        return <Dropdown options={col.filterOptions || []} value={filters[col.field]?.value || null}
                         onChange={(e) => handleFilterChange(e.value, FilterMatchMode.EQUALS)}
                         placeholder={`Select ${col.header}`} className="p-column-filter" />;
      case 'calendar':
        return <Calendar value={filters[col.field]?.value || null}
                         onChange={(e) => handleFilterChange(e.value, FilterMatchMode.DATE_IS)}
                         placeholder={`Pick ${col.header}`} showIcon />;
      case 'number':
        return <InputNumber value={filters[col.field]?.value || null}
                            onValueChange={(e) => handleFilterChange(e.value, FilterMatchMode.EQUALS)}
                            placeholder={`Filter ${col.header}`} className="p-column-filter" />;
      case 'slider':
        return <Slider value={filters[col.field]?.value || 0}
                       onChange={(e) => handleFilterChange(e.value, FilterMatchMode.GREATER_THAN)}
                       min={col.min || 0} max={col.max || 100} />;
      default:
        return <InputText value={filters[col.field]?.value || ''}
                          onChange={(e) => handleFilterChange(e.target.value, FilterMatchMode.CONTAINS)}
                          placeholder={`Search ${col.header}`} className="p-column-filter" />;
    }
  };

  const exportCSV = () => {
    const csv = [
      tableColumns.map(col => col.header).join(","),
      ...data.map(row => tableColumns.map(col => JSON.stringify(row[col.field] || "")).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "export.csv";
    a.click();
  };

  return (
    <div className={className} style={style}>
      <Toolbar
        left={enableSearch && (
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={applyGlobalFilter} placeholder="Search..." />
          </span>
        )}
        right={<div className="flex gap-2">
          {enableColumnManagement && <Button icon="pi pi-cog" onClick={() => setShowColumnManager(true)} />}
          {enableExport && <Button icon="pi pi-download" onClick={exportCSV} />}
        </div>}
      />
      <DataTable
        value={displayedData}
        paginator={enablePagination}
        rows={pageSize}
        filters={filters}
        first={first}
        onPage={(e) => {
          setFirst(e.first);
          if (onPageChange) {
            onPageChange({ page: Math.floor(e.first / pageSize) + 1 });
          }
        }}
        totalRecords={graphqlQuery ? totalRecords : undefined}
        lazy={!!graphqlQuery}
        globalFilterFields={defaultColumns.map(col => col.field)}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={(e) => {
          setSelectedRows(e.value);
          if (onRowSelect) {
            onRowSelect({ selectedRows: e.value });
          }
        }}
        selectionMode={enableRowSelection ? "multiple" : null}
        headerColumnGroup={columnGroups?.header}
        footerColumnGroup={columnGroups?.footer}
        showGridlines={showGridlines}
        stripedRows={stripedRows}
        responsiveLayout={responsiveLayout}
        expandedRows={enableRowExpansion ? expandedRows : null}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={enableRowExpansion && rowExpansionTemplate ? rowExpansionTemplate : undefined}
        editMode={enableEditable ? "row" : undefined}
        editingRows={editingRows}
        onRowEditChange={(e) => setEditingRows(e.data)}
        onRowEditComplete={enableEditable && onRowEditComplete ? onRowEditComplete : undefined}
        loading={loading}
        onRowClick={onRowClick}
        onSort={(e) => {
          setSortField(e.sortField);
          setSortOrder(e.sortOrder);
          if (onSortChange) {
            onSortChange({ 
              sortField: e.sortField, 
              sortOrder: e.sortOrder 
            });
          }
        }}
        style={{ height: tableHeight }}
      >
        {enableRowSelection && <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />}
        {enableRowExpansion && <Column expander style={{ width: '3em' }} />}
        {tableColumns.map(col => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable
            filter
            filterElement={getFilterElement(col)}
            editor={enableEditable ? col.editor : undefined}
            body={(rowData) =>
              customFormatters[col.field]
                ? customFormatters[col.field](rowData[col.field], rowData)
                : col.isImage
                  ? <Image src={rowData[col.field]} alt={col.header} width="50" preview />
                  : rowData[col.field]
            }
            footer={renderFooter(col)}
            style={{ minWidth: col.minWidth || "120px", textAlign: col.align || "center" }}
          />
        ))}
        {enableRowActions && rowActions.length > 0 && (
          <Column
            header="Actions"
            body={(row) => (
              <div className="flex gap-2 justify-center">
                {rowActions.map((action, idx) => (
                  <Button key={idx} icon={action.icon} onClick={() => action.onClick(row)} tooltip={action.title} className="p-button-text p-button-sm" />
                ))}
              </div>
            )}
            style={{ minWidth: "120px" }}
          />
        )}
      </DataTable>
      <Dialog header="Manage Columns" visible={showColumnManager} style={{ width: '20rem' }} modal onHide={() => setShowColumnManager(false)}>
        <div className="flex flex-column gap-3">
          <MultiSelect
            value={selectedColumns}
            options={defaultColumns}
            optionLabel="header"
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select Columns"
            display="chip"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default PrimeDataTable;
