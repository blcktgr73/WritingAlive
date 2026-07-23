# Skill: kanban-sweep

> 각 bot 이 자기 lane 의 `PALab Ops Kanban` 카드를 점검하고, pickup 가능하면 진행하거나 Neo 에게 보고한다.
> **정본 절차** (런타임 무관). daily sweep cron 이 호출한다.
> 대상은 공유 보드지만 절차는 프로젝트가 carry 하고, 규칙은 palab-platform 을 참조한다 (복제 X).
> spec: [daily-kanban-sweep-model](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/daily-kanban-sweep-model.md), [kanban-card-readiness](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/kanban-card-readiness.md)

## 언제 실행

- 각 bot 런타임의 daily sweep cron (권장 시차: Neo 00:00, Morpheus 00:10, Kusanagi 00:20, Batou 00:30, Tachikoma 00:40 UTC). 또는 요청 시.

## 입력

- 실행 주체 bot 정체성 (Neo / Morpheus / Kusanagi / Batou / Tachikoma).
- `PALab Ops Kanban` (GitHub Project #1, owner blcktgr73).

## 절차

1. **자기 lane 만 본다** (겹치지 않게) — spec §기본 원칙:
   - Neo: `Todo`/`In progress` 재정리, owner 없는 카드, blocker 모호 카드
   - Morpheus: `Owner=Morpheus` 또는 `Type=feature|bug|infra|docs`
   - Kusanagi: `Owner=Kusanagi` 또는 `Type=docs|research|planning|release-notes`
   - Batou: `Owner=Batou` 또는 `Type=security|decision|risk|approval`
   - Tachikoma: `Owner=Tachikoma` 또는 `Type=ops|monitoring|follow-up`, due/재확인 카드
2. **실행 가능 조건 확인** — spec §실행 가능 조건: `Owner`/`Type`/`Blocker` 존재, `Status=Todo|In progress`, blocker 비었거나 해소, 외부 승인/민감 권한 불필요.
3. 조건 충족 + 범위가 문서/리서치/작은 구현/내부 정리면 → **진행**. 아니면 집지 말고 Neo 에게 카드 보강 요청 또는 사유 기록.
4. 상태 변경은 kanban 에, 빠른 로그는 Discord 에 (중요한 건 kanban).
5. `Last checked` 갱신 (Neo).

## 가드레일

- 외부 발신·배포·권한 변경·secret·결제·공개는 **승인 경계 유지** (사람/Batou gate) — spec §바로 실행하면 안 되는 조건.
- `Owner`/`Type`/`Blocker` 중 하나라도 비면 집지 않는다.

## 출력 (보고)

- 변동 없음 → 조용히 (`NO_REPLY`).
- 진전 있음 → 짧게 보고 (착수/완료/막힘).
- blocker/결정 필요 → `#neo-ops` 로 승격.
