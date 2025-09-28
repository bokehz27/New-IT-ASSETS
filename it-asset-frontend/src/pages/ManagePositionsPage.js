import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManagePositionsPage = () => (
  <MasterDataManagement
    apiEndpoint="positions"
    title="Position"
    dataColumns={[{ key: 'name', name: 'Position Name' }]}
  />
);
export default ManagePositionsPage;