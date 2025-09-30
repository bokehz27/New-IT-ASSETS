// src/components/MasterDataManagement.js

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

const MasterDataManagement = ({ apiEndpoint, title, dataColumns }) => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/${apiEndpoint}`);
      setData(response.data);
    } catch (error) {
      toast.error(`Failed to fetch ${title}.`);
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

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-center">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success" tooltip="Edit" tooltipOptions={{ position: 'top' }} onClick={() => openModal(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" tooltip="Delete" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
      </div>
    );
  };
  
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Button label="Add New" icon="pi pi-plus" className="p-button-sm p-button-success" onClick={() => openModal()} />
      </div>
    );
  };
  
  const rightToolbarTemplate = () => {
    return (
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
    )
};

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
            value={data} 
            paginator rows={10} 
            rowsPerPageOptions={[10, 20, 50, 100]}
            dataKey="id"
            size="small"
            stripedRows 
            showGridlines
            globalFilter={globalFilter}
            globalFilterFields={dataColumns.map(col => col.key)}
            emptyMessage={`No ${title} found.`}
        >
            {dataColumns.map(col => (
              <Column 
                key={col.key} 
                field={col.key} 
                header={col.name} 
                sortable 
                style={{ minWidth: '12rem' }} 
              />
            ))}
            <Column body={actionBodyTemplate} style={{ width: '8rem', textAlign: 'center' }} header="Actions" />
        </DataTable>

      <Dialog 
        header={currentItem ? `Edit ${title}` : `Add New ${title}`} 
        visible={isModalOpen} 
        style={{ width: '450px' }} 
        footer={modalFooter} 
        onHide={closeModal}
      >
        {/* ✨ 3. ปรับ Logic การแสดงผลใน Modal */}
        {dataColumns.map(col => (
            <div className="field my-4" key={col.key}>
                <label htmlFor={col.key} className="block font-bold mb-2">{col.name}</label>
                {col.type === 'dropdown' ? (
                  <SearchableDropdown
                    idPrefix={`sdd-${col.key}`}
                    options={col.options || []}
                    value={formData[col.key] || ''}
                    onChange={(value) => handleInputChange(value, col.key)}
                    placeholder={`Select ${col.name}`}
                  />
                ) : (
                  <InputText 
                      id={col.key} 
                      value={formData[col.key] || ''} 
                      onChange={(e) => handleInputChange(e, col.key)} 
                      className="w-full p-inputtext-sm"
                      required 
                  />
                )}
            </div>
        ))}
      </Dialog>
    </div>
  );
};

export default MasterDataManagement;