import { useEffect, useState } from 'react';
import { Search, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { tenantApi } from '@/services/tenant';
import { useAuthStore } from '@/store/auth';
import type { Tenant } from '@/types';

export default function TenantsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantCode: '',
    status: 1,
    remark: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [tenantToToggle, setTenantToToggle] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, [current, keyword]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      console.log('Loading tenants with params:', { current, size: 10, keyword: keyword || undefined });
      const res = await tenantApi.list({ current, size: 10, keyword: keyword || undefined });
      console.log('Tenant API response:', res);
      if (res.code === 200) {
        console.log('Data received:', res.data);
        console.log('Records:', res.data?.records);
        console.log('Total:', res.data?.total);
        setTenants(res.data.records || []);
        setTotal(res.data.total || 0);
      } else {
        console.log('API error:', res.message);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrent(1);
    loadTenants();
  };

  const openAddDialog = () => {
    setEditingTenant(null);
    setFormData({ tenantName: '', tenantCode: '', status: 1, remark: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      tenantName: tenant.tenantName,
      tenantCode: tenant.tenantCode,
      status: tenant.status,
      remark: tenant.remark || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      let res;
      if (editingTenant) {
        res = await tenantApi.update(editingTenant.id!, formData);
      } else {
        res = await tenantApi.create(formData);
      }
      if (res.code === 200) {
        setDialogOpen(false);
        loadTenants();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    try {
      const res = await tenantApi.delete(tenantToDelete.id!);
      if (res.code === 200) {
        setDeleteDialogOpen(false);
        setTenantToDelete(null);
        loadTenants();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleToggleStatus = async () => {
    if (!tenantToToggle) return;
    try {
      const newStatus = tenantToToggle.status === 1 ? 0 : 1;
      const res = await tenantApi.updateStatus(tenantToToggle.id!, newStatus);
      if (res.code === 200) {
        setStatusDialogOpen(false);
        setTenantToToggle(null);
        loadTenants();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">租户管理</h1>
        <p className="text-gray-500 mt-1">管理系统中的所有租户</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索租户名称或代码..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>搜索</Button>
          </div>
          {isSuperAdmin && (
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              新增租户
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>租户名称</TableHead>
              <TableHead>租户代码</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>创建时间</TableHead>
              {isSuperAdmin && <TableHead>操作</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                  加载中...
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {tenant.tenantName}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{tenant.tenantCode}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === 1 ? 'success' : 'danger'}>
                      {tenant.status === 1 ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{tenant.remark || '-'}</TableCell>
                  <TableCell className="text-gray-500">
                    {tenant.createTime ? new Date(tenant.createTime).toLocaleDateString() : '-'}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(tenant)}>
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTenantToToggle(tenant);
                            setStatusDialogOpen(true);
                          }}
                        >
                          {tenant.status === 1 ? '禁用' : '启用'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {total > 0 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrent((p) => Math.max(1, p - 1))}
                    className={current === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={current === page}
                        onClick={() => setCurrent(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrent((p) => Math.min(totalPages, p + 1))}
                    className={current === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTenant ? '编辑租户' : '新增租户'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                租户名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                placeholder="请输入租户名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                租户代码 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.tenantCode}
                onChange={(e) => setFormData({ ...formData, tenantCode: e.target.value })}
                placeholder="请输入租户唯一标识"
                disabled={!!editingTenant}
              />
              {editingTenant && (
                <p className="text-xs text-gray-400 mt-1">租户代码创建后不可修改</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <Input
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="请输入备注信息"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除租户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除租户「{tenantToDelete?.tenantName}」吗？删除后，该租户下的所有数据将被清除，此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认{tenantToToggle?.status === 1 ? '禁用' : '启用'}租户
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{tenantToToggle?.status === 1 ? '禁用' : '启用'}租户「
              {tenantToToggle?.tenantName}」吗？
              {tenantToToggle?.status === 1 && '禁用后，该租户下的所有用户将无法登录系统。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={tenantToToggle?.status === 1 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
