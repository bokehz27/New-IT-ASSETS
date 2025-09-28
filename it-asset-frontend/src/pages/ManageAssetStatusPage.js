import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageAssetStatusPage = () => (
  <MasterDataManagement
    apiEndpoint="asset_statuses"
    title="Asset Status"
    dataColumns={[{ key: 'name', name: 'Status Name' }]}
  />
);
export default ManageAssetStatusPage;