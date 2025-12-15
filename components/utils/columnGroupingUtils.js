import React, { useCallback } from 'react';
import { Column } from 'primereact/column';
import { Row } from 'primereact/row';
import { ColumnGroup } from 'primereact/columngroup';

// Exact column grouping functions extracted from PrimeDataTable.js
export const createColumnGroupingHandlers = ({
  enableColumnGrouping,
  finalColumnStructure,
  enableSorting,
  enableColumnFilter,
  getColumnFilterElement,
  defaultColumns,
  groupConfig,
  footerColumnGroup,
  effectiveTotalSettings,
  footerTemplate
}) => {

  // Generate column groups from configuration - EXACT CODE FROM PRIMEDATATABLE.JS
  const generateColumnGroups = useCallback(() => {
    if (!enableColumnGrouping || !finalColumnStructure.hasGroups) {
      return null;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create header rows for grouped columns
    const headerRows = [];

    // First row: Main group headers + ungrouped column headers
    const firstRowColumns = [];
    
    // Add ungrouped columns to first row
    ungroupedColumns.forEach(col => {
      firstRowColumns.push(
        <Column
          key={`ungrouped-${col.key}`}
          header={col.title}
          field={col.key}
          rowSpan={2} // Span both header rows since ungrouped
          sortable={(col.sortable !== false) && enableSorting}
          filter={(col.filterable !== false) && enableColumnFilter}
          filterElement={(col.filterable !== false) && enableColumnFilter ? (options) => getColumnFilterElement(
            col,
            options.value,
            options.filterCallback
          ) : undefined}
          filterPlaceholder={`Filter ${col.title}...`}
        />
      );
    });

    // Add group headers to first row
    groups.forEach(group => {
      firstRowColumns.push(
        <Column
          key={`group-${group.header}`}
          header={group.header}
          colSpan={group.columns.length}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            ...groupConfig.headerGroupStyle
          }}
        />
      );
    });

    headerRows.push(
      <Row key="group-headers">
        {firstRowColumns}
      </Row>
    );

    // Second row: Sub-column headers for grouped columns
    const secondRowColumns = [];
    
    groups.forEach(group => {
      group.columns.forEach(col => {
        // Find the original column definition to get sortable property
        const originalColumn = defaultColumns.find(originalCol => 
          originalCol.key === (col.originalKey || col.key)
        );
        
        secondRowColumns.push(
          <Column
            key={`sub-${col.originalKey || col.key}`}
            header={col.subHeader || col.title}
            field={col.originalKey || col.key}
            sortable={(originalColumn?.sortable !== false) && enableSorting}
            filter={(originalColumn?.filterable !== false) && enableColumnFilter}
            filterElement={(originalColumn?.filterable !== false) && enableColumnFilter ? (options) => getColumnFilterElement(
              originalColumn,
              options.value,
              options.filterCallback
            ) : undefined}
            filterPlaceholder={`Filter ${col.subHeader || col.title}...`}
            style={{
              textAlign: 'center',
              fontSize: '0.9em',
              backgroundColor: 'var(--surface-50)',
              ...groupConfig.groupStyle
            }}
          />
        );
      });
    });

    headerRows.push(
      <Row key="sub-headers">
        {secondRowColumns}
      </Row>
    );

    return (
      <ColumnGroup>
        {headerRows}
      </ColumnGroup>
    );
  }, [enableColumnGrouping, finalColumnStructure, groupConfig]);

  // Generate footer groups from configuration - EXACT CODE FROM PRIMEDATATABLE.JS
  const generateFooterGroups = useCallback(() => {
    if (!enableColumnGrouping || !groupConfig.enableFooterGroups || !finalColumnStructure.hasGroups) {
      return null;
    }

    // If custom footer group is provided, use it
    if (footerColumnGroup) {
      return footerColumnGroup;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create footer row
    const footerColumns = [];
    
    // Add ungrouped columns to footer
    ungroupedColumns.forEach(col => {
      footerColumns.push(
        <Column
          key={`footer-ungrouped-${col.key}`}
          footer={effectiveTotalSettings.showFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
          field={col.key}
        />
      );
    });

    // Add grouped columns to footer
    groups.forEach(group => {
      group.columns.forEach(col => {
        footerColumns.push(
          <Column
            key={`footer-grouped-${col.originalKey || col.key}`}
            footer={effectiveTotalSettings.showFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
            field={col.originalKey || col.key}
          />
        );
      });
    });

    return (
      <ColumnGroup>
        <Row>
          {footerColumns}
        </Row>
      </ColumnGroup>
    );
  }, [enableColumnGrouping, footerColumnGroup, finalColumnStructure, groupConfig.enableFooterGroups, effectiveTotalSettings.showFooterTotals, footerTemplate]);

  // Helper function to create column groups easily - EXACT CODE FROM PRIMEDATATABLE.JS
  const createColumnGroup = useCallback((groups) => {
    return (
      <ColumnGroup>
        {groups.map((group, groupIndex) => (
          <Row key={groupIndex}>
            {group.columns.map((col, colIndex) => (
              <Column
                key={colIndex}
                header={col.header}
                field={col.field}
                sortable={col.sortable}
                colSpan={col.colSpan}
                rowSpan={col.rowSpan}

                footer={col.footer}
                body={col.body}
                bodyTemplate={col.bodyTemplate}
              />
            ))}
          </Row>
        ))}
      </ColumnGroup>
    );
  }, []);

  return {
    generateColumnGroups,
    generateFooterGroups,
    createColumnGroup
  };
}; 