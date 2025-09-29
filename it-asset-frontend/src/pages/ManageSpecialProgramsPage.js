import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement'; // สมมติว่าคุณมี Component นี้

const ManageSpecialProgramsPage = () => (
  <MasterDataManagement
    apiEndpoint="special-programs"
    title="Special Program"
    dataColumns={[{ key: 'name', name: 'Program Name' }]}
    formFields={[{ name: 'name', label: 'Program Name', type: 'text' }]}
  />
);
export default ManageSpecialProgramsPage;