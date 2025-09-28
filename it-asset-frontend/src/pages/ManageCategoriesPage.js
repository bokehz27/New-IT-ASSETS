import React from 'react';
import MasterDataManagement from '../components/MasterDataManagement';

const ManageCategoriesPage = () => (
  <MasterDataManagement
    apiEndpoint="categories"
    title="Category"
    dataColumns={[{ key: 'name', name: 'Category Name' }]}
  />
);
export default ManageCategoriesPage;