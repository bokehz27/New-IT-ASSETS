import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageRamsPage = () => (
  <MasterDataManagement
    apiEndpoint="rams"
    title="RAM"
    dataColumns={[{ key: 'size', name: 'RAM Size' }]}
  />
);
export default ManageRamsPage;