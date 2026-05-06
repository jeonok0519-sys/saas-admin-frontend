import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { tenantApi } from '@/services/tenant';
import { operatorApi } from '@/services/operator';

interface Statistics {
  totalTenants: number;
  activeTenants: number;
  totalOperators: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Statistics>({
    totalTenants: 0,
    activeTenants: 0,
    totalOperators: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [tenantRes, operatorRes] = await Promise.all([
        tenantApi.getStatistics(),
        operatorApi.list({ current: 1, size: 1 }),
      ]);

      if (tenantRes.code === 200) {
        setStats((prev) => ({
          ...prev,
          totalTenants: tenantRes.data.total,
          activeTenants: tenantRes.data.active,
        }));
      }
      if (operatorRes.code === 200) {
        setStats((prev) => ({
          ...prev,
          totalOperators: operatorRes.data.total,
        }));
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getDateStr = () => {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}，{user?.realName || user?.username}
        </h1>
        <p className="text-gray-500 mt-1">{getDateStr()}，祝您工作愉快</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">租户总数</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{loading ? '-' : stats.totalTenants}</span>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>12.5%</span>
              <span className="text-gray-400">较上月</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">活跃租户</span>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{loading ? '-' : stats.activeTenants}</span>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>8.3%</span>
              <span className="text-gray-400">较上周</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">操作员总数</span>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900">{loading ? '-' : stats.totalOperators}</span>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>5.2%</span>
              <span className="text-gray-400">较上月</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">快捷操作</h2>
        </div>
        <div className="flex gap-4">
          <Link
            to="/tenants"
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>管理租户</span>
          </Link>
          {user?.role === 'SUPER_ADMIN' && (
            <Link
              to="/operators"
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>管理操作员</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
