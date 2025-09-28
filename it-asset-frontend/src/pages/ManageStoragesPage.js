import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageStoragesPage = () => (
  <MasterDataManagement
    apiEndpoint="storages"
    title="Storage"
    dataColumns={[{ key: 'size', name: 'Storage Size' }]}
  />
);
export default ManageStoragesPage;