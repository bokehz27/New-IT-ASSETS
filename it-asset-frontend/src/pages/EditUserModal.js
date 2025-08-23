import React, { useState, useEffect } from 'react';

function EditUserModal({ isOpen, onClose, employee, onSave, departmentOptions }) {
  const initialFormState = {
    fullName: '',
    position: '',
    email: '',
    contactNumber: '',
    department: '',
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        // โหมดแก้ไข: ถ้ามีข้อมูล employee ให้เติมข้อมูลลงฟอร์ม
        setFormData({
          fullName: employee.fullName || '',
          position: employee.position || '',
          email: employee.email || '',
          contactNumber: employee.contactNumber || '',
          department: employee.department || '',
        });
      } else {
        // โหมดเพิ่ม: ถ้าไม่มี employee ให้เคลียร์ฟอร์ม
        setFormData(initialFormState);
      }
    }
  }, [isOpen, employee]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg z-50">
        {/* **เปลี่ยนหัวข้อให้เป็น Dynamic** */}
        <h2 className="text-2xl font-bold mb-4">
          {employee ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มข้อมูลผู้ใช้ใหม่'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ-สกุล*</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
              <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full mt-1" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">หน่วยงาน/แผนก</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full mt-1">
                  <option value="">-- เลือกแผนก --</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-Mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">เบอร์ติดต่อ</label>
              <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full mt-1" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;