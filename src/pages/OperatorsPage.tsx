import { useEffect, useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
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
import { operatorApi } from '@/services/operator';
import type { Operator } from '@/types';

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    realName: string;
    password?: string;
    role: 'SUPER_ADMIN' | 'OPERATOR';
    status: number;
  }>({
    username: '',
    realName: '',
    password: '',
    role: 'OPERATOR',
    status: 1,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null);

  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [operatorToReset, setOperatorToReset] = useState<Operator | null>(null);

  useEffect(() => {
    loadOperators();
  }, [current, keyword]);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const res = await operatorApi.list({ current, size: 10, keyword: keyword || undefined });
      if (res.code === 200) {
        setOperators(res.data.records);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('Failed to load operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrent(1);
    loadOperators();
  };

  const openAddDialog = () => {
    setEditingOperator(null);
    setFormData({ username: '', realName: '', password: '', role: 'OPERATOR', status: 1 });
    setDialogOpen(true);
  };

  const openEditDialog = (operator: Operator) => {
    setEditingOperator(operator);
    setFormData({
      username: operator.username,
      realName: operator.realName,
      password: '',
      role: operator.role as 'SUPER_ADMIN' | 'OPERATOR',
      status: operator.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      let res;
      if (editingOperator) {
        const updateData: { username: string; realName: string; role: 'SUPER_ADMIN' | 'OPERATOR'; status: number; password?: string } = {
          username: formData.username,
          realName: formData.realName,
          role: formData.role,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        res = await operatorApi.update(editingOperator.id!, updateData);
      } else {
        if (!formData.password) {
          alert('密码不能为空');
          return;
        }
        res = await operatorApi.create({
          username: formData.username,
          realName: formData.realName,
          password: formData.password,
          role: formData.role,
          status: formData.status,
        });
      }
      if (res.code === 200) {
        setDialogOpen(false);
        loadOperators();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!operatorToDelete) return;
    try {
      const res = await operatorApi.delete(operatorToDelete.id!);
      if (res.code === 200) {
        setDeleteDialogOpen(false);
        setOperatorToDelete(null);
        loadOperators();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleResetPassword = async () => {
    if (!operatorToReset) return;
    try {
      const res = await operatorApi.resetPassword(operatorToReset.id!);
      if (res.code === 200) {
        setResetPasswordDialogOpen(false);
        setOperatorToReset(null);
        alert('密码已重置为 123456');
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
        <h1 className="text-2xl font-bold text-gray-900">操作员管理</h1>
        <p className="text-gray-500 mt-1">管理系统中的所有操作员账号</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索账号或姓名..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>搜索</Button>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            新增操作员
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  加载中...
                </TableCell>
              </TableRow>
            ) : operators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {operator.username}
                    </div>
                  </TableCell>
                  <TableCell>{operator.realName}</TableCell>
                  <TableCell>
                    <Badge variant={operator.role === 'SUPER_ADMIN' ? 'default' : 'outline'}>
                      {operator.role === 'SUPER_ADMIN' ? '超级管理员' : '普通运营'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={operator.status === 1 ? 'success' : 'danger'}>
                      {operator.status === 1 ? '启用' : '禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {operator.createTime ? new Date(operator.createTime).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(operator)}>
                        编辑
                      </Button>
                      {operator.role !== 'SUPER_ADMIN' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOperatorToReset(operator);
                              setResetPasswordDialogOpen(true);
                            }}
                          >
                            重置密码
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setOperatorToDelete(operator);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
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
            <DialogTitle>{editingOperator ? '编辑操作员' : '新增操作员'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                账号 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="请输入登录账号"
                disabled={!!editingOperator}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.realName}
                onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                placeholder="请输入操作员姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码 {editingOperator && <span className="text-gray-400">(不修改请留空)</span>}
              </label>
              <Input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingOperator ? '留空则不修改密码' : '请输入登录密码'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.role === 'SUPER_ADMIN'}
                    onChange={() => setFormData({ ...formData, role: 'SUPER_ADMIN' })}
                    disabled={editingOperator?.role === 'SUPER_ADMIN'}
                  />
                  <span>超级管理员</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.role === 'OPERATOR'}
                    onChange={() => setFormData({ ...formData, role: 'OPERATOR' })}
                  />
                  <span>普通运营</span>
                </label>
              </div>
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
            <AlertDialogTitle>确认删除操作员</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除操作员「{operatorToDelete?.realName}」吗？删除后该操作员将无法登录系统，此操作不可恢复。
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

      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置密码</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要重置操作员「{operatorToReset?.realName}」的密码吗？重置后密码将变为默认密码「123456」，请通知用户及时修改密码。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} className="bg-purple-500 hover:bg-purple-600">
              确认重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}