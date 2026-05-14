import React, { useState } from 'react';
import useAuthStore from '../../stores/authStore.js';
import { authService } from '../../services/authService.js';
import { toast } from 'react-hot-toast';

const AddressManager = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    province: '',
    ward: '',
    street: '',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      province: '',
      ward: '',
      street: '',
      isDefault: false
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (addr) => {
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      province: addr.province || '',
      ward: addr.ward || '',
      street: addr.street || '',
      isDefault: addr.isDefault || false
    });
    setEditingId(addr._id);
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await authService.updateAddress(editingId, formData);
        toast.success('Cập nhật địa chỉ thành công!');
      } else {
        await authService.addAddress(formData);
        toast.success('Thêm địa chỉ thành công!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await authService.deleteAddress(id);
        toast.success('Đã xóa địa chỉ');
      } catch (err) {
        toast.error(err.message || 'Có lỗi xảy ra');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await authService.setDefaultAddress(id);
      toast.success('Đã đặt làm địa chỉ mặc định');
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const addresses = user?.addresses || [];

  return (
    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-gray-900">Sổ địa chỉ</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="text-primary font-medium hover:underline text-sm"
          >
            + Thêm địa chỉ mới
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="font-semibold mb-4 text-sm">{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Họ và tên</label>
              <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="Nhập họ tên" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Số điện thoại</label>
              <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tỉnh / Thành phố</label>
              <input type="text" required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="Ví dụ: TP. HCM" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Phường / Xã</label>
              <input type="text" required value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="Ví dụ: Phường Bến Nghé" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Địa chỉ cụ thể (Số nhà, đường...)</label>
              <input type="text" required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full text-sm p-2 border rounded" placeholder="Ví dụ: 123 Lê Lợi" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="mr-2" />
            <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-black">Lưu lại</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !isEditing ? (
        <p className="text-gray-500 text-sm text-center py-4 border-2 border-dashed rounded-lg border-gray-200">Chưa có địa chỉ nào được lưu.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className={`p-4 border rounded-lg ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{addr.fullName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{addr.street}</p>
                  <p className="text-sm text-gray-600">{addr.ward}, {addr.province}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:underline">Sửa</button>
                    {!addr.isDefault && (
                      <button onClick={() => handleDelete(addr._id)} className="text-red-600 hover:underline">Xóa</button>
                    )}
                  </div>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="text-xs border border-primary text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors mt-2">
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
