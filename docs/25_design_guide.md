# MediContents QA 디자인 가이드
*Version 2.0 | 2025.01*

---

## 디자인 철학

### 핵심 원칙
**"Less is More - 최소한의 요소로 최대한의 명확성을"**

- **단일 폰트 시스템**: 하나의 폰트로 모든 위계 표현
- **5가지 스타일 원칙**: 제한된 스타일을 다양한 요소에 재사용
- **색상 최소화**: 메인 컬러 하나와 투명도/Hue 조정으로 전체 구성
- **극도의 둥글기**: 매우 둥근 모서리로 친근하고 부드러운 느낌
- **넉넉한 여백**: 공간의 여유가 만드는 고급스러움

---

## 1. 타이포그래피

### 1.1 단일 폰트 시스템
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', sans-serif;
```

### 1.2 폰트 크기 (4단계만 사용)
```css
--text-xl: 52px;   /* 히어로 숫자, 대시보드 메인 수치 */
--text-lg: 32px;   /* 페이지 제목, 섹션 헤딩 */
--text-md: 24px;   /* 서브 헤딩, 카드 제목 */
--text-base: 18px; /* 본문, 기본 텍스트 */
```

### 1.3 폰트 굵기 (2단계만 사용)
```css
--font-bold: 700;    /* 제목, 강조 */
--font-medium: 500;  /* 본문, 일반 */
```

### 1.4 텍스트 색상 (투명도로 구분)
```css
/* 메인 텍스트 색상 */
--text-primary: #2A485E;           /* 100% - 제목, 중요 정보 */
--text-secondary: rgba(42, 72, 94, 0.7);  /* 70% - 본문 */
--text-tertiary: rgba(42, 72, 94, 0.3);   /* 30% - 보조 정보 */
```

---

## 2. 색상 시스템

### 2.1 메인 브랜드 컬러 (1개)
```css
--primary: #4A7C9E;  /* Ceil Blue - 모든 주요 액션과 브랜딩 */
```

### 2.2 메인 컬러 파생 (투명도 활용)
```css
--primary-10: rgba(74, 124, 158, 0.1);  /* 배경 */
--primary-30: rgba(74, 124, 158, 0.3);  /* 그림자 */
--primary-50: rgba(74, 124, 158, 0.5);  /* 호버 상태 */
```

### 2.3 액센트 컬러 (Hue 조정)
```css
/* HSL 색상에서 H값만 조정하여 생성 */
--accent-teal: #4A9E8C;    /* H: 165 */
--accent-cyan: #4A8C9E;    /* H: 195 */  
--accent-green: #6FA382;   /* H: 145 */
```

### 2.4 기본 색상
```css
--white: #FFFFFF;
--bg-light: #FAFBFC;  /* 아주 연한 회색 배경 */
```

### 2.5 사용 규칙
- **Primary 색상은 최소한으로**: 페이지당 1-2개 요소만
- **그림자는 항상 같은 색상**: 요소 색상의 30% 투명도
- **배경은 10% 투명도**: 메인 컬러의 10%로 통일

---

## 3. 스타일 시스템 (5가지만)

### 3.1 Style 1: 기본 컨테이너
```css
.container {
    background: white;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 9px 26px 0 rgba(74, 124, 158, 0.15);
}
```

### 3.2 Style 2: 강조 컨테이너
```css
.container-emphasis {
    background: white;
    border-radius: 40px;
    padding: 48px;
    box-shadow: 0 34px 53px 0 rgba(74, 124, 158, 0.15);
}
```

### 3.3 Style 3: Primary Action (아껴서 사용)
```css
.primary-action {
    background: #4A7C9E;
    color: white;
    border-radius: 32px;
    padding: 16px 32px;
    box-shadow: 0 15px 24px 0 rgba(74, 124, 158, 0.3);
    font-weight: 700;
}
```

### 3.4 Style 4: 아이콘 박스
```css
.icon-box {
    width: 48px;
    height: 48px;
    background: rgba(74, 124, 158, 0.1);
    border-radius: 16px;
    /* 활성 상태 */
    &.active {
        background: #4A7C9E;
        color: white;
        box-shadow: 0 15px 24px 0 rgba(74, 124, 158, 0.3);
    }
}
```

### 3.5 Style 5: 보조 액션
```css
.secondary-action {
    background: transparent;
    border: 2px solid rgba(74, 124, 158, 0.2);
    border-radius: 32px;
    padding: 16px 32px;
    color: #4A7C9E;
}
```

---

## 4. 여백 시스템

### 4.1 여백 스케일
```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
```

### 4.2 적용 원칙
- **요소 간 여백은 일관되게**: 같은 그룹 내에서는 동일한 여백
- **여백을 두려워하지 말 것**: 넉넉한 공간이 고급스러움을 만듦
- **섹션 간격은 최소 48px**: 명확한 구분

---

## 5. Border Radius

### 5.1 극도로 둥글게
```css
--radius-sm: 16px;   /* 작은 요소 (아이콘 박스) */
--radius-md: 24px;   /* 일반 컨테이너 */
--radius-lg: 32px;   /* 버튼 */
--radius-xl: 40px;   /* 강조 컨테이너 */
```

### 5.2 적용 원칙
- **같은 그룹은 같은 radius**: 일관성 유지
- **버튼은 매우 둥글게**: 32px로 통일
- **카드는 충분히 둥글게**: 24px 이상

---

## 6. 그림자

### 6.1 그림자 스타일 (2단계)
```css
/* 일반 그림자 */
--shadow-default: 0 9px 26px 0 rgba(74, 124, 158, 0.15);

/* 강조 그림자 */
--shadow-emphasis: 0 15px 24px 0 rgba(74, 124, 158, 0.3);
```

### 6.2 적용 원칙
- **같은 색상 사용**: 요소 색상의 투명도 버전
- **선택적 적용**: 모든 요소가 아닌 일부만
- **깊이감 표현**: 중요도에 따라 그림자 강도 조절

---

## 7. 아이콘

### 7.1 스타일
- **Outline 아이콘만 사용**: 일관성 유지
- **크기**: 20px, 24px, 32px
- **스트로크**: 2px 통일

### 7.2 색상
- 기본: `rgba(42, 72, 94, 0.7)`
- 활성: `#4A7C9E`
- 배경 위: `white`

---

## 8. 컴포넌트 디자인

### 8.1 버튼
```css
/* Primary Button - 페이지당 1-2개만 */
.btn-primary {
    height: 48px;
    padding: 0 32px;
    background: #4A7C9E;
    color: white;
    border-radius: 32px;
    font-size: 18px;
    font-weight: 700;
    box-shadow: 0 15px 24px 0 rgba(74, 124, 158, 0.3);
}

/* Secondary Button */
.btn-secondary {
    height: 48px;
    padding: 0 32px;
    background: transparent;
    border: 2px solid rgba(74, 124, 158, 0.2);
    color: #4A7C9E;
    border-radius: 32px;
    font-size: 18px;
    font-weight: 500;
}
```

### 8.2 카드
```css
.card {
    background: white;
    border-radius: 24px;
    padding: 32px;
    /* 선택적 그림자 */
    box-shadow: 0 9px 26px 0 rgba(74, 124, 158, 0.15);
}
```

### 8.3 입력 필드
```css
.input {
    height: 48px;
    padding: 0 24px;
    background: white;
    border: 2px solid rgba(74, 124, 158, 0.1);
    border-radius: 24px;
    font-size: 18px;
}

.input:focus {
    border-color: rgba(74, 124, 158, 0.3);
    box-shadow: 0 0 0 4px rgba(74, 124, 158, 0.1);
}
```

---

## 9. 레이아웃 원칙

### 9.1 그리드
- **일관된 간격**: 24px 또는 32px
- **비례적 여백**: 시각적으로 균형잡힌 공간 배분
- **중앙 정렬**: 버튼 내 텍스트는 완벽히 중앙에

### 9.2 최대 너비
- 컨테이너: 1200px
- 텍스트 블록: 720px
- 사이드바: 280px

---

## 10. 인터랙션

### 10.1 호버 효과
```css
/* 리프트 효과 */
:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 30px 0 rgba(74, 124, 158, 0.3);
}
```

### 10.2 트랜지션
```css
transition: all 0.2s ease;
```

### 10.3 포커스 상태
```css
:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(74, 124, 158, 0.1);
}
```

---

## 11. 적용 체크리스트

### DO's ✅
- [ ] 하나의 폰트만 사용
- [ ] 4가지 크기, 2가지 굵기만 사용
- [ ] Primary action은 페이지당 1-2개
- [ ] 넉넉한 여백 확보 (최소 24px)
- [ ] 매우 둥근 모서리 (24px 이상)
- [ ] 같은 색상의 그림자
- [ ] Outline 아이콘 일관성

### DON'Ts ❌
- [ ] 여러 폰트 혼용
- [ ] 과도한 색상 사용
- [ ] 모든 요소에 그림자
- [ ] Primary 색상 남용
- [ ] 좁은 여백
- [ ] 날카로운 모서리
- [ ] Solid/Outline 아이콘 혼용

---

## 12. 인터페이스별 적용

### 12.1 대시보드
- Primary action: "콘텐츠 검토하기" 버튼 1개
- 카드 radius: 24px
- 섹션 간격: 48px
- 아이콘 박스 적극 활용

### 12.2 클라이언트 페이지
- Primary action: 단계별 1개씩만
- 넉넉한 padding: 48px
- 명확한 위계: 크기와 굵기로만

### 12.3 랜딩 페이지
- Primary action: CTA 버튼 1개
- 섹션 간격: 64px 이상
- 일러스트레이션 활용

---

## 13. 참고자료: UI 아티클 분석

이 섹션은 디자인 가이드의 기반이 된 UI 아티클의 시각적 레퍼런스를 상세히 분석하고 설명합니다.

### 13.1 대시보드 레이아웃 (Dashboard Layout)

전체 레이아웃 구조
배경: 연한 블루-퍼플 그라데이션 배경 (좌상단 블루 → 우하단 퍼플)
메인 구성: 4개의 플로팅 카드가 겹쳐진 형태로 배치

각 카드별 상세 설명
1. 왼쪽 사이드바 카드 (좌측 최하단)

크기: 좁고 세로로 긴 형태
상단 로고: "DocApp" 텍스트와 파란색 햄버거 메뉴 아이콘
네비게이션 메뉴:

Dashboard (파란 배경의 흰색 아이콘 - 활성 상태)
Calendar (회색 아이콘)
Profile (회색 아이콘)
Settings (회색 아이콘)


하단:

"Dr Anna Snowden" 프로필 사진과 이름
"Log out" 링크



2. 메인 대시보드 카드 (중앙 좌측)

헤더:

"Your dashboard" 큰 제목 (32px, bold)
"Today's timeline" 부제목 (회색, 18px)


타임라인 리스트:

Started shift - 06:00 AM (시계 아이콘)
Appointment - 06:30 AM (종 아이콘)
Appointment - 07:00 AM (종 아이콘)
Break - 07:30 AM (커피 아이콘)
Appointment - 07:30 AM (종 아이콘, 파란 배경 - 선택됨)
Appointment - 07:30 AM (종 아이콘)


하단 버튼: "End today's shift" (파란색 Primary 버튼)
최하단: "Set a reminder" 링크

3. 캘린더 카드 (중앙 상단)

제목: "May, 2020"
달력 그리드:

7x5 그리드
17일에 파란색 원 (오늘 날짜)
일부 날짜에 연한 파란색 표시



4. Today's appointments 카드 (중앙 우측)

제목: "Today's appointments" (24px, bold)
환자 카드 5개 (가로 스크롤):

Jessica Ashcroft (Follow-up, Next 08:00) - 파란 테두리
Lily Anderson (New patient, 08:30)
Amanda Lipp (New patient, 09:00)
Adrienne Olly (Follow-up, 09:30)
Alicia James (Follow-up, 11:30)



5. Monthly reports 카드 (하단 중앙)

제목: "Monthly reports"
4개 보고서 항목:

Treatment report - 85% (파란 프로그레스 바)
State of being report - 75% (청록색 프로그레스 바)
Health department report - 65% (청록색 프로그레스 바)
Questionnaire - 75% (청록색 프로그레스 바)



6. 주간 차트 카드 (좌측 하단)

막대 그래프:

요일별 (Mon-Sun)
파란색과 청록색 막대가 교대로 표시
높이가 다양함



7. 우측 상단 요소들

인사 카드:

"Hello, Anne!" 제목
"Don't forget to complete your daily health report."
"Have a nice day!" 메시지
"Complete report" 파란 버튼
의사 일러스트레이션 (간단한 선화 스타일)


우측 하단: Chat 플로팅 버튼 (파란색 원형)
최상단 작은 카드: "Lily Anderson, 27 years, Brighton" (환자 정보 팝업)


디자인 특징

border-radius: 모든 카드 24-32px의 매우 둥근 모서리
그림자: 부드러운 블루 톤의 그림자 (blur 20-30px)
색상: 메인 파란색 (#1479FF 추정) + 청록색 액센트
여백: 카드 간 충분한 간격, 내부 패딩 32px 이상
타이포: 굵은 제목(bold), 일반 본문(medium), 회색 보조 텍스트
```

#### 구성 요소 설명

*   **좌측 네비게이션 바 (LNB)**: 시스템의 주요 메뉴에 빠르게 접근할 수 있는 고정 영역입니다. 아이콘과 텍스트로 구성되며, 하단에는 사용자 정보와 로그아웃 기능이 위치합니다.
*   **메인 컨텐츠 영역**:
    *   **상단 영역**: `Timeline`, `Calendar`, `Welcome Banner` 세 개의 카드로 구성되어 사용자가 가장 먼저 확인해야 할 정보를 요약 제공합니다.
    *   **중단 영역**: `Today's appointments` 섹션은 수평 스크롤이 가능한 카드 리스트로 오늘 예정된 환자 목록을 보여줍니다. 각 카드는 환자 이름, 진료 목적, 시간 정보를 포함합니다.
    *   **하단 영역**: `Monthly reports` 섹션은 여러 리포트의 진행 상태를 프로그레스 바로 시각화하여 제공합니다.
*   **플로팅 버튼**: 화면 우측에 위치한 `Chat` 버튼은 어느 화면에서든 빠르게 소통 기능을 실행할 수 있도록 합니다.

### 13.2 개념적 레이아웃 (Conceptual Layout)

두 번째 이미지는 대시보드 레이아웃의 의도를 설명합니다.
*   **Main navigation / menu**: 핵심 메뉴 영역.
*   **Plan of the day?**: 하루의 스케줄을 시간순으로 보여주는 영역.
*   **Actual date or calendar**: 현재 날짜 및 월간 뷰를 제공하는 달력 영역.
*   **Some nice "hello" message with illustration**: 사용자에게 친근한 환영 메시지와 시각적 요소를 제공하는 영역.
*   **To-do's (appointments? reports?)**: 약속, 보고서 등 처리해야 할 작업 목록을 보여주는 핵심 영역.

### 13.3 타이포그래피 (Typography)

세 번째 이미지는 'Sofia Pro' 폰트를 사용한 타이포그래피 시스템을 보여줍니다. 이 가이드에서는 'Pretendard'로 대체하여 적용합니다.

*   **Heading 1 (52p, Bold)**: `Your dashboard` - 페이지의 가장 큰 제목.
*   **Heading 2 (32p, Bold)**: `Today's appointments`, `Monthly reports` - 주요 섹션의 제목.
*   **Heading 3 (24p, Bold)**: `Treatment report` - 카드나 컴포넌트의 제목.
*   **Body (18p, Bold/Medium)**:
    *   **Bold**: `Jessica Ashcroft` - 강조가 필요한 텍스트 (이름 등).
    *   **Medium**: `Follow-up`, `Next, 08:00` - 일반 본문 및 보조 정보.
*   **Message (24p, Medium)**: `Don't forget to...` - 배너 등에서 사용되는 설명 텍스트.

### 13.4 색상 팔레트 (Color Palette)

네 번째 이미지는 색상 시스템을 정의합니다.

*   **Main/Brand Color**: `#1479FF` (활성, 주요 버튼), 10% Opacity 버전 (배경, 비활성 요소).
*   **Basic Colors**:
    *   `#193B68`: 기본 텍스트 색상.
    *   `#FFFFFF`: 컨테이너 배경색.
    *   `#193B68` (10% Opacity): 보조 텍스트 또는 배경색.
*   **Accents**: `#14D2FF`, `#14A5FF`, `#14EBFF` - 메인 컬러와 조화를 이루는 강조 색상들로, 데이터 시각화나 특정 상태 표시에 사용될 수 있습니다.
*   **Shadow**: 모든 그림자는 메인 컬러에 30% 투명도를 적용하여 일관성을 유지합니다.

### 13.5 컴포넌트 스타일 (Component Styles)

다섯 번째 이미지는 주요 UI 컴포넌트의 스타일을 정의합니다.

*   **Containers**:
    *   **기본**: Radius 24p, Blur 30의 부드러운 그림자.
    *   **테두리 강조**: Radius 24p, 2px의 메인 컬러 테두리와 내부 그림자.
    *   **강조**: Radius 40p, Y축으로 길게 드리워진 강한 그림자 (blur 53).
*   **Icon Boxes**:
    *   **활성**: 메인 컬러 배경, Radius 32p, 강한 그림자. 아이콘은 흰색.
    *   **비활성**: 메인 컬러 10% 배경, Radius 32p, 그림자 없음. 아이콘은 메인 컬러.
*   **Buttons**:
    *   **Primary action**: 메인 컬러 배경, 흰색 텍스트.
    *   **Active event**: 흰색 배경, 메인 컬러 테두리 및 텍스트.
    *   **Secondary action**: 흰색 배경, 회색 테두리, 어두운 텍스트.
    *   **Inactive event**: 연한 회색 배경, 회색 테두리 및 텍스트.

### 13.6 아이콘 및 이미지 (Iconography & Image Treatment)

여섯 번째 이미지는 아이콘과 이미지 사용 규칙을 보여줍니다.

*   **Icons on basic tiles**: 진한 배경 위에 흰색 Outline 아이콘.
*   **Icons on accent tiles**: 연한 배경 위에 메인 컬러 Outline 아이콘.
*   **Detail icons**: 배경 없이 라인으로만 구성된 아이콘.
*   **Image treatment**: 사용자 프로필 이미지 등에 상태를 나타내는 인디케이터(파란 점)를 사용할 수 있음을 보여줍니다. (`After` 이미지)

---

## 14. 변경 이력
- v2.0 (2025.01): 아티클 기반 전면 개편 - 5가지 스타일 원칙 적용
- v1.0 (2025.01): 초기 버전