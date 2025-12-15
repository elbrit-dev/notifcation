import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import useRowExpansion from '../hooks/useRowExpansion';

/**
 * RowExpansionExample - Demonstrates row expansion functionality
 * 
 * This example shows how to use the useRowExpansion hook to create
 * expandable rows with nested data tables.
 */
export default function RowExpansionExample() {
  const toast = useRef(null);
  
  // Sample data with nested orders
  const [products] = useState([
    {
      id: 1,
      name: 'Bamboo Watch',
      category: 'Accessories',
      price: 65,
      rating: 5,
      inventoryStatus: 'INSTOCK',
      image: 'bamboo-watch.jpg',
      orders: [
        { id: 1001, customer: 'John Doe', date: '2024-01-15', amount: 65, status: 'DELIVERED' },
        { id: 1002, customer: 'Jane Smith', date: '2024-01-20', amount: 65, status: 'PENDING' }
      ]
    },
    {
      id: 2,
      name: 'Black Watch',
      category: 'Accessories',
      price: 72,
      rating: 4,
      inventoryStatus: 'LOWSTOCK',
      image: 'black-watch.jpg',
      orders: [
        { id: 2001, customer: 'Bob Johnson', date: '2024-01-18', amount: 72, status: 'DELIVERED' }
      ]
    },
    {
      id: 3,
      name: 'Blue Band',
      category: 'Fitness',
      price: 79,
      rating: 3,
      inventoryStatus: 'OUTOFSTOCK',
      image: 'blue-band.jpg',
      orders: []
    },
    {
      id: 4,
      name: 'Blue T-Shirt',
      category: 'Clothing',
      price: 29,
      rating: 5,
      inventoryStatus: 'INSTOCK',
      image: 'blue-t-shirt.jpg',
      orders: [
        { id: 4001, customer: 'Alice Brown', date: '2024-01-22', amount: 29, status: 'DELIVERED' },
        { id: 4002, customer: 'Charlie Wilson', date: '2024-01-25', amount: 29, status: 'PROCESSING' },
        { id: 4003, customer: 'Diana Davis', date: '2024-01-28', amount: 29, status: 'PENDING' }
      ]
    }
  ]);

  // Row expansion configuration using the hook
  const rowExpansion = useRowExpansion({
    enabled: true,
    data: products,
    dataKey: 'id',
    
    // Custom expansion template
    rowExpansionTemplate: (data) => (
      <div className="p-3">
        <h5>Orders for {data.name}</h5>
        {data.orders.length > 0 ? (
          <DataTable value={data.orders} showGridlines stripedRows>
            <Column field="id" header="Order ID" sortable />
            <Column field="customer" header="Customer" sortable />
            <Column field="date" header="Date" sortable />
            <Column 
              field="amount" 
              header="Amount" 
              sortable 
              body={(rowData) => formatCurrency(rowData.amount)}
            />
            <Column 
              field="status" 
              header="Status" 
              sortable 
              body={(rowData) => (
                <Tag 
                  value={rowData.status.toLowerCase()} 
                  severity={getOrderSeverity(rowData.status)} 
                />
              )}
            />
            <Column 
              header="Actions" 
              body={() => <Button icon="pi pi-search" size="small" />}
              style={{ width: '4rem' }}
            />
          </DataTable>
        ) : (
          <p className="text-muted">No orders for this product.</p>
        )}
      </div>
    ),
    
    // Custom expansion validation
    allowExpansion: (rowData) => rowData.orders.length > 0,
    
    // UI customization
    expansionColumnWidth: '4rem',
    showExpandAllButtons: true,
    expandAllLabel: "Expand All Products",
    collapseAllLabel: "Collapse All Products",
    
    // Toast reference for notifications
    toastRef: toast,
    
    // Nested data configuration
    nestedDataConfig: {
      enableNestedSorting: true,
      enableNestedFiltering: true,
      enableNestedPagination: false,
      nestedPageSize: 10
    }
  });

  // Utility functions
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    });
  };

  const getProductSeverity = (product) => {
    switch (product.inventoryStatus) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warning';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return null;
    }
  };

  const getOrderSeverity = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'PROCESSING':
        return 'info';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return null;
    }
  };

  // Custom body templates
  const imageBodyTemplate = (rowData) => {
    return (
      <img 
        src={`https://primefaces.org/cdn/primereact/images/product/${rowData.image}`} 
        alt={rowData.image} 
        width="64px" 
        className="shadow-4" 
        style={{ objectFit: 'cover' }}
      />
    );
  };

  const priceBodyTemplate = (rowData) => {
    return formatCurrency(rowData.price);
  };

  const ratingBodyTemplate = (rowData) => {
    return <Rating value={rowData.rating} readOnly cancel={false} />;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.inventoryStatus} 
        severity={getProductSeverity(rowData)} 
      />
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      
      {/* Row Expansion Header */}
      {rowExpansion.expansionHeader}
      
      {/* DataTable with Row Expansion */}
      <DataTable 
        value={products} 
        expandedRows={rowExpansion.expandedRows}
        onRowToggle={rowExpansion.onRowToggle}
        onRowExpand={rowExpansion.onRowExpand}
        onRowCollapse={rowExpansion.onRowCollapse}
        rowExpansionTemplate={rowExpansion.rowExpansionTemplate}
        dataKey={rowExpansion.dataKey}
        tableStyle={{ minWidth: '60rem' }}
        showGridlines
        stripedRows
      >
        {/* Expansion Column */}
        {rowExpansion.expansionColumn && (
          <Column 
            expander={rowExpansion.expansionColumn.expander}
            style={rowExpansion.expansionColumn.style}
            header={rowExpansion.expansionColumn.header}
            body={rowExpansion.expansionColumn.body}
            frozen={rowExpansion.expansionColumn.frozen}
          />
        )}
        
        {/* Data Columns */}
        <Column field="name" header="Name" sortable />
        <Column header="Image" body={imageBodyTemplate} />
        <Column field="price" header="Price" sortable body={priceBodyTemplate} />
        <Column field="category" header="Category" sortable />
        <Column field="rating" header="Reviews" sortable body={ratingBodyTemplate} />
        <Column field="inventoryStatus" header="Status" sortable body={statusBodyTemplate} />
      </DataTable>
      
      {/* Debug Information */}
      <div className="mt-4 p-3 surface-50 border-round">
        <h6>Row Expansion Debug Info:</h6>
        <ul className="m-0 p-0 list-none">
          <li>Enabled: {rowExpansion.isEnabled ? 'Yes' : 'No'}</li>
          <li>Has Expansion Column: {rowExpansion.hasExpansionColumn ? 'Yes' : 'No'}</li>
          <li>Has Expansion Header: {rowExpansion.hasExpansionHeader ? 'Yes' : 'No'}</li>
          <li>Expanded Rows Count: {Object.keys(rowExpansion.expandedRows).length}</li>
          <li>Data Key: {rowExpansion.dataKey}</li>
        </ul>
      </div>
    </div>
  );
}
