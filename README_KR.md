# WriteAlive (살리고 글쓰기 도우미)

> **살리고 글쓰기 방법론 기반 AI 보조 글쓰기 도구**

WriteAlive는 **살리고 글쓰기**를 연습할 수 있도록 돕는 Obsidian 플러그인입니다. **김창준님**이 개발한 생성적이고 반복적인 글쓰기 접근법으로, Christopher Alexander의 "The Nature of Order"에 나오는 전체성(Wholeness), 센터(Centers), 생성적 시퀀스(Generative Sequence) 개념과 Bill Evans의 의도적 연습 철학을 결합했습니다.

## 🌱 핵심 철학

### 전통적 글쓰기의 문제점
- 높은 에너지 장벽: 시작하기 전에 완전한 개요 필요
- 노트에 흩어진 아이디어가 일관된 글이 되지 못함
- 빈 페이지 앞에서 겪는 작가의 블록
- 경직된 구조가 창의적 발견을 죽임

### 살리고 글쓰기의 해법
- **낮은 에너지 시작**: 단 하나의 씨앗 아이디어로 시작
- **생성적 성장**: 글을 쓰기 전이 아니라 쓰면서 구조 발견
- **센터 기반 진화**: 강한 아이디어가 자연스럽게 약한 것을 강화
- **반복적 개선**: 막연한 근사보다 작고 진실한 단계들

### 빌 에반스의 연습 철학에서 영감
> "전체를 막연하게 근사하지 말고, 작은 부분을 완전히 진실하게, 완전히 현실적으로, 완전히 정확하게 해라."

## ✨ 주요 기능 (MVP)

### 🌱 씨앗 모으기 & MOC 통합
- **씨앗 모으기**: 전체 볼트에서 태그된 아이디어를 자동으로 수집
  - 설정 가능한 씨앗 태그: `#seed`, `#idea`, `#💡`, `#씨앗`, 또는 사용자 정의 태그
  - 여러 태그 지원 (설정된 태그 중 하나라도 일치하는 노트 찾기)
  - 다국어 지원: 한글과 영문 태그가 원활하게 작동
- **MOC 통합**: Map of Contents 노트에서 글쓰기 시작
  - `#moc` 태그, 폴더 패턴, YAML frontmatter와 함께 작동
- **살아있는 MOC**: 특정 주제와 일치하는 새 씨앗으로 MOC 자동 업데이트
  - MOC별 태그 설정: 예) `seed_tags: [creativity, practice, 창의성]`
  - 세 가지 모드: 실시간, 일일 알림, 수동
  - 수동으로 작성한 내용은 절대 덮어쓰지 않음
- 마찰 없는 경로: "읽으면서 메모" → "일관된 에세이"
- 기존 Zettelkasten, PARA 및 기타 PKM 워크플로우와 호환

### 🎯 AI 보조 센터 발견
- 글에서 가장 강한 "센터" 식별
- 글이 자연스럽게 성장하고 싶어하는 방향 제안
- Claude, GPT, Gemini 지원

### 🌿 생성적 확장
- AI가 아이디어를 발전시킬 여러 방향 제안
- 가장 살아있다고 느껴지는 경로 선택
- 복잡성을 키우면서 전체성 유지

### 📊 전체성 분석
- 구조적 일관성 정량화 (1-10 척도)
- 반복을 통해 글의 "생명력"이 향상되는 과정 추적
- 문서 진화에 대한 시각적 피드백

### 🔄 버전 스냅샷
- 변환 체크포인트 저장
- 버전 비교로 구조적 개선 확인
- 롤백 기능으로 안전한 실험

### 🎓 학술적 글쓰기 지원
- 선택적 문단 라벨링 ([주장], [근거], [분석])
- 일관된 문단 구조를 위한 통일성 검사
- 생성적 자유와 학술적 엄격함 사이의 다리

## 📚 문서

### 시작하기
- **[튜토리얼 (한국어)](docs/TUTORIAL-KO.md)** - 구체적 사례로 배우는 실습 가이드
  - 살리고 글쓰기를 단계별로 체험
  - 실제 시나리오로 학습
  - 빌 에반스 철학 적용 연습

- **[TUTORIAL (English)](docs/TUTORIAL-EN.md)** - Hands-on tutorial with concrete examples
  - Experience Saligo Writing step-by-step
  - Learn through realistic scenarios
  - Practice with Bill Evans' philosophy

### 필수 문서
- **[PRD.md](docs/PRD.md)** - 제품 요구사항 명세서
  - 제품 비전과 목표
  - 사용자 페르소나와 여정
  - 핵심 사용자 스토리 (Epic 0-7)
  - 성공 지표 및 수락 기준

- **[PLAN.md](docs/PLAN.md)** - 기술 설계 및 구현 계획
  - 시스템 아키텍처 및 데이터 모델
  - 기술 스택 결정
  - 31개 변환 작업 (8-9주 로드맵)
  - 테스트 및 배포 전략

- **[TRANSFORMATIONS.md](docs/TRANSFORMATIONS.md)** - 변환 로그
  - 완료된 모든 변환
  - 구현 세부사항 및 근거
  - 설계 결정 및 트레이드오프

- **[CLAUDE.md](CLAUDE.md)** - 개발 철학
  - 변환 중심 AI 페어 프로그래밍 원칙
  - 생성적 시퀀스 기반 개발 루프
  - 코딩 표준 및 산출물 구조

### 참고 자료
- **[WriteAlive 개요](docs/reference/WriteAlive-살리고%20글쓰기%20도우미.md)** - 원본 개념 문서 (한국어)
- **[Bill Evans - Creative Process](docs/reference/20251101%20Universal%20Mind%20of%20Bill%20Evans%20-%20Creative%20Process%20and%20Self-Teaching.md)** - 연습 철학 영감
- **[Bill Evans - 연습 방법](docs/reference/20251101%20성공의%20단계에%20이르는%20빌%20에반스의%20연습%20방법.md)** - 한국어 요약

### 구현 세부사항
- **[docs/implementation/](docs/implementation/)** - 단계별 구현 요약 및 검증 체크리스트
- **[docs/transformations/](docs/transformations/)** - 개별 변환 기록 (T-YYYYMMDD-###)

## 🛠️ 기술 스택

- **플랫폼**: Obsidian Plugin (Desktop + Mobile)
  - 데스크탑: Windows, macOS, Linux
  - 모바일: Android 7.0+, iOS 14.0+
- **언어**: TypeScript
- **UI 프레임워크**: React (데스크탑), Native Obsidian Components (모바일)
- **AI 통합**: Claude 3.5 Sonnet (주), GPT/Gemini로 확장 가능
- **빌드 도구**: esbuild
- **테스팅**: Vitest
- **i18n**: 한국어 + 영어
- **모바일 전용**: 음성 입력, 오프라인 큐, 사진 캡처

## 🚀 시작하기 (개발자용)

### 사전 요구사항
- Node.js 18+
- Obsidian 1.4.0+

### 설치
```bash
# 저장소 복제
git clone https://github.com/yourusername/WriteAlive.git
cd WriteAlive

# 의존성 설치
npm install

# 플러그인 빌드
npm run build

# 개발 모드 (watch)
npm run dev
```

### Obsidian에서 테스트
1. `dist/` 내용을 테스트 볼트의 `.obsidian/plugins/writealive/`에 복사
2. Obsidian 설정 → 커뮤니티 플러그인에서 "WriteAlive" 활성화
3. 플러그인 설정에서 AI API 키 구성

## 📖 사용 예시

### 방법 1: 씨앗 모으기 (즉흥적 아이디어)

**주말 - 모바일 + 데스크탑 워크플로우**:

📱 **토요일 아침** (지하철, 책 읽기):
- 책에서 영감을 주는 인용구 발견
- Obsidian Mobile 열기 → "Quick Seed" 탭
- 페이지 사진 + 음성: "알렉산더 센터 개념"
- 자동 태그: `#seed #reading` → 5초 만에 저장

📱 **토요일 오후** (카페, 영상 시청):
- 빌 에반스 인용구 듣기
- 빠른 메모: "근사보다 진실" `#idea #practice`
- 오프라인 모드 → 동기화 대기열

📱 **일요일 아침** (공원 산책):
- 나무가 자라는 모습 관찰 → 음성 메모
- "나무는 줄기에서 바깥으로 자란다" `#씨앗 #자연관찰`

💻 **일요일 저녁** (데스크탑, 글쓰기 준비):
1. 모바일 씨앗 3개 자동 동기화됨
2. 명령: `WriteAlive: Gather Seeds`
3. 모든 씨앗 발견 (한글 `#씨앗` + 사진도!)
4. 씨앗 선택 → AI가 센터 제안 → 30분 → 600단어 초안

**설정**: 구성된 태그: `seed, idea, 씨앗, 💡`
**크로스 디바이스**: 모바일에서 캡처한 씨앗이 데스크탑에서 즉시 사용 가능

### 방법 2: MOC 통합 (구조화된 지식)

**기존 MOC**: "창의성과 연습.md"
```markdown
---
writealive:
  auto_gather_seeds: true
  seed_tags: [creativity, practice, 창의성]
  update_frequency: daily
---

# 창의성과 연습

## 기초 개념 (수동)
- [[Christopher Alexander - Centers]]
- [[Bill Evans - Truth over Approximation]]

## 최근 씨앗 (자동 업데이트)
<!-- BEGIN WRITEALIVE-AUTO -->
- [[2025-11-01]] - "Alexander: centers" #creativity #seed
- [[2025-11-02]] - "Evans: truth" #practice #idea
- [[2025-11-03]] - "자연스러운 성장" #창의성 #씨앗
<!-- END WRITEALIVE-AUTO -->
```

**자동으로 일어난 일**:
- 월요일-수요일: 사용자가 관련 태그로 3개 노트 생성
- WriteAlive가 일치 항목 감지 및 AUTO 섹션 업데이트
- 목요일 알림: "'창의성' MOC에 새 씨앗 3개"

**글쓰기 준비**:
1. 명령: `WriteAlive: Start from MOC`
2. "창의성과 연습" 선택
3. 수동 링크 + 자동 수집 씨앗 모두 가져오기
4. AI: "이번 주 MOC가 성장했습니다. 다국어 주제를 발견했네요..."

**핵심 이점**: MOC가 자동으로 최신 상태 유지. 수동 정리 불필요.

## 🗺️ 로드맵

### Phase 0: 기초 (1주차) - 현재
- [x] PRD 및 기술 설계
- [ ] 프로젝트 스캐폴드
- [ ] API 키 암호화를 포함한 설정 UI

### Phase 1: AI 인프라 (2-3주차)
- [ ] 사용자 정의/다중 태그 지원 씨앗 모으기
- [ ] **모바일 빠른 캡처 UI** (음성 + 사진 + 텍스트)
- [ ] MOC 감지 및 파싱
- [ ] 살아있는 MOC 자동 업데이트 시스템
- [ ] **오프라인 큐 및 동기화**
- [ ] 센터 찾기 로직 (데스크탑만)
- [ ] 전체성 분석 (데스크탑만)

### Phase 2: 사용자 인터페이스 (4-5주차)
- [ ] 명령 팔레트 통합
- [ ] 씨앗 선택 모달
- [ ] MOC 선택 모달
- [ ] 센터 하이라이팅

### Phase 3: 개선 (6-7주차)
- [ ] 확장 프롬프트
- [ ] 읽기 피드백
- [ ] i18n (한국어/영어)

### Phase 4: 릴리스 (8-9주차)
- [ ] 테스팅 및 QA
- [ ] 문서화
- [ ] Obsidian 커뮤니티 플러그인 제출

**상세 변환 분류는 [PLAN.md](docs/PLAN.md) 참조**

## 🤝 기여하기

이 프로젝트는 **변환 중심 개발** 원칙을 따릅니다:

1. 모든 변경사항은 **변환**(T-YYYYMMDD-###)입니다
2. 각 변환은 단순히 기능을 추가하는 것이 아니라 **구조적 생명**을 향상시킵니다
3. 명확한 수락 기준을 가진 작고 테스트 가능한 개선
4. 코드와 함께 진화하는 살아있는 문서

개발 가이드라인은 [CLAUDE.md](CLAUDE.md) 참조.

## 📄 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 🙏 감사의 말

- **김창준 (June Kim)** - 살리고 글쓰기 방법론 창시자
- **Christopher Alexander** - "The Nature of Order" 개념: 전체성, 센터, 생성적 시퀀스
- **Bill Evans** - 연습 철학: 근사보다 진실, 단계적 숙달
- **Obsidian Community** - 플랫폼 및 플러그인 생태계

## 📬 연락처

- **이슈**: [GitHub Issues](https://github.com/blcktgr73/WritingAlive/issues)
- **토론**: [GitHub Discussions](https://github.com/blcktgr73/WritingAlive/discussions)

---

> **살리고 (Saligo)** = "Making Alive" — 단순한 글쓰기가 아니라, 구조적 향상을 통해 아이디어에 생명을 불어넣기

**상태**: 🚧 활발한 개발 중 (MVP Phase 0)
**버전**: 0.1.0-alpha
**최종 업데이트**: 2025-11-01
