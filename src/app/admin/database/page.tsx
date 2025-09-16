'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTables, getTableSchema, getTableData, createTableRow, updateTableRow, deleteTableRow } from '@/services/databaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

interface TableInfo {
  table_name: string;
  row_count: number;
  data_size: string;
  category: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
  autoincrement?: boolean;
}

interface TableSchema {
  table_name: string;
  columns: ColumnInfo[];
  primary_keys: string[];
  foreign_keys: any[];
  indexes: any[];
}

interface TableRow {
  [key: string]: any;
}

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const [tableData, setTableData] = useState<{
    data: TableRow[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [creatingRow, setCreatingRow] = useState(false);
  const [editData, setEditData] = useState<TableRow>({});
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableSchema(selectedTable);
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableSchema = async (tableName: string) => {
    try {
      const schema = await getTableSchema(tableName);
      setTableSchema(schema);
    } catch (error) {
      console.error('Error loading table schema:', error);
    }
  };

  const loadTableData = async (tableName: string, page: number = 1) => {
    try {
      setDataLoading(true);
      const filtersStr = Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined;
      const data = await getTableData(tableName, {
        page,
        page_size: 20,
        filters: filtersStr
      });
      setTableData(data);
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setFilters({});
    setEditingRow(null);
    setCreatingRow(false);
  };

  const handleCreateRow = () => {
    if (!tableSchema) return;
    setCreatingRow(true);
    const newRow: TableRow = {};
    tableSchema.columns.forEach(column => {
      newRow[column.name] = '';
    });
    setEditData(newRow);
  };

  const handleEditRow = (row: TableRow) => {
    const pkColumn = tableSchema?.primary_keys[0];
    if (pkColumn) {
      setEditingRow(row[pkColumn]);
      setEditData({ ...row });
    }
  };

  const handleSaveRow = async () => {
    try {
      if (creatingRow) {
        await createTableRow(selectedTable, editData);
        setCreatingRow(false);
      } else if (editingRow) {
        await updateTableRow(selectedTable, editingRow, editData);
        setEditingRow(null);
      }
      setEditData({});
      loadTableData(selectedTable, tableData?.page || 1);
    } catch (error) {
      console.error('Error saving row:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm('정말로 이 행을 삭제하시겠습니까?')) return;

    try {
      await deleteTableRow(selectedTable, rowId);
      loadTableData(selectedTable, tableData?.page || 1);
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'core': 'bg-blue-100 text-blue-800',
      'content': 'bg-green-100 text-green-800',
      'user': 'bg-purple-100 text-purple-800',
      'data': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">데이터베이스 관리</h1>
        <p className="text-gray-600 mt-2">모든 데이터베이스 테이블을 직접 관리하고 조작할 수 있습니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Tables List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">테이블 목록</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tables.map((table) => (
                <div
                  key={table.table_name}
                  onClick={() => handleTableSelect(table.table_name)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTable === table.table_name
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{table.table_name}</h3>
                    <Badge className={getCategoryColor(table.category)}>
                      {table.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {table.row_count.toLocaleString()} 행 • {table.data_size}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Table Content */}
        <div className="lg:col-span-3">
          {selectedTable && tableSchema ? (
            <div className="space-y-6">
              {/* Table Header */}
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{tableSchema.table_name}</h2>
                    <p className="text-gray-600">{tableData?.total.toLocaleString() || 0}개 행</p>
                  </div>
                  <Button onClick={handleCreateRow}>새 행 추가</Button>
                </div>

                {/* Filters */}
                {tableSchema.columns.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {tableSchema.columns.slice(0, 5).map((column) => (
                        <div key={column.name} className="flex-1 min-w-0">
                          <Input
                            placeholder={`${column.name} 검색`}
                            value={filters[column.name] || ''}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              [column.name]: e.target.value
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => loadTableData(selectedTable, 1)}
                      >
                        검색
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFilters({})}
                      >
                        초기화
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Table Data */}
              {dataLoading ? (
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
                </Card>
              ) : tableData && tableData.data.length > 0 ? (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {tableSchema.columns.map((column) => (
                            <th key={column.name} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column.name}
                              {tableSchema.primary_keys.includes(column.name) && ' 🔑'}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.data.map((row, index) => {
                          const pkColumn = tableSchema.primary_keys[0];
                          const rowId = row[pkColumn];

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              {tableSchema.columns.map((column) => (
                                <td key={column.name} className="px-4 py-3 text-sm text-gray-900">
                                  {editingRow === rowId || creatingRow ? (
                                    column.type.includes('BOOLEAN') ? (
                                      <select
                                        value={editData[column.name] ? 'true' : 'false'}
                                        onChange={(e) => setEditData(prev => ({
                                          ...prev,
                                          [column.name]: e.target.value === 'true'
                                        }))}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                      >
                                        <option value="false">False</option>
                                        <option value="true">True</option>
                                      </select>
                                    ) : (
                                      <Input
                                        value={editData[column.name] || ''}
                                        onChange={(e) => setEditData(prev => ({
                                          ...prev,
                                          [column.name]: e.target.value
                                        }))}
                                        className="w-full"
                                      />
                                    )
                                  ) : (
                                    <div className="truncate max-w-xs">
                                      {typeof row[column.name] === 'boolean'
                                        ? (row[column.name] ? 'True' : 'False')
                                        : String(row[column.name] || '')
                                      }
                                    </div>
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-right text-sm font-medium">
                                {editingRow === rowId || creatingRow ? (
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={handleSaveRow}>
                                      저장
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingRow(null);
                                        setCreatingRow(false);
                                        setEditData({});
                                      }}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditRow(row)}
                                    >
                                      수정
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleDeleteRow(rowId)}
                                    >
                                      삭제
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {tableData.total_pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                      <div className="text-sm text-gray-700">
                        페이지 {tableData.page} / {tableData.total_pages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={tableData.page <= 1}
                          onClick={() => loadTableData(selectedTable, tableData.page - 1)}
                        >
                          이전
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={tableData.page >= tableData.total_pages}
                          onClick={() => loadTableData(selectedTable, tableData.page + 1)}
                        >
                          다음
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">데이터가 없습니다</h3>
                  <p className="text-gray-600">이 테이블에는 아직 데이터가 없습니다.</p>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">테이블을 선택하세요</h3>
              <p className="text-gray-600">좌측에서 관리할 테이블을 선택하면 데이터를 조회하고 편집할 수 있습니다.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
