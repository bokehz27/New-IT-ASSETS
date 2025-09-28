import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageAntivirusPage = () => (
  <MasterDataManagement
    apiEndpoint="antivirus_programs"
    title="Antivirus Program"
    dataColumns={[{ key: 'name', name: 'Program Name' }]}
  />
);
export default ManageAntivirusPage;