import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageCpusPage = () => (
  <MasterDataManagement
    apiEndpoint="cpus"
    title="CPU"
    dataColumns={[{ key: 'name', name: 'CPU Name' }]}
  />
);
export default ManageCpusPage;