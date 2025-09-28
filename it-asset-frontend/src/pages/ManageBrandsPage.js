import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageBrandsPage = () => (
  <MasterDataManagement
    apiEndpoint="brands"
    title="Brand"
    dataColumns={[{ key: 'name', name: 'Brand Name' }]}
  />
);
export default ManageBrandsPage;