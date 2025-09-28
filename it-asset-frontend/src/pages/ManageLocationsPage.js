import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageLocationsPage = () => (
  <MasterDataManagement
    apiEndpoint="locations"
    title="Location"
    dataColumns={[{ key: 'name', name: 'Location Name' }]}
  />
);
export default ManageLocationsPage;