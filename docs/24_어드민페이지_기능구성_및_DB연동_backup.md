# 어드민 페이지 기능 구성 및 DB 연동

## 1. 어드민 페이지 개요

### 1.1 목적
- **시스템 전체 관리**: 모든 데이터베이스 테이블 접근 및 수정
- **캠페인 운영**: 캠페인 생성, 포스트 할당, 일정 관리
- **품질 관리**: 콘텐츠 검토, 승인, 수정 지시
- **성능 모니터링**: AI 에이전트 성능, 시스템 상태 감시
- **고객 지원**: 병원 계정 관리, 문제 해결

### 1.2 대상 사용자
- **시스템 관리자**: 최고 권한, 모든 기능 접근
- **운영 담당자**: 캠페인 및 콘텐츠 관리
- **품질 관리자**: 콘텐츠 검토 및 승인
- **고객 지원팀**: 병원 지원 및 문제 해결

### 1.3 핵심 원칙
- **완전한 데이터 접근**: 모든 테이블 CRUD 가능
- **강력한 모니터링**: 실시간 시스템 상태 파악
- **효율적인 운영**: 일괄 처리, 자동화 기능
- **안전한 관리**: 감사 로그, 권한 분리

## 2. 페이지 구조 및 기능

### 2.1 전체 페이지 구조
```
/admin/
├── /dashboard              # 종합 대시보드
├── /database/             # 데이터베이스 직접 관리
│   ├── /tables           # 테이블 목록
│   └── /[table]          # 테이블별 CRUD
├── /posts/               # 포스트 관리
│   ├── /                # 포스트 목록
│   ├── /create          # 포스트 생성
│   ├── /[id]            # 포스트 상세
│   ├── /[id]/review     # 포스트 검토
│   ├── /[id]/edit       # 직접 수정
│   └── /[id]/pipeline   # 파이프라인 상태
├── /campaigns/           # 캠페인 관리
│   ├── /                # 캠페인 목록
│   ├── /create          # 캠페인 생성
│   └── /[id]            # 캠페인 상세
├── /hospitals/           # 병원 관리
│   ├── /                # 병원 목록
│   ├── /create          # 병원 등록
│   └── /[id]            # 병원 상세
├── /agents/              # AI 에이전트 관리
│   ├── /performance     # 성능 모니터링
│   ├── /prompts         # 프롬프트 관리
│   └── /checklists      # 체크리스트 관리
├── /system/              # 시스템 관리
│   ├── /settings        # 시스템 설정
│   ├── /users           # 사용자 관리
│   ├── /logs            # 시스템 로그
│   └── /health          # 헬스체크
├── /analytics/           # 분석 및 보고
│   ├── /overview        # 전체 통계
│   ├── /quality         # 품질 분석
│   └── /reports         # 보고서 생성
└── /tools/               # 유틸리티 도구
    ├── /migration       # 데이터 마이그레이션
    ├── /backup          # 백업 관리
    └── /debug           # 디버깅 도구
```

## 3. 핵심 기능: 데이터베이스 직접 관리

### 3.1 테이블 목록 (/database/tables)
```typescript
interface DatabaseTablesView {
  tables: TableInfo[];
  stats: DatabaseStats;
}

interface TableInfo {
  tableName: string;
  rowCount: number;
  dataSize: string;
  indexSize: string;
  lastModified: Date;
  description?: string;
  category: 'posts' | 'agents' | 'system' | 'hospitals' | 'analytics';
}

interface DatabaseStats {
  totalTables: number;
  totalRows: number;
  totalSize: string;
  lastBackup: Date;
}

// 실제 테이블 목록 (31개)
const DATABASE_TABLES = [
  // 포스트 관련 (11개)
  { name: 'blog_posts', category: 'posts' },
  { name: 'post_materials', category: 'posts' },
  { name: 'post_images', category: 'posts' },
  { name: 'post_keywords_guide', category: 'posts' },
  { name: 'spt_info', category: 'posts' },
  { name: 'post_persona', category: 'posts' },
  { name: 'post_persona_mapping', category: 'posts' },
  { name: 'post_status_history', category: 'posts' },
  { name: 'admin_reviews', category: 'posts' },
  { name: 'client_reviews', category: 'posts' },
  { name: 'admin_revisions', category: 'posts' },
  
  // AI 에이전트 관련 (12개)
  { name: 'agent_execution_logs', category: 'agents' },
  { name: 'agent_results', category: 'agents' },
  { name: 'plan_results', category: 'agents' },
  { name: 'title_results', category: 'agents' },
  { name: 'content_results', category: 'agents' },
  { name: 'evaluation_results', category: 'agents' },
  { name: 'evaluation_items', category: 'agents' },
  { name: 'edit_results', category: 'agents' },
  { name: 'edit_history', category: 'agents' },
  { name: 'prompts', category: 'agents' },
  { name: 'evaluation_checklists', category: 'agents' },
  { name: 'evaluation_checklist_versions', category: 'agents' },
  
  // 병원/사용자 관련 (7개)
  { name: 'users', category: 'hospitals' },
  { name: 'hospital_info', category: 'hospitals' },
  { name: 'hospital_services', category: 'hospitals' },
  { name: 'region_info', category: 'hospitals' },
  { name: 'medical_services', category: 'hospitals' },
  { name: 'persona_style', category: 'hospitals' },
  { name: 'campaigns', category: 'hospitals' },
  
  // 기타 (1개)
  { name: 'pipeline_results', category: 'analytics' }
];
```

**DB 쿼리**:
```sql
-- 테이블 정보 조회
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3.2 테이블별 CRUD (/database/[table])
```typescript
interface TableCRUDView {
  table: {
    name: string;
    columns: ColumnInfo[];
    primaryKey: string[];
    foreignKeys: ForeignKey[];
    indexes: Index[];
  };
  
  data: {
    rows: any[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
  };
  
  operations: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    bulkImport: boolean;
    bulkExport: boolean;
  };
  
  filters: {
    columns: string[];
    conditions: FilterCondition[];
    sorting: SortingOption[];
  };
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

interface FilterCondition {
  column: string;
  operator: '=' | '!=' | '>' | '<' | 'LIKE' | 'IN' | 'IS NULL';
  value: any;
}
```

**동적 CRUD 쿼리 생성**:
```typescript
class DynamicCRUD {
  // CREATE
  async create(table: string, data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    return await db.query(query, values);
  }
  
  // READ with filters
  async read(table: string, filters: FilterCondition[], page: number, pageSize: number) {
    let query = `SELECT * FROM ${table}`;
    const values = [];
    let paramIndex = 1;
    
    if (filters.length > 0) {
      const conditions = filters.map(filter => {
        if (filter.operator === 'IS NULL') {
          return `${filter.column} IS NULL`;
        }
        values.push(filter.value);
        return `${filter.column} ${filter.operator} $${paramIndex++}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
    
    return await db.query(query, values);
  }
  
  // UPDATE
  async update(table: string, id: any, data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`);
    
    const query = `
      UPDATE ${table}
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    return await db.query(query, [id, ...values]);
  }
  
  // DELETE
  async delete(table: string, id: any) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    return await db.query(query, [id]);
  }
  
  // BULK operations
  async bulkImport(table: string, data: any[]) {
    // CSV import logic
  }
  
  async bulkExport(table: string, filters: FilterCondition[]) {
    // CSV export logic
  }
}
```

### 3.3 테이블별 특수 기능

#### 3.3.1 blog_posts 테이블 특수 기능
```typescript
interface BlogPostsSpecialFeatures {
  // 상태 일괄 변경
  bulkStatusUpdate: {
    postIds: string[];
    newStatus: PostStatus;
    reason?: string;
  };
  
  // 캠페인 재할당
  campaignReassignment: {
    fromCampaignId: number;
    toCampaignId: number;
    postIds?: string[];
  };
  
  // 일정 일괄 조정
  scheduleAdjustment: {
    campaignId: number;
    daysToAdd: number;
  };
  
  // 파이프라인 재실행
  pipelineRerun: {
    postIds: string[];
    fromAgent?: AgentType;
  };
}
```

#### 3.3.2 agent_execution_logs 테이블 특수 기능
```typescript
interface AgentLogsSpecialFeatures {
  // 오류 분석
  errorAnalysis: {
    timeRange: DateRange;
    groupBy: 'agent_type' | 'error_type' | 'post_id';
  };
  
  // 성능 분석
  performanceAnalysis: {
    agentType?: string;
    percentiles: [50, 90, 95, 99];
  };
  
  // 로그 정리
  cleanup: {
    olderThan: number;      // days
    status?: 'completed' | 'failed';
    dryRun: boolean;
  };
}
```

## 4. 포스트 관리 고급 기능

### 4.1 포스트 파이프라인 모니터링 (/posts/[id]/pipeline)
```typescript
interface PipelineMonitoring {
  post: {
    postId: string;
    title?: string;
    status: string;
  };
  
  pipeline: {
    stages: PipelineStage[];
    currentStage?: string;
    overallProgress: number;
    estimatedCompletion?: Date;
  };
  
  agents: {
    [agentType: string]: AgentStatus;
  };
}

interface PipelineStage {
  agent: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  executionTime?: number;
  input?: any;
  output?: any;
  error?: string;
  logs?: LogEntry[];
}

interface AgentStatus {
  executionId: string;
  status: string;
  progress?: number;
  currentOperation?: string;
  metrics?: {
    tokenUsage?: number;
    apiCalls?: number;
    cacheHits?: number;
  };
}
```

**실시간 모니터링 쿼리**:
```sql
-- 파이프라인 상태 조회
WITH pipeline_status AS (
  SELECT 
    ael.post_id,
    ael.agent_type,
    ael.execution_status,
    ael.created_at as start_time,
    ael.updated_at as end_time,
    ael.execution_time,
    ael.error_message,
    ael.retry_count,
    ael.fallback_type
  FROM agent_execution_logs ael
  WHERE ael.post_id = $1
  ORDER BY ael.created_at DESC
),
latest_executions AS (
  SELECT DISTINCT ON (agent_type)
    *
  FROM pipeline_status
  ORDER BY agent_type, start_time DESC
)
SELECT 
  le.*,
  ar.result_data,
  ar.success,
  ar.token_usage
FROM latest_executions le
LEFT JOIN agent_results ar ON le.post_id = ar.post_id 
  AND le.agent_type = ar.agent_type
ORDER BY 
  CASE le.agent_type
    WHEN 'input' THEN 1
    WHEN 'plan' THEN 2
    WHEN 'title' THEN 3
    WHEN 'content' THEN 4
    WHEN 'evaluation' THEN 5
    WHEN 'edit' THEN 6
  END;
```

### 4.2 포스트 직접 수정 (/posts/[id]/edit)
```typescript
interface DirectEditInterface {
  post: BlogPost;
  
  editors: {
    title: {
      current: string;
      suggestions: string[];    // AI 제안
      history: TitleChange[];
    };
    
    content: {
      markdown: string;         // 마크다운 에디터
      html: string;             // HTML 미리보기
      sections: Section[];      // 섹션별 편집
      aiAssist: {
        rewrite: boolean;       // AI 재작성
        improve: boolean;       // AI 개선
        checkCompliance: boolean; // 의료법 검사
      };
    };
    
    seo: {
      metaTitle: string;
      metaDescription: string;
      keywords: string[];
      preview: SEOPreview;
    };
  };
  
  validation: {
    realtime: boolean;          // 실시간 검증
    medical: CheckResult[];     // 의료법 체크
    seo: CheckResult[];         // SEO 체크
  };
}
```

**직접 수정 저장**:
```sql
BEGIN;

-- 1. 콘텐츠 버전 저장
INSERT INTO content_versions (
  post_id, version_number, title, content, created_by
) 
SELECT 
  $1, 
  COALESCE(MAX(version_number), 0) + 1,
  $2,
  $3,
  $4
FROM content_versions
WHERE post_id = $1;

-- 2. 현재 콘텐츠 업데이트
UPDATE content_results
SET 
  title = $2,
  assembled_markdown = $3,
  assembled_html = $4,
  sections = $5
WHERE post_id = $1;

-- 3. 어드민 수정 기록
INSERT INTO admin_revisions (
  post_id, admin_id, revision_type, original_content, revised_content, revision_notes
) VALUES ($1, $4, 'direct_edit', $6, $7, $8);

-- 4. 재평가 트리거
INSERT INTO agent_execution_logs (
  post_id, agent_type, execution_status, input_data
) VALUES ($1, 'evaluation', 'pending', '{"trigger": "admin_edit"}');

COMMIT;
```

## 5. 캠페인 관리 고급 기능

### 5.1 캠페인 생성 마법사 (/campaigns/create)
```typescript
interface CampaignCreationWizard {
  steps: {
    // Step 1: 기본 정보
    basic: {
      name: string;
      hospital: Hospital;
      period: {
        startDate: Date;
        endDate: Date;
      };
      targetPostCount: number;
    };
    
    // Step 2: 서비스 선택
    services: {
      selectedServices: MedicalService[];
      distribution: {         // 서비스별 포스트 배분
        [serviceId: number]: number;
      };
    };
    
    // Step 3: 일정 계획
    schedule: {
      strategy: 'even' | 'custom' | 'frontload';
      customDates?: Date[];
      excludeDates?: Date[];   // 공휴일 등
      preferredDays?: number[]; // 0-6 (일-토)
    };
    
    // Step 4: 자동화 설정
    automation: {
      autoCreatePosts: boolean;
      autoAssignDeadlines: boolean;
      reminderSettings: {
        daysBeforeDeadline: number[];
        notificationChannels: ('email' | 'sms' | 'push')[];
      };
    };
  };
  
  preview: {
    calendar: CalendarView;
    timeline: TimelineView;
    workload: WorkloadView;
  };
}
```

**캠페인 생성 트랜잭션**:
```sql
BEGIN;

-- 1. 캠페인 생성
INSERT INTO campaigns (
  name, description, hospital_id, medical_service_id,
  start_date, end_date, target_post_count, status, created_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
RETURNING id INTO campaign_id;

-- 2. 포스트 자동 생성
INSERT INTO blog_posts (
  post_id, campaign_id, hospital_id, medical_service_id,
  post_type, campaign_sequence, campaign_target_date,
  is_campaign_post, status, created_by
)
SELECT 
  'POST_' || gen_random_uuid(),
  campaign_id,
  $3,
  service_allocation.service_id,
  'informational',
  ROW_NUMBER() OVER (ORDER BY target_date),
  target_date,
  true,
  'initial',
  $8
FROM (
  -- 서비스별 포스트 할당 로직
) service_allocation;

-- 3. 상태 이력 기록
INSERT INTO campaign_status_history (
  campaign_id, status, reason, changed_by
) VALUES (campaign_id, 'active', '캠페인 생성', $8);

COMMIT;
```

### 5.2 캠페인 대시보드 (/campaigns/[id])
```typescript
interface CampaignDashboard {
  campaign: Campaign;
  
  metrics: {
    progress: {
      overall: number;          // 전체 진행률
      byStatus: {
        [status: string]: number;
      };
      timeline: {
        elapsed: number;        // 경과 일수
        remaining: number;      // 남은 일수
      };
    };
    
    quality: {
      avgSeoScore: number;
      avgLegalScore: number;
      firstPassRate: number;    // 첫 검토 통과율
    };
    
    productivity: {
      postsPerWeek: number;
      avgCompletionTime: number; // 평균 완료 시간
      bottlenecks: string[];    // 병목 구간
    };
  };
  
  posts: {
    grid: PostGridView;
    kanban: PostKanbanView;
    calendar: PostCalendarView;
  };
  
  actions: {
    bulkActions: BulkAction[];
    quickActions: QuickAction[];
  };
}
```

## 6. AI 에이전트 관리

### 6.1 프롬프트 관리 (/agents/prompts)
```typescript
interface PromptManagement {
  prompts: {
    active: PromptVersion[];
    testing: PromptVersion[];
    archived: PromptVersion[];
  };
  
  editor: {
    syntax: 'markdown' | 'jinja2';
    variables: Variable[];
    preview: {
      sample: any;              // 샘플 데이터
      result: string;           // 렌더링 결과
    };
    validation: {
      syntax: boolean;
      variables: boolean;
      length: number;           // 토큰 수
    };
  };
  
  testing: {
    abTest: {
      variantA: PromptVersion;
      variantB: PromptVersion;
      metrics: ABTestMetrics;
      significance: number;     // 통계적 유의성
    };
    
    benchmark: {
      testCases: TestCase[];
      results: BenchmarkResult[];
    };
  };
}

interface PromptVersion {
  id: number;
  agentType: string;
  version: string;
  content: string;
  variables: string[];
  performance: {
    usageCount: number;
    avgScore: number;
    errorRate: number;
  };
}
```

**프롬프트 A/B 테스트**:
```sql
-- A/B 테스트 결과 분석
WITH test_results AS (
  SELECT 
    pp.prompt_id,
    p.version,
    COUNT(*) as usage_count,
    AVG(pp.quality_score) as avg_quality,
    AVG(pp.seo_score) as avg_seo,
    AVG(pp.legal_score) as avg_legal,
    SUM(CASE WHEN pp.success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
  FROM prompt_performance pp
  JOIN prompts p ON pp.prompt_id = p.id
  WHERE p.agent_type = $1
    AND p.version IN ($2, $3)
    AND pp.created_at >= $4
  GROUP BY pp.prompt_id, p.version
)
SELECT 
  *,
  -- 통계적 유의성 계산 (간단한 Z-test)
  ABS(
    (SELECT avg_quality FROM test_results WHERE version = $2) -
    (SELECT avg_quality FROM test_results WHERE version = $3)
  ) / SQRT(
    POWER((SELECT STDDEV(quality_score) FROM prompt_performance WHERE prompt_id IN (SELECT id FROM prompts WHERE version = $2)), 2) / 
    (SELECT usage_count FROM test_results WHERE version = $2) +
    POWER((SELECT STDDEV(quality_score) FROM prompt_performance WHERE prompt_id IN (SELECT id FROM prompts WHERE version = $3)), 2) / 
    (SELECT usage_count FROM test_results WHERE version = $3)
  ) as z_score
FROM test_results;
```

### 6.2 체크리스트 관리 (/agents/checklists)
```typescript
interface ChecklistManagement {
  checklists: {
    medical: ChecklistVersion[];
    seo: ChecklistVersion[];
  };
  
  editor: {
    rules: Rule[];
    weights: { [ruleId: string]: number };
    thresholds: { [ruleId: string]: number };
    
    testing: {
      testContent: string;
      results: {
        ruleId: string;
        score: number;
        matches: string[];
        passed: boolean;
      }[];
      overallScore: number;
    };
  };
  
  calibration: {
    expertEvaluations: ExpertEvaluation[];
    correlation: number;        // 전문가 평가와의 상관관계
    recommendations: string[];  // 개선 추천사항
  };
}

interface Rule {
  id: string;
  name: string;
  description: string;
  patterns: string[];           // 정규식 패턴
  weight: number;
  maxScore: number;
  severity: 'low' | 'medium' | 'high';
}
```

### 6.3 에이전트 성능 모니터링 (/agents/performance)
```typescript
interface AgentPerformanceMonitoring {
  overview: {
    agents: {
      [agentType: string]: {
        health: 'healthy' | 'degraded' | 'critical';
        metrics: {
          successRate: number;
          avgExecutionTime: number;
          errorRate: number;
          throughput: number;   // 처리량/시간
        };
        trends: {
          daily: Metric[];
          weekly: Metric[];
        };
      };
    };
  };
  
  alerts: {
    active: Alert[];
    history: Alert[];
    rules: AlertRule[];
  };
  
  diagnostics: {
    slowQueries: Query[];
    failurePatterns: Pattern[];
    resourceUsage: {
      cpu: number;
      memory: number;
      apiQuota: {
        used: number;
        limit: number;
      };
    };
  };
}
```

**성능 모니터링 쿼리**:
```sql
-- 에이전트별 실시간 성능 메트릭
WITH agent_metrics AS (
  SELECT 
    agent_type,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN execution_status = 'completed' THEN 1 END) as successful,
    COUNT(CASE WHEN execution_status = 'failed' THEN 1 END) as failed,
    AVG(execution_time) as avg_execution_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time) as median_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time) as p95_time,
    MAX(execution_time) as max_time
  FROM agent_execution_logs
  WHERE created_at >= NOW() - INTERVAL '1 hour'
  GROUP BY agent_type
)
SELECT 
  *,
  successful::float / NULLIF(total_executions, 0) * 100 as success_rate,
  failed::float / NULLIF(total_executions, 0) * 100 as error_rate,
  CASE 
    WHEN successful::float / NULLIF(total_executions, 0) < 0.8 THEN 'critical'
    WHEN successful::float / NULLIF(total_executions, 0) < 0.95 THEN 'degraded'
    ELSE 'healthy'
  END as health_status
FROM agent_metrics;
```

## 7. 시스템 관리

### 7.1 사용자 및 권한 관리 (/system/users)
```typescript
interface UserManagement {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  
  operations: {
    createUser: {
      profile: UserProfile;
      role: string;
      hospitals?: number[];     // 접근 가능 병원
      permissions?: string[];   // 추가 권한
    };
    
    bulkImport: {
      csv: File;
      mapping: FieldMapping;
      validation: ValidationResult;
    };
    
    accessControl: {
      ipWhitelist: string[];
      mfaRequired: boolean;
      sessionTimeout: number;
    };
  };
  
  audit: {
    loginHistory: LoginEvent[];
    actionLog: ActionEvent[];
    suspiciousActivity: Alert[];
  };
}
```

### 7.2 시스템 헬스체크 (/system/health)
```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  
  components: {
    database: {
      status: string;
      connections: {
        active: number;
        idle: number;
        max: number;
      };
      replication?: {
        lag: number;
        status: string;
      };
    };
    
    redis: {
      status: string;
      memory: {
        used: string;
        available: string;
      };
      hits: number;
      misses: number;
    };
    
    api: {
      status: string;
      requestsPerMinute: number;
      avgResponseTime: number;
      errorRate: number;
    };
    
    storage: {
      images: {
        used: string;
        available: string;
      };
      backups: {
        lastBackup: Date;
        nextBackup: Date;
      };
    };
  };
  
  metrics: {
    uptime: number;
    lastIncident?: Date;
    scheduledMaintenance?: Date;
  };
}
```

**헬스체크 쿼리**:
```sql
-- 데이터베이스 헬스체크
SELECT 
  (SELECT count(*) FROM pg_stat_activity) as active_connections,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
  pg_database_size(current_database()) as database_size,
  (SELECT count(*) FROM pg_stat_user_tables) as table_count,
  (SELECT sum(n_live_tup) FROM pg_stat_user_tables) as total_rows;

-- 느린 쿼리 감지
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- 1초 이상
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 8. 분석 및 보고

### 8.1 품질 분석 대시보드 (/analytics/quality)
```typescript
interface QualityAnalytics {
  overview: {
    periodComparison: {
      current: QualityMetrics;
      previous: QualityMetrics;
      change: ChangeMetrics;
    };
  };
  
  detailed: {
    byHospital: {
      hospital: Hospital;
      metrics: QualityMetrics;
      ranking: number;
      trend: 'improving' | 'stable' | 'declining';
    }[];
    
    byCategory: {
      category: string;
      metrics: QualityMetrics;
      topPerformers: Post[];
      needsImprovement: Post[];
    }[];
    
    byAgent: {
      agent: string;
      firstPassRate: number;
      avgIterations: number;
      commonIssues: Issue[];
    }[];
  };
  
  insights: {
    correlations: {
      factor: string;
      correlation: number;
      significance: number;
    }[];
    
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      category: string;
      suggestion: string;
      expectedImpact: string;
    }[];
  };
}
```

### 8.2 보고서 생성 (/analytics/reports)
```typescript
interface ReportGeneration {
  templates: {
    monthly: ReportTemplate;
    quarterly: ReportTemplate;
    custom: ReportTemplate;
  };
  
  builder: {
    sections: Section[];
    data: {
      tables: DataTable[];
      charts: Chart[];
      metrics: Metric[];
    };
    
    export: {
      formats: ('pdf' | 'excel' | 'ppt')[];
      scheduling: {
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string[];
      };
    };
  };
  
  automation: {
    scheduled: ScheduledReport[];
    triggers: ReportTrigger[];
  };
}
```

## 9. 유틸리티 도구

### 9.1 데이터 마이그레이션 (/tools/migration)
```typescript
interface DataMigration {
  import: {
    source: 'csv' | 'json' | 'database';
    mapping: {
      sourceField: string;
      targetTable: string;
      targetField: string;
      transformation?: string;
    }[];
    validation: {
      rules: ValidationRule[];
      preview: any[];
      errors: ValidationError[];
    };
  };
  
  export: {
    tables: string[];
    format: 'csv' | 'json' | 'sql';
    filters?: FilterCondition[];
    anonymize?: string[];       // 익명화할 필드
  };
  
  sync: {
    source: DatabaseConfig;
    target: DatabaseConfig;
    tables: string[];
    mode: 'full' | 'incremental';
    schedule?: CronExpression;
  };
}
```

### 9.2 디버깅 도구 (/tools/debug)
```typescript
interface DebugTools {
  queryBuilder: {
    tables: string[];
    joins: Join[];
    conditions: Condition[];
    preview: string;            // SQL 미리보기
    explain: ExplainResult;     // 실행 계획
  };
  
  logViewer: {
    sources: LogSource[];
    filters: LogFilter[];
    search: string;
    realtime: boolean;
  };
  
  apiTester: {
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body: any;
    response: {
      status: number;
      headers: Record<string, string>;
      body: any;
      time: number;
    };
  };
  
  dataInspector: {
    table: string;
    id: any;
    relations: RelatedData[];
    history: ChangeHistory[];
    references: Reference[];
  };
}
```

## 10. 구현 우선순위

### Phase 1: 핵심 관리 기능 (1-2주)
1. 데이터베이스 CRUD 인터페이스
2. 포스트 관리 (목록, 상세, 검토)
3. 캠페인 관리 기본
4. 대시보드 구현

### Phase 2: AI 에이전트 관리 (3-4주)
1. 프롬프트 관리 시스템
2. 체크리스트 편집기
3. 성능 모니터링
4. 파이프라인 실시간 추적

### Phase 3: 고급 기능 (5-6주)
1. 직접 수정 에디터
2. 일괄 처리 도구
3. 자동화 규칙 엔진
4. 고급 분석 대시보드

### Phase 4: 시스템 도구 (7-8주)
1. 사용자/권한 관리
2. 시스템 헬스 모니터링
3. 백업/복구 도구
4. 마이그레이션 도구

## 11. 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Ant Design Pro
- **State**: Zustand + React Query
- **Charts**: Apache ECharts
- **Editor**: Monaco Editor (코드), Lexical (리치 텍스트)
- **Tables**: AG-Grid (고급 데이터 그리드)

### Backend Integration
- **API**: RESTful + GraphQL (복잡한 쿼리)
- **WebSocket**: Socket.io (실시간 업데이트)
- **File Upload**: Resumable.js
- **Export**: ExcelJS, PDFKit

### Security
- **Auth**: JWT + Role-based Access
- **Audit**: 모든 쓰기 작업 로깅
- **Encryption**: 민감 데이터 암호화
- **Rate Limiting**: API 호출 제한

## 12. 보안 및 감사

### 12.1 권한 매트릭스
```typescript
const PERMISSION_MATRIX = {
  // 시스템 관리자
  system_admin: {
    database: ['create', 'read', 'update', 'delete'],
    posts: ['create', 'read', 'update', 'delete', 'approve', 'publish'],
    campaigns: ['create', 'read', 'update', 'delete'],
    hospitals: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    system: ['read', 'update', 'maintain'],
  },
  
  // 운영 담당자
  operator: {
    database: ['read'],
    posts: ['create', 'read', 'update', 'approve'],
    campaigns: ['create', 'read', 'update'],
    hospitals: ['read', 'update'],
    users: ['read'],
    system: ['read'],
  },
  
  // 품질 관리자
  qa_manager: {
    database: ['read'],
    posts: ['read', 'update', 'approve'],
    campaigns: ['read'],
    hospitals: ['read'],
    users: [],
    system: ['read'],
  },
  
  // 고객 지원
  support: {
    database: ['read'],
    posts: ['read'],
    campaigns: ['read'],
    hospitals: ['read', 'update'],
    users: ['read', 'update'],
    system: [],
  },
};
```

### 12.2 감사 로그
```typescript
interface AuditLog {
  timestamp: Date;
  userId: number;
  userName: string;
  action: string;               // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
  resource: string;             // 테이블명 또는 리소스
  resourceId: any;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  errorMessage?: string;
}

// 감사 로그 자동 기록
const auditMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  
  // 원본 응답 함수 저장
  const originalSend = res.send;
  
  res.send = function(data) {
    // 감사 로그 기록
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      recordAuditLog({
        timestamp: new Date(),
        userId: req.user.id,
        userName: req.user.name,
        action: req.method,
        resource: req.path,
        resourceId: req.params.id,
        changes: req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        result: res.statusCode < 400 ? 'success' : 'failure',
        responseTime: Date.now() - startTime,
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
```

이 구성을 통해 어드민은 시스템의 모든 측면을 완벽하게 제어하고, 효율적으로 운영하며, 문제를 신속하게 해결할 수 있습니다. 특히 모든 데이터베이스 테이블에 대한 직접적인 CRUD 접근을 제공하여 예상치 못한 상황에도 유연하게 대응할 수 있습니다.
