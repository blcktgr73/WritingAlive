# 기술 설계 문서: WriteAlive

**버전**: 1.0
**최종 업데이트**: 2025-11-01
**상태**: 살아있는 문서 (변환과 함께 진화)
**관련 문서**: [PRD-KR.md](./PRD-KR.md) | [CLAUDE.md](../CLAUDE.md)

---

## 요약

이 기술 설계 문서는 **김창준**이 개발하고 Christopher Alexander의 "The Nature of Order"와 Bill Evans의 단계별 학습 철학에서 영감을 받은 살리고 글쓰기(살리고 글쓰기) 방법론을 기반으로 한 AI 지원 글쓰기 도구인 WriteAlive를 구현하기 위한 포괄적인 청사진을 제공합니다.

**MVP 범위**: Claude API 통합 + 모바일 지원이 있는 Obsidian 플러그인
**타임라인**: 8-9주 (34개 변환)
**목표**: 씨앗 기반 생성, AI 지원 중심 발견, 통합성 분석 및 반복적 개선을 통한 낮은 마찰 글쓰기 지원

**주요 아키텍처 결정**:
- 플랫폼: Obsidian 플러그인 (데스크톱 + 모바일) → 웹 앱 (MVP 이후)
- AI 제공자: Claude 3.5 Sonnet (주요)
- 저장소: YAML 프론트매터 + 로컬 파일 시스템
- 아키텍처 패턴: 명확한 추상화를 가진 서비스 지향
- 개발 방법론: 변환 중심 (CLAUDE.md에 따라)
- **모바일 우선**: 핵심 기능 (씨앗 캡처, MOC 보기)이 첫날부터 모바일에 최적화됨

---

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [기술 스택 결정](#2-기술-스택-결정)
3. [데이터 모델 및 저장소 아키텍처](#3-데이터-모델-및-저장소-아키텍처)
4. [API 설계 및 AI 통합](#4-api-설계-및-ai-통합)
5. [보안 및 성능 아키텍처](#5-보안-및-성능-아키텍처)
6. [변환 기반 작업 분류](#6-변환-기반-작업-분류)
7. [테스트 전략](#7-테스트-전략)
8. [배포 및 릴리스 전략](#8-배포-및-릴리스-전략)
9. [미해결 기술 결정](#9-미해결-기술-결정)

---

## 1. 시스템 아키텍처 개요

### 1.1 고수준 구성 요소 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 환경                                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  Obsidian   │  │  Markdown   │  │    로컬      │        │
│  │    Vault    │  │    파일     │  │   저장소     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                WriteAlive 플러그인 코어                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  플러그인 메인 (라이프사이클, 명령, 설정)              │  │
│  └────┬─────────────────────┬─────────────────────┬─────┘  │
│       │                     │                     │         │
│  ┌────▼─────┐   ┌──────────▼────────┐   ┌────────▼─────┐  │
│  │    UI    │   │  서비스 레이어     │   │   저장소     │  │
│  │ 컴포넌트 │◄──┤  - AIService      │◄──┤   관리자     │  │
│  │  (React) │   │  - CenterAnalyzer │   │ (Frontmatter │  │
│  │          │   │  - Wholeness Eval │   │   + 스냅샷)  │  │
│  └──────────┘   │  - RateLimiter    │   └──────────────┘  │
│                 │  - CacheService   │                      │
│                 └───────────┬───────┘                      │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────┐
│              외부 서비스 (AI 제공자)                         │
│         ┌────────────┐      │      ┌────────────┐           │
│         │   Claude   │◄─────┴─────►│ GPT (나중) │           │
│         │   3.5      │              │            │           │
│         │  Sonnet    │              │  Gemini    │           │
│         │  (MVP)     │              │  (나중)    │           │
│         └────────────┘              └────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 컴포넌트

#### 1.2.1 플러그인 코어 (`src/main.ts`)
**책임**: Obsidian 플러그인 라이프사이클, 명령 등록, 설정 관리

**주요 인터페이스**:
```typescript
interface WriteAlivePlugin extends Plugin {
  settings: WriteAliveSettings;
  aiService: AIServiceLayer;
  storageManager: StorageManager;

  onload(): Promise<void>;
  onunload(): void;
  registerCommands(): void;
  registerUI(): void;
}
```

#### 1.2.2 AI 서비스 레이어 (`src/services/ai/`)
**책임**: AI 제공자 상호작용 추상화, API 호출 관리, 속도 제한/캐싱 처리

**주요 인터페이스**:
```typescript
interface AIService {
  findCenters(text: string, context?: string): Promise<Center[]>;
  suggestExpansions(center: Center): Promise<ExpansionPrompt[]>;
  analyzeWholeness(document: string): Promise<WholenessAnalysis>;
  checkParagraphUnity(paragraph: string): Promise<UnityCheck>;
}

interface AIProvider {
  name: 'claude' | 'gpt' | 'gemini';
  makeRequest(prompt: PromptTemplate, params: any): Promise<AIResponse>;
  estimateCost(tokens: number): number;
}
```

#### 1.2.3 저장소 관리자 (`src/services/storage/`)
**책임**: YAML 프론트매터를 통해 문서 메타데이터, 스냅샷, 버전 관리

**주요 인터페이스**:
```typescript
interface StorageManager {
  readMetadata(file: TFile): Promise<DocumentMetadata>;
  updateMetadata(file: TFile, metadata: Partial<DocumentMetadata>): Promise<void>;
  createSnapshot(file: TFile, name: string): Promise<Snapshot>;
  listSnapshots(file: TFile): Promise<Snapshot[]>;
  compareSnapshots(snap1: Snapshot, snap2: Snapshot): Diff;
}
```

#### 1.2.4 중심 분석기 (`src/services/analysis/center-analyzer.ts`)
**책임**: 중심 식별을 위한 AI 응답 처리, 제안 검증

**주요 인터페이스**:
```typescript
interface Center {
  id: string;
  text: string;
  position: { start: number; end: number };
  paragraph: number;
  confidence: number;
  timestamp: string;
  source: 'ai-suggested' | 'user-identified';
  accepted: boolean;
  explanation?: string;
}
```

#### 1.2.5 통합성 평가자 (`src/services/analysis/wholeness-evaluator.ts`)
**책임**: 통합성 지표 계산, 구조적 간격 식별

**주요 인터페이스**:
```typescript
interface WholenessAnalysis {
  score: number; // 1-10
  paragraphUnity: UnityScore[];
  transitions: TransitionStrength[];
  centerHierarchy: CenterNode[];
  gaps: Gap[];
  suggestions: string[];
}
```

### 1.3 데이터 흐름: 씨앗 → 중심 발견

```
사용자가 씨앗 작성 → 텍스트 선택 → "중심 찾기" 명령
  ↓
플러그인이 텍스트 + 컨텍스트 추출 (±2문단)
  ↓
AIService.findCenters(text, context)
  ↓
ClaudeProvider가 살리고 글쓰기 컨텍스트로 프롬프트 구성
  ↓
Claude API /v1/messages로 POST
  ↓
JSON 응답 파싱 → Center[]
  ↓
CenterFinderModal에 표시 (수락/거부)
  ↓
사용자 수락 → StorageManager.updateMetadata()
  ↓
YAML 프론트매터 업데이트 → 편집기에서 중심 강조 표시
```

---

## 5. 보안 및 성능 아키텍처

### 5.1 API 키 암호화
- AES-GCM (256비트)를 사용한 Web Crypto API
- PBKDF2를 통한 기기별 키 (100k 반복)
- 암호화당 랜덤 IV
- Obsidian LocalStorage에 저장 (암호화됨)

### 5.2 성능 최적화
- React 컴포넌트 지연 로딩
- 디바운스된 자동 저장 (데스크톱 30초, 모바일 2초)
- 증분 통합성 분석 (변경된 문단만 재분석)
- AI 응답 캐싱 (24시간 TTL)
- **모바일 특정**:
  - 업로드 전 이미지 압축 (최대 1MB)
  - 공격적인 요청 일괄 처리
  - 애니메이션/전환 감소
  - 로컬 우선 아키텍처 (오프라인 대기열)

### 5.3 모바일 특정 고려사항

#### 플랫폼 지원
- **Android**: Obsidian Mobile 1.4.0+ (API Level 24+, Android 7.0+)
- **iOS**: Obsidian Mobile 1.4.0+ (iOS 14.0+)
- **터치 최적화**: 최소 탭 대상 44x44px (Apple HIG, Material Design)
- **화면 크기**:
  - 모바일: 360x640 (소형) ~ 414x896 (대형)
  - 태블릿: 768x1024 ~ 1024x1366

#### 모바일 UI 제약

**모바일에서 잘 작동하는 것** (MVP):
- ✅ 빠른 씨앗 캡처 (음성 + 텍스트 + 사진)
- ✅ MOC 찾아보기 (읽기 전용)
- ✅ 수집된 씨앗 검토
- ✅ 태그 지정 및 정리
- ✅ 동기화 상태 가시성

**모바일에서 작동하지 않는 것** (데스크톱 전용):
- ❌ AI 중심 발견 (확장된 집중 + 화면 공간 필요)
- ❌ AI 제안이 있는 문서 편집 (복잡한 UI)
- ❌ 통합성 분석 시각화 (너무 복잡함)
- ❌ 다중 열 레이아웃
- ❌ 드래그 앤 드롭 재정렬

#### 모바일 특정 기술 스택
- **모바일 UI에 React 없음**: 네이티브 Obsidian Mobile 컴포넌트 사용 (더 가벼움)
- **음성 입력**: 플랫폼 네이티브 Speech Recognition API
  - Android: `SpeechRecognizer`
  - iOS: `SFSpeechRecognizer`
- **사진 캡처**: Obsidian의 파일 첨부 API
- **오프라인 저장소**: IndexedDB + LocalForage (크로스 플랫폼)
- **터치 제스처**: Hammer.js 또는 네이티브 터치 이벤트

#### 오프라인 우선 아키텍처
```typescript
interface OfflineQueue {
  queueSeed(seed: Seed): void;
  syncWhenOnline(): Promise<void>;
  getQueueStatus(): { pending: number, synced: number };
}
```

**동기화 전략**:
1. 사용자가 모바일에서 씨앗 캡처 → 즉시 로컬 IndexedDB에 저장
2. 백그라운드 동기화가 30초마다 시도 (온라인인 경우)
3. 앱 재개 시: 강제 동기화 시도
4. 명확한 표시기 표시: "동기화 대기 중인 씨앗 3개"

#### 성능 목표 (모바일)
- **콜드 스타트**: 앱 준비까지 < 2초
- **씨앗 캡처**: 탭에서 저장까지 < 5초
- **음성 입력**: 녹음 시작까지 < 500ms
- **사진 첨부**: 압축 + 첨부까지 < 3초
- **동기화**: 씨앗의 95%에 대해 < 5분
- **배터리**: 유휴 동기화 시간당 < 2% 소모

#### 테스트 전략 (모바일)
- **실제 기기 테스트**:
  - Android: Samsung Galaxy S21 (중급)
  - iOS: iPhone 12 (중급)
- **에뮬레이터 테스트**: Android Studio + Xcode Simulator
- **네트워크 조건**: 3G, 4G, WiFi, 오프라인에서 테스트
- **배터리 테스트**: 동기화 중 배터리 소모 모니터링

---

## 6. 변환 기반 작업 분류

**총**: 8-9주에 걸쳐 34개 변환

### 단계 요약

**단계 0: 기초** (1주차) - T-001 ~ T-003
- 프로젝트 스캐폴드, 설정 UI, 암호화

**단계 1: AI 인프라** (2-3주차) - T-004 ~ T-011
- AI 서비스 레이어, Claude 제공자, 프롬프트, **씨앗 수집**, **MOC 감지**, **살아있는 MOC 자동 업데이트**, 중심 찾기, 통합성 분석

**단계 2: 저장소** (3-4주차) - T-012 ~ T-015
- YAML 프론트매터 관리자, 스냅샷, diff, 속도 제한

**단계 3: 사용자 인터페이스** (4-5주차) - T-016 ~ T-022
- 명령, 씨앗 모달, **MOC 모달**, 중심 모달, 패널, 강조 표시, 비용 경고

**단계 4: 개선 기능** (6주차) - T-023 ~ T-026
- 확장 프롬프트, 소리내어 읽기, 라벨링, 통일성 검사기

**단계 5: 광택** (7주차) - T-027 ~ T-029
- i18n, 오류 처리, 문서화

**단계 6: 테스트** (8주차) - T-030 ~ T-032
- 단위 테스트, 통합 테스트, QA 체크리스트

**단계 7: 릴리스** (8-9주차) - T-033 ~ T-034
- 플러그인 제출, 살아있는 문서

### 주요 변환 세부사항

**T-20251101-001: 플러그인 스캐폴드 초기화**
- 의도: 구조적 성장을 위한 기초 확립
- 수락: 플러그인 로드, 빌드, 린트 성공적으로
- 시간: 1-2시간

**T-20251101-007: 볼트에서 씨앗 수집 구현**
- 의도: 분산된 노트를 글쓰기 시작에 연결 (마찰 없는 캡처 → 생성)
- 수락:
  - `#seed` 또는 `#writealive-seed` 태그를 볼트에서 검색
  - 다음과 함께 목록 반환: 노트 제목, 씨앗 텍스트, 생성 날짜, 백링크
  - 날짜 범위별 필터 (예: "이번 주", "이번 달")
  - 미리보기 + 선택이 있는 모달로 표시
- 종속성: T-004 (AI 서비스), T-005 (Claude 제공자)
- 시간: 2시간

**T-20251101-008: MOC 감지 및 파싱 구현**
- 의도: 기존 지식 조직 워크플로 지원 (Zettelkasten, PARA 등)
- 수락:
  - 다음을 통해 MOC 감지: 폴더 경로 패턴, `#moc` 태그, 또는 YAML `type: moc`
  - MOC 구조 파싱 (제목, 링크, 계층)
  - 메타데이터와 함께 모든 링크된 노트 추출
  - 성능을 위한 MOC 인덱스 캐싱
- 종속성: T-004 (볼트 액세스)
- 시간: 2시간

**T-20251101-009: 살아있는 MOC 자동 업데이트 시스템 구현**
- 의도: MOC를 일일 노트 작성과 함께 진화하는 살아있는 문서로 만들기
- 수락:
  - 볼트 파일 감시자가 `#seed` 태그가 있는 새/수정된 노트 모니터링
  - 프론트매터에 `writealive.auto_gather_seeds: true`가 있는 MOC 감지
  - MOC의 `seed_tags` 목록에 대해 씨앗 태그 일치
  - `<!-- BEGIN WRITEALIVE-AUTO -->` 마커를 찾기 위해 MOC 파싱
  - 자동 섹션에 새 씨앗 링크 삽입 (최신순 정렬)
  - 세 가지 업데이트 모드: 실시간, 일일 알림, 수동 제안
  - 마커 외부 콘텐츠를 절대 수정하지 않음
  - 마지막 자동 업데이트에 대한 실행 취소/되돌리기 지원
- 종속성: T-008 (MOC 감지)
- 시간: 2-3시간

**T-20251101-010: 중심 찾기 로직 구현**
- 의도: AI 지원 중심 발견 활성화 (핵심 기능)
- 수락: 컨텍스트 추출, AI 호출, 위치가 있는 중심 파싱
- 시간: 2시간

**T-20251101-015: 씨앗 수집 모달 생성**
- 의도: 볼트에서 씨앗을 선택하는 사용자 친화적 인터페이스
- 수락:
  - 모달이 메타데이터와 함께 수집된 씨앗 표시
  - 미리보기 창이 전체 노트 컨텍스트 표시
  - 다중 선택 기능
  - "선택한 씨앗으로 글쓰기 시작" 작업
- 시간: 2시간

**T-20251101-016: MOC 선택 모달 생성**
- 의도: MOC에서 글쓰기를 시작하는 사용자 친화적 인터페이스
- 수락:
  - 모달이 메타데이터와 함께 사용 가능한 MOC 표시 (제목, 링크 수, 마지막 수정)
  - 미리보기 창이 MOC 구조 및 링크된 노트 표시
  - "글쓰기 시작"이 MOC 컨텍스트로 문서 생성
  - 전체 노트 내용 확장 또는 발췌 사용 옵션
  - MOC 감지 패턴을 구성하는 설정
- 시간: 2시간

**T-20251101-017: 중심 선택 모달 생성**
- 의도: 사용자 친화적 중심 검토 인터페이스
- 수락: 모달이 제안 표시, 수락/거부, 키보드 탐색
- 시간: 2시간

**T-20251101-026: i18n 구현**
- 의도: 이중 언어 접근성 (한국어/영어)
- 수락: i18next 설정, 번역 완료, 자동 감지
- 시간: 2시간

(전체 작업 세부사항은 위 원본 PLAN.md 섹션 참조)

---

## 7. 테스트 전략

### 테스트 피라미드
- 단위 테스트: ~100개 이상 케이스 (Vitest), 80% 커버리지
- 통합 테스트: ~15개 케이스 (선택 사항, 실제 API 호출)
- 수동 QA: ~10개 테스트 시나리오

### 단위 테스트 예시
```typescript
describe('ClaudeProvider', () => {
  it('중심을 찾습니다', async () => {
    const provider = new ClaudeProvider('test-key');
    const centers = await provider.findCenters('텍스트');
    expect(centers).toHaveLength(1);
  });
});
```

---

## 8. 배포 및 릴리스 전략

### 개발
```bash
npm install && npm run dev
# 편집 → 저장 → 자동 재빌드 → Obsidian 재로드
git commit -m "T-YYYYMMDD-###: 설명"
```

### 버전 관리
- 0.1.0: 알파
- 1.0.0: MVP 릴리스

### 릴리스 프로세스
1. BRAT를 통한 베타 (20명 이상 테스터, 2주)
2. Obsidian 커뮤니티 플러그인에 제출
3. 검토 대기 (1-4주)
4. 공개 릴리스

---

## 9. 미해결 기술 결정

### 조사 필요
1. **UI용 CodeMirror vs React**: 하이브리드 접근 방식 권장
2. **대용량 문서 처리**: 슬라이딩 윈도우 + 20k 단어 제한
3. **로컬 LLM 지원**: 수요가 있는 경우 MVP 이후
4. **스냅샷 동기화**: 볼트에 저장 (.writealive/ 폴더)

### 논의를 위한 트레이드오프
1. **AI 품질 vs 비용**: MVP에는 Claude만
2. **원격 측정**: MVP용 없음 (개인정보 우선)
3. **수익 창출**: 무료 BYOK, 나중에 평가

### 기술적 위험
1. **Obsidian API 변경**: 버전 고정, 변경 로그 모니터링
2. **Claude 가격 변경**: 다중 제공자 지원, 캐싱
3. **프롬프트 저하**: 버전 관리, A/B 테스트

---

## 요약 및 다음 단계

### 주요 결과물
- PLAN-KR.md, TRANSFORMATIONS-KR.md, BACKLOG.md, DECISIONS.md, ARCHITECTURE.md
- QA_CHECKLIST.md, USER_GUIDE.md
- 80% 이상 테스트 커버리지가 있는 완전한 플러그인 코드베이스

### 프로젝트 구조
```
src/
├── main.ts
├── services/ (ai, storage, analysis)
├── ui/ (React 컴포넌트)
├── models/ (TypeScript 타입)
└── utils/

tests/
├── unit/
└── integration/
```

### 즉각적인 다음 단계
1. 이해관계자와 이 PLAN-KR.md 검토
2. PRD 요구사항에 대해 검증
3. T-20251101-001 시작 (프로젝트 스캐폴드)
4. 주간 변환 검토 회의 설정
5. 각 마일스톤과 함께 살아있는 문서화 업데이트

---

**문서 상태**: 초안 - 이해관계자 검토 대기
**생성됨**: 2025-11-01
**작성자**: Claude (변환 에이전트)
**총 변환**: 8-9주에 걸쳐 30개
**PRD 버전**: 1.0

> **살아있는 문서**: 이 PLAN-KR.md는 프로젝트와 함께 진화합니다. 각 변환은 이 계획을 다시 참조하고 실제 결과로 TRANSFORMATIONS-KR.md를 업데이트해야 합니다.
