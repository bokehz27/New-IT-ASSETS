import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageAssetSpecialProgramsPage = () => (
  <MasterDataManagement
    apiEndpoint="asset_special_programs"
    title="Asset Special Program"
    dataColumns={[
      { key: 'program_name', name: 'Program Name' },
      { key: 'license_key', name: 'License Key' },
      { key: 'asset_id', name: 'Asset ID' }
    ]}
  />
);
export default ManageAssetSpecialProgramsPage;