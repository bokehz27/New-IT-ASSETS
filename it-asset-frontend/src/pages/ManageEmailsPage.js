import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageEmailsPage = () => (
  <MasterDataManagement
    apiEndpoint="emails"
    title="Email"
    dataColumns={[{ key: 'email', name: 'Email Address' }]}
  />
);
export default ManageEmailsPage;