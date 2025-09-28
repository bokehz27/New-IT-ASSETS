import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageDepartmentsPage = () => (
  <MasterDataManagement
    apiEndpoint="departments"
    title="Department"
    dataColumns={[{ key: 'name', name: 'Department Name' }]}
  />
);
export default ManageDepartmentsPage;