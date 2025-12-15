import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { Toast } from 'primereact/toast';
import { Chip } from 'primereact/chip';
import { Panel } from 'primereact/panel';
import { parseFormula, validateFormula, executeCalculatedField } from '../utils/calculatedFieldsUtils.js';

const CalculatedFieldsManager = ({ 
  calculatedFields = [], 
  onCalculatedFieldsChange,
  availableFields = [],
  sampleData = []
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [formula, setFormula] = useState('');
  const [description, setDescription] = useState('');
  const [formatType, setFormatType] = useState('number');
  const [validationResult, setValidationResult] = useState(null);
  const [previewValue, setPreviewValue] = useState(null);
  const [availableFieldsForFormula, setAvailableFieldsForFormula] = useState([]);

  // Format type options
  const formatOptions = [
    { label: 'Number', value: 'number' },
    { label: 'Percentage', value: 'percentage' },
    { label: 'Currency', value: 'currency' },
    { label: 'Decimal (2)', value: 'decimal2' },
    { label: 'Decimal (4)', value: 'decimal4' }
  ];

  // Mathematical functions available
  const mathFunctions = [
    { label: 'ABS()', value: 'ABS', description: 'Absolute value' },
    { label: 'ROUND()', value: 'ROUND', description: 'Round to nearest integer' },
    { label: 'FLOOR()', value: 'FLOOR', description: 'Round down' },
    { label: 'CEIL()', value: 'CEIL', description: 'Round up' },
    { label: 'MAX()', value: 'MAX', description: 'Maximum of values' },
    { label: 'MIN()', value: 'MIN', description: 'Minimum of values' },
    { label: 'AVG()', value: 'AVG', description: 'Average of values' },
    { label: 'IF()', value: 'IF', description: 'Conditional logic: IF(condition, trueValue, falseValue)' }
  ];

  // Update available fields for formula when availableFields changes
  useEffect(() => {
    const fieldsForFormula = availableFields.map(field => ({
      label: field.title || field.name || field.key,
      value: `[${field.key}]`,
      key: field.key,
      type: field.type || 'number',
      description: field.description || `${field.aggregation || 'sum'} of ${field.field || field.key}`
    }));
    setAvailableFieldsForFormula(fieldsForFormula);
  }, [availableFields]);

  // Real-time formula validation and preview
  useEffect(() => {
    if (formula.trim()) {
      const validation = validateFormula(formula, availableFields);
      setValidationResult(validation);
      
      // Generate preview if validation passes and we have sample data
      if (validation.isValid && sampleData.length > 0) {
        try {
          const preview = executeCalculatedField(formula, sampleData[0], availableFields);
          setPreviewValue(preview);
        } catch (error) {
          setPreviewValue('Error: ' + error.message);
        }
      } else {
        setPreviewValue(null);
      }
    } else {
      setValidationResult(null);
      setPreviewValue(null);
    }
  }, [formula, availableFields, sampleData]);

  const openEditor = useCallback((field = null) => {
    if (field) {
      setEditingField(field);
      setFieldName(field.name);
      setFormula(field.formula);
      setDescription(field.description || '');
      setFormatType(field.format || 'number');
    } else {
      setEditingField(null);
      setFieldName('');
      setFormula('');
      setDescription('');
      setFormatType('number');
    }
    setShowEditor(true);
  }, []);

  const closeEditor = useCallback(() => {
    setShowEditor(false);
    setEditingField(null);
    setValidationResult(null);
    setPreviewValue(null);
  }, []);

  const saveCalculatedField = useCallback(() => {
    if (!fieldName.trim()) {
      alert('Please enter a field name');
      return;
    }

    if (!formula.trim()) {
      alert('Please enter a formula');
      return;
    }

    const validation = validateFormula(formula, availableFields);
    if (!validation.isValid) {
      alert('Formula validation failed: ' + validation.errors.join(', '));
      return;
    }

    const newField = {
      id: editingField?.id || `calc_${Date.now()}`,
      name: fieldName.trim(),
      formula: formula.trim(),
      description: description.trim(),
      format: formatType,
      dependencies: validation.dependencies,
      createdAt: editingField?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedFields;
    if (editingField) {
      updatedFields = calculatedFields.map(f => f.id === editingField.id ? newField : f);
    } else {
      updatedFields = [...calculatedFields, newField];
    }

    onCalculatedFieldsChange(updatedFields);
    closeEditor();
  }, [fieldName, formula, description, formatType, editingField, calculatedFields, availableFields, onCalculatedFieldsChange, closeEditor]);

  const deleteCalculatedField = useCallback((fieldId) => {
    if (confirm('Are you sure you want to delete this calculated field?')) {
      const updatedFields = calculatedFields.filter(f => f.id !== fieldId);
      onCalculatedFieldsChange(updatedFields);
    }
  }, [calculatedFields, onCalculatedFieldsChange]);

  const insertIntoFormula = useCallback((text) => {
    setFormula(prev => prev + text);
  }, []);

  const renderFormulaHelper = () => (
    <div className="formula-helper" style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Available Fields:</strong>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
        {availableFieldsForFormula.map(field => (
          <Chip 
            key={field.key}
            label={field.label}
            onClick={() => insertIntoFormula(field.value)}
            style={{ cursor: 'pointer', fontSize: '0.75rem' }}
            title={field.description}
          />
        ))}
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Functions:</strong>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
        {mathFunctions.map(func => (
          <Chip 
            key={func.value}
            label={func.label}
            onClick={() => insertIntoFormula(func.label)}
            style={{ cursor: 'pointer', fontSize: '0.75rem' }}
            title={func.description}
          />
        ))}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Operators:</strong>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {['+', '-', '*', '/', '(', ')', '>', '<', '>=', '<=', '==', '!='].map(op => (
          <Chip 
            key={op}
            label={op}
            onClick={() => insertIntoFormula(op)}
            style={{ cursor: 'pointer', fontSize: '0.75rem' }}
          />
        ))}
      </div>
    </div>
  );

  const renderValidationStatus = () => {
    if (!validationResult) return null;

    return (
      <div style={{ marginTop: '0.5rem' }}>
        {validationResult.isValid ? (
          <div style={{ color: 'green', fontSize: '0.85rem' }}>
            ✓ Formula is valid
            {previewValue !== null && (
              <div style={{ marginTop: '0.25rem' }}>
                Preview: <strong>{formatValue(previewValue, formatType)}</strong>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'red', fontSize: '0.85rem' }}>
            ✗ {validationResult.errors.join(', ')}
          </div>
        )}
      </div>
    );
  };

  const formatValue = (value, format) => {
    if (value === null || value === undefined || isNaN(value)) return value;
    
    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'decimal2':
        return parseFloat(value).toFixed(2);
      case 'decimal4':
        return parseFloat(value).toFixed(4);
      default:
        return value;
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          icon="pi pi-pencil"
          className="p-button-sm p-button-text"
          onClick={() => openEditor(rowData)}
          tooltip="Edit"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-sm p-button-text p-button-danger"
          onClick={() => deleteCalculatedField(rowData.id)}
          tooltip="Delete"
        />
      </div>
    );
  };

  const formulaBodyTemplate = (rowData) => {
    return (
      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <code style={{ fontSize: '0.8rem' }}>{rowData.formula}</code>
      </div>
    );
  };

  const formatBodyTemplate = (rowData) => {
    return <Tag value={rowData.format || 'number'} />;
  };

  const dependenciesBodyTemplate = (rowData) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {rowData.dependencies?.map(dep => (
          <Tag key={dep} value={dep} severity="info" style={{ fontSize: '0.7rem' }} />
        ))}
      </div>
    );
  };

  return (
    <div className="calculated-fields-manager">
      <Panel header="Calculated Fields" toggleable collapsed={calculatedFields.length === 0}>
        <div style={{ marginBottom: '1rem' }}>
          <Button
            label="Add Calculated Field"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={() => openEditor()}
          />
        </div>

        {calculatedFields.length > 0 && (
          <DataTable 
            value={calculatedFields} 
            size="small"
            stripedRows
            emptyMessage="No calculated fields defined"
          >
            <Column field="name" header="Name" sortable />
            <Column 
              field="formula" 
              header="Formula" 
              body={formulaBodyTemplate}
              style={{ maxWidth: '250px' }}
            />
            <Column field="description" header="Description" />
            <Column 
              field="format" 
              header="Format" 
              body={formatBodyTemplate}
              style={{ width: '100px' }}
            />
            <Column 
              field="dependencies" 
              header="Dependencies" 
              body={dependenciesBodyTemplate}
              style={{ width: '150px' }}
            />
            <Column 
              body={actionBodyTemplate} 
              header="Actions"
              style={{ width: '100px' }}
            />
          </DataTable>
        )}
      </Panel>

      <Dialog
        header={editingField ? 'Edit Calculated Field' : 'Add Calculated Field'}
        visible={showEditor}
        style={{ width: '800px', maxWidth: '90vw' }}
        onHide={closeEditor}
        maximizable
        modal
      >
        <div className="calculated-field-editor">
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="fieldName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Field Name *
            </label>
            <InputText
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., ROI, Profit Margin, Growth Rate"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description
            </label>
            <InputText
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this field calculates"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="formatType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Format
            </label>
            <Dropdown
              id="formatType"
              value={formatType}
              options={formatOptions}
              onChange={(e) => setFormatType(e.value)}
              style={{ width: '200px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="formula" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Formula *
            </label>
            <InputTextarea
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., ([Sales_sum] - [Cost_sum]) / [Cost_sum] * 100"
              rows={3}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
            {renderValidationStatus()}
          </div>

          {renderFormulaHelper()}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
              label="Cancel"
              className="p-button-secondary"
              onClick={closeEditor}
            />
            <Button
              label={editingField ? 'Update' : 'Create'}
              onClick={saveCalculatedField}
              disabled={!validationResult?.isValid}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CalculatedFieldsManager;