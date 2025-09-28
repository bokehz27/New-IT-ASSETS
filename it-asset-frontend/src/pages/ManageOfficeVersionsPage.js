import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageOfficeVersionsPage = () => (
  <MasterDataManagement
    apiEndpoint="office_versions"
    title="Office Version"
    dataColumns={[{ key: 'name', name: 'Version Name' }]}
  />
);
export default ManageOfficeVersionsPage;