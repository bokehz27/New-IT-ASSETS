// src/components/RelationalMasterDataManagement.js

import React, { useState, useEffect, useRef } from 'react';
import axios from '../api';
import { toast } from 'react-toastify';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';

// ✨ 1. Import SearchableDropdown
import SearchableDropdown from './SearchableDropdown';

const RelationalMasterDataManagement = ({ apiEndpoint, title, dataColumns, relations = [] }) => {
  const [data, setData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [relationalData, setRelationalData] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef(null);

  useEffect(() => {
    fetchData();
    fetchRelationalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);
  
  useEffect(() => {
    if (data.length > 0 && Object.keys(relationalData).length > 0 && relations.length > 0) {
      const processed = data.map(item => {
        const newItem = { ...item };
        relations.forEach(relation => {
          const relatedItems = relationalData[relation.foreignKey] || [];
          const foundItem = relatedItems.find(rel => rel.id === item[relation.foreignKey]);
          newItem[`${relation.foreignKey}_display`] = foundItem ? foundItem[relation.displayField] : 'N/A';
        });
        return newItem;
      });
      setProcessedData(processed);
    } else if (data.length > 0) {
      setProcessedData(data);
    }
  }, [data, relationalData, relations]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/${apiEndpoint}`);
      setData(response.data);
    } catch (error) {
      toast.error(`Failed to fetch ${title}.`);
    }
  };

  const fetchRelationalData = async () => {
    if (relations.length === 0) return;
    try {
      const promises = relations.map(relation => axios.get(`/${relation.apiEndpoint}`));
      const responses = await Promise.all(promises);
      const newRelationalData = {};
      relations.forEach((relation, index) => {
        newRelationalData[relation.foreignKey] = responses[index].data;
      });
      setRelationalData(newRelationalData);
    } catch (error) {
      toast.error('Failed to fetch related data for dropdowns.');
    }
  };

  // ✨ 2. ปรับ handleInputChange ให้รองรับทั้ง event และ value โดยตรง
  const handleInputChange = (valueOrEvent, name) => {
    const val = (valueOrEvent && valueOrEvent.target) ? valueOrEvent.target.value : valueOrEvent;
    setFormData({ ...formData, [name]: val || '' });
  };


  const handleSubmit = async () => {
    try {
      if (currentItem) {
        await axios.put(`/${apiEndpoint}/${currentItem.id}`, formData);
        toast.success(`${title} updated successfully!`);
      } else {
        await axios.post(`/${apiEndpoint}`, formData);
        toast.success(`${title} added successfully!`);
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(`Failed to save ${title}.`);
    }
  };
  
  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        try {
            await axios.delete(`/${apiEndpoint}/${item.id}`);
            toast.success(`${title} deleted successfully!`);
            fetchData();
        } catch (error) {
            toast.error(`Failed to delete ${title}.`);
        }
    }
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    // ทำให้แน่ใจว่า formData มี key ครบทุกตัวตั้งแต่แรก
    const initialFormData = dataColumns.reduce((acc, col) => {
        acc[col.key] = item && item[col.key] ? item[col.key] : '';
        return acc;
    }, {});
    setFormData(item ? { ...initialFormData, ...item } : initialFormData);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
  };
  
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const leftToolbarTemplate = () => (
    <Button label="Add New" icon="pi pi-plus" className="p-button-sm p-button-success" onClick={() => openModal()} />
  );

  const rightToolbarTemplate = () => (
      <div className="flex items-center gap-2">
        <InputText 
            type="search" 
            value={globalFilter} 
            onChange={(e) => setGlobalFilter(e.target.value)} 
            placeholder="Global Search" 
            className="p-inputtext-sm"
        />
        <Button label="Export" icon="pi pi-upload" className="p-button-sm p-button-help" onClick={exportCSV} />
      </div>
  );

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2 justify-center">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success" tooltip="Edit" tooltipOptions={{ position: 'top' }} onClick={() => openModal(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" tooltip="Delete" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
    </div>
  );

  const modalFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" onClick={closeModal} className="p-button-text" />
      <Button label="Save" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{`Manage ${title}`}</h1>
      <Toolbar className="mb-4 p-2" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
        
      <DataTable 
          ref={dt}
          value={processedData}
          paginator rows={10} 
          rowsPerPageOptions={[10, 20, 50, 100]}
          dataKey="id"
          size="small"
          stripedRows 
          showGridlines
          globalFilter={globalFilter}
          globalFilterFields={dataColumns.map(col => relations.some(r => r.foreignKey === col.key) ? `${col.key}_display` : col.key)}
          emptyMessage={`No ${title} found.`}
      >
          {dataColumns.map(col => {
            const isRelation = relations.some(r => r.foreignKey === col.key);
            const fieldName = isRelation ? `${col.key}_display` : col.key;

            return (
              <Column 
                key={col.key} 
                field={fieldName}
                header={col.name} 
                sortable 
                style={{ minWidth: '12rem' }} 
              />
            );
          })}
          <Column body={actionBodyTemplate} style={{ width: '8rem', textAlign: 'center' }} header="Actions"/>
      </DataTable>

      <Dialog 
        header={currentItem ? `Edit ${title}` : `Add New ${title}`} 
        visible={isModalOpen} 
        style={{ width: '450px' }} 
        footer={modalFooter} 
        onHide={closeModal}
      >
        {/* ✨ 3. ปรับ Logic การแสดงผลใน Modal ทั้งหมด */}
        {dataColumns.map(col => {
            const relation = relations.find(r => r.foreignKey === col.key);
            
            // Check if it's a relational dropdown
            if (relation) {
                const options = (relationalData[col.key] || []).map(option => ({
                    value: option.id,
                    label: option[relation.displayField]
                }));
                return (
                    <div className="field my-4" key={col.key}>
                        <label htmlFor={col.key} className="block font-bold mb-2">{col.name}</label>
                        <SearchableDropdown
                            idPrefix={`sdd-rel-${col.key}`}
                            options={options}
                            value={formData[col.key] || ''}
                            onChange={(value) => handleInputChange(value, col.key)}
                            placeholder={`Select ${col.name}`}
                        />
                    </div>
                );
            }

            // Check if it's the special 'status' dropdown
            if (col.key === 'status') {
                const statusOptions = [
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                ];
                return (
                    <div className="field my-4" key={col.key}>
                        <label htmlFor={col.key} className="block font-bold mb-2">{col.name}</label>
                        <SearchableDropdown
                             idPrefix="sdd-status"
                             options={statusOptions}
                             value={formData.status || ''}
                             onChange={(value) => handleInputChange(value, 'status')}
                             placeholder="Select Status"
                        />
                    </div>
                );
            }

            // Otherwise, render a standard InputText
            return (
                <div className="field my-4" key={col.key}>
                    <label htmlFor={col.key} className="block font-bold mb-2">{col.name}</label>
                    <InputText 
                        id={col.key} 
                        value={formData[col.key] || ''} 
                        onChange={(e) => handleInputChange(e, col.key)} 
                        className="w-full p-inputtext-sm"
                        required 
                    />
                </div>
            );
        })}
      </Dialog>
    </div>
  );
};

export default RelationalMasterDataManagement;