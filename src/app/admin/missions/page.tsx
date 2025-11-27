'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/src/utils/api/apiRequest';
import type { MissionModel } from '@/generated/prisma/models';
import { MissionType, RewardType } from '@/generated/prisma/browser';
import { PrimaryButton, TertiaryButton, PrimaryInput, PrimarySelect, PrimaryTextArea } from '@/src/components/ui';

export default function MissionsPage() {
  const [missions, setMissions] = useState<MissionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionModel | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    icon: string;
    type: MissionType;
    targetValue: string;
    rewardType: RewardType;
    rewardValue: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    icon: '🎯',
    type: MissionType.ORDER_COUNT,
    targetValue: '',
    rewardType: RewardType.REFERRAL_PERCENTAGE,
    rewardValue: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const response = await apiRequest.get<MissionModel[]>('/v1/admin/missions');
      setMissions(response.data);
    } catch (error) {
      console.error('Failed to load missions:', error);
      alert('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMission) {
        await apiRequest.put(`/v1/admin/missions/${editingMission.id}`, formData);
        alert('Mission updated successfully');
      } else {
        await apiRequest.post('/v1/admin/missions', formData);
        alert('Mission created successfully');
      }

      setShowModal(false);
      resetForm();
      loadMissions();
    } catch (error: any) {
      alert(error.message || 'Failed to save mission');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      await apiRequest.delete(`/v1/admin/missions/${id}`);
      alert('Mission deleted successfully');
      loadMissions();
    } catch (error) {
      alert('Failed to delete mission');
    }
  };

  const handleEdit = (mission: MissionModel) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      icon: mission.icon,
      type: mission.type,
      targetValue: mission.targetValue.toString(),
      rewardType: mission.rewardType,
      rewardValue: mission.rewardValue.toString(),
      sortOrder: mission.sortOrder,
      isActive: mission.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingMission(null);
    setFormData({
      title: '',
      description: '',
      icon: '🎯',
      type: MissionType.ORDER_COUNT,
      targetValue: '',
      rewardType: RewardType.REFERRAL_PERCENTAGE,
      rewardValue: '',
      sortOrder: 0,
      isActive: true,
    });
  };

  const missionTypeLabels: Record<MissionType, string> = {
    [MissionType.ORDER_COUNT]: 'Order Count',
    [MissionType.ORDER_VALUE]: 'Order Value',
    [MissionType.REFERRAL_COUNT]: 'Referral Count',
    [MissionType.REFERRAL_EARNINGS]: 'Referral Earnings',
  };

  const rewardTypeLabels: Record<RewardType, string> = {
    [RewardType.REFERRAL_PERCENTAGE]: 'Referral %',
    [RewardType.GLOBAL_DISCOUNT]: 'Global Discount',
    [RewardType.BOTH]: 'Both',
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Add Mission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{mission.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{mission.title}</h3>
                  <p className="text-sm text-gray-500">{mission.description}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  mission.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {mission.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold">{missionTypeLabels[mission.type]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="font-semibold">{mission.targetValue.toString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reward Type</p>
                <p className="font-semibold">{rewardTypeLabels[mission.rewardType]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reward Value</p>
                <p className="font-semibold">{mission.rewardValue.toString()}%</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(mission)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(mission.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          No missions found. Create your first mission!
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingMission ? 'Edit Mission' : 'Add Mission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PrimaryInput
                label="Title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <PrimaryTextArea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />

              <PrimaryInput
                label="Icon (Emoji)"
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <PrimarySelect
                  label="Mission Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MissionType })}
                  options={[
                    { value: MissionType.ORDER_COUNT, label: 'Order Count' },
                    { value: MissionType.ORDER_VALUE, label: 'Order Value' },
                    { value: MissionType.REFERRAL_COUNT, label: 'Referral Count' },
                    { value: MissionType.REFERRAL_EARNINGS, label: 'Referral Earnings' }
                  ]}
                  required
                />

                <PrimaryInput
                  label="Target Value"
                  type="number"
                  step="0.01"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PrimarySelect
                  label="Reward Type"
                  value={formData.rewardType}
                  onChange={(e) => setFormData({ ...formData, rewardType: e.target.value as RewardType })}
                  options={[
                    { value: RewardType.REFERRAL_PERCENTAGE, label: 'Referral Percentage' },
                    { value: RewardType.GLOBAL_DISCOUNT, label: 'Global Discount' },
                    { value: RewardType.BOTH, label: 'Both' }
                  ]}
                  required
                />

                <PrimaryInput
                  label="Reward Value (%)"
                  type="number"
                  step="0.01"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                  required
                />
              </div>

              <PrimaryInput
                label="Sort Order"
                type="number"
                value={formData.sortOrder.toString()}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-900">Active</label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <TertiaryButton
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </TertiaryButton>
                <PrimaryButton type="submit">
                  {editingMission ? 'Update' : 'Create'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
