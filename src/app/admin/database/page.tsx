'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTables, getTableSchema, getTableData, createTableRow, updateTableRow, deleteTableRow } from '@/services/databaseApi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

    const newRow: TableRow = {};
    tableSchema.columns.forEach(col => {
      if (col.default !== undefined) {
        newRow[col.name] = col.default;
      } else if (!col.nullable && !col.autoincrement) {
        // Set default values for required fields
        if (col.type.includes('VARCHAR') || col.type.includes('TEXT')) {
          newRow[col.name] = '';
        } else if (col.type.includes('INTEGER') || col.type.includes('BIGINT')) {
          newRow[col.name] = 0;
        } else if (col.type.includes('BOOLEAN')) {
          newRow[col.name] = false;
        } else if (col.type.includes('TIMESTAMP')) {
          newRow[col.name] = new Date().toISOString();
        } else {
          newRow[col.name] = null;
        }
      }
    });

    setEditData(newRow);
    setCreatingRow(true);
  };

  const handleEditRow = (row: TableRow) => {
    if (!tableSchema) return;

    // Get primary key value
    const pkColumn = tableSchema.primary_keys[0];
    const rowId = row[pkColumn];

    setEditData({ ...row });
    setEditingRow(rowId);
  };

  const handleSaveRow = async () => {
    if (!selectedTable || !tableSchema) return;

    try {
      if (creatingRow) {
        await createTableRow(selectedTable, editData);
        setCreatingRow(false);
      } else if (editingRow) {
        const pkColumn = tableSchema.primary_keys[0];
        await updateTableRow(selectedTable, editData[pkColumn], editData);
        setEditingRow(null);
      }

      // Reload data
      loadTableData(selectedTable, tableData?.page || 1);
      setEditData({});
    } catch (error) {
      console.error('Error saving row:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRow = async (row: TableRow) => {
    if (!selectedTable || !tableSchema || !confirm('정말 삭제하시겠습니까?')) return;

    try {
      const pkColumn = tableSchema.primary_keys[0];
      await deleteTableRow(selectedTable, row[pkColumn]);
      loadTableData(selectedTable, tableData?.page || 1);
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setCreatingRow(false);
    setEditData({});
  };

  const handleFilterChange = (column: string, value: string) => {
    const newFilters = { ...filters };
    if (value.trim()) {
      newFilters[column] = value.trim();
    } else {
      delete newFilters[column];
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    loadTableData(selectedTable, 1);
  };

  const clearFilters = () => {
    setFilters({});
    loadTableData(selectedTable, 1);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'posts': 'bg-blue-100 text-blue-800',
      'agents': 'bg-green-100 text-green-800',
      'hospitals': 'bg-purple-100 text-purple-800',
      'analytics': 'bg-orange-100 text-orange-800',
      'system': 'bg-red-100 text-red-800',
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
                <button
                  key={table.table_name}
                  onClick={() => handleTableSelect(table.table_name)}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    selectedTable === table.table_name
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  } border`}
                >
                  <div className="font-medium">{table.table_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {table.row_count.toLocaleString()} 행 • {table.data_size}
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${getCategoryColor(table.category)}`}>
                    {table.category}
                  </span>
                </button>
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
                      {tableSchema.columns.slice(0, 4).map((column) => (
                        <Input
                          key={column.name}
                          placeholder={`${column.name} 필터`}
                          value={filters[column.name] || ''}
                          onChange={(e) => handleFilterChange(column.name, e.target.value)}
                          className="flex-1 min-w-32"
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={applyFilters} size="sm">필터 적용</Button>
                      <Button onClick={clearFilters} variant="secondary" size="sm">필터 초기화</Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Create/Edit Form */}
              {(creatingRow || editingRow) && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    {creatingRow ? '새 행 추가' : '행 수정'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {tableSchema.columns.map((column) => (
                      <div key={column.name}>
                        <label className="block text-sm font-medium mb-1">
                          {column.name}
                          {tableSchema.primary_keys.includes(column.name) && ' (PK)'}
                          {!column.nullable && ' *'}
                        </label>
                        {column.type.includes('BOOLEAN') ? (
                          <select
                            value={editData[column.name] ? 'true' : 'false'}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [column.name]: e.target.value === 'true'
                            }))}
                            className="w-full p-2 border rounded"
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : column.type.includes('TIMESTAMP') ? (
                          <Input
                            type="datetime-local"
                            value={editData[column.name] ? new Date(editData[column.name]).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [column.name]: e.target.value ? new Date(e.target.value).toISOString() : null
                            }))}
                          />
                        ) : (
                          <Input
                            type={column.type.includes('INTEGER') || column.type.includes('BIGINT') ? 'number' : 'text'}
                            value={editData[column.name] || ''}
                            onChange={(e) => setEditData(prev => ({
                              ...prev,
                              [column.name]: column.type.includes('INTEGER') || column.type.includes('BIGINT')
                                ? (e.target.value ? parseInt(e.target.value) : 0)
                                : e.target.value
                            }))}
                            disabled={column.autoincrement && creatingRow}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveRow}>저장</Button>
                    <Button variant="secondary" onClick={handleCancelEdit}>취소</Button>
                  </div>
                </Card>
              )}

              {/* Data Table */}
              <Card className="overflow-hidden">
                {dataLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">데이터 로딩 중...</p>
                  </div>
                ) : tableData && tableData.data.length > 0 ? (
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
                                  {editingRow === rowId ? (
                                    column.type.includes('BOOLEAN') ? (
                                      <select
                                        value={editData[column.name] ? 'true' : 'false'}
                                        onChange={(e) => setEditData(prev => ({
                                          ...prev,
                                          [column.name]: e.target.value === 'true'
                                        }))}
                                        className="p-1 border rounded text-xs"
                                      >
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                      </select>
                                    ) : (
                                      <Input
                                        type={column.type.includes('INTEGER') ? 'number' : 'text'}
                                        value={editData[column.name] || ''}
                                        onChange={(e) => setEditData(prev => ({
                                          ...prev,
                                          [column.name]: column.type.includes('INTEGER')
                                            ? parseInt(e.target.value) || 0
                                            : e.target.value
                                        }))}
                                        className="p-1 text-xs"
                                        disabled={column.autoincrement}
                                      />
                                    )
                                  ) : (
                                    <span className="truncate max-w-xs block">
                                      {row[column.name] === null ? 'NULL' :
                                       typeof row[column.name] === 'boolean' ? (row[column.name] ? 'true' : 'false') :
                                       String(row[column.name]).length > 50 ?
                                         String(row[column.name]).substring(0, 50) + '...' :
                                         String(row[column.name])
                                      }
                                    </span>
                                  )}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                                {editingRow === rowId ? (
                                  <>
                                    <Button size="sm" onClick={handleSaveRow}>저장</Button>
                                    <Button size="sm" variant="secondary" onClick={handleCancelEdit}>취소</Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="secondary" onClick={() => handleEditRow(row)}>수정</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDeleteRow(row)}>삭제</Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    데이터가 없습니다
                  </div>
                )}

                {/* Pagination */}
                {tableData && tableData.total_pages > 1 && (
                  <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      총 {tableData.total}개 행 중 {(tableData.page - 1) * tableData.page_size + 1} - {Math.min(tableData.page * tableData.page_size, tableData.total)}개 표시
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => loadTableData(selectedTable, tableData.page - 1)}
                        disabled={tableData.page === 1}
                      >
                        이전
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        {tableData.page} / {tableData.total_pages}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => loadTableData(selectedTable, tableData.page + 1)}
                        disabled={tableData.page === tableData.total_pages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
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
