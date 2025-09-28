import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageWindowsVersionsPage = () => (
  <MasterDataManagement
    apiEndpoint="windows_versions"
    title="Windows Version"
    dataColumns={[{ key: 'name', name: 'Version Name' }]}
  />
);
export default ManageWindowsVersionsPage;