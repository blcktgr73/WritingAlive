# Skill: story-authoring

> 러프한 아이디어(또는 실제 소스)를 승인된 **Requirement → User Story Map → AC** 로
> **가이드 Q&A** 를 통해 정리한다. 업스트림 planning (코드/구현 전).
> `verify-ac` 의 짝: **authoring 이 spec 을 만들고, verify-ac 가 구현을 검증**한다.
> **정본 절차** (런타임 무관). 기준: palab-platform [user-story-verification-governance](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/user-story-verification-governance.md).
> 산출물: `docs/specs/USER_STORY_MAP.md`, `docs/specs/AC.md` (+ 필요시 PRD / MVP scope).

## 언제 실행

- 아이디어는 있으나 안정된 제품 정의가 없을 때.
- 스펙/코드 전에 story map / AC 를 세우고 싶을 때.
- 승인 기반 초안 작성을 원할 때 (직접 구현이 아니라).

## Mode (시작 시 1회 선언)

- `greenfield` — 처음부터 정의
- `revision` — 큰 기능 추가/변경으로 기존 정의 개정
- `handoff` — 다른 사람/봇에게 넘기기 위한 정리

## Stage (매 라운드 선언)

`discover` → `draft` → `approve` → `handoff`

## 절차

1. Mode/Stage 선언. 실제 소스(회의/문서/데이터)가 있으면 **소스 메타를 먼저 고정**한다.
2. **small rounds** — 한 번에 1~3개 high-signal 질문만. 거대 설문 금지.
3. 가장 작은 안정 산출물 우선: Requirement → **Theme(Concept: State/Actions/Operational Principle/Invariants)** → Epic → Story → AC 분해.
4. 매 라운드 **승인 / 모호 / 블록 / 미해결**을 요약한다.
5. 현재 증거로 뒷받침되는 것만 draft. 갭은 임의로 채우지 말고 **"확인 필요"로 명시**한다.
6. 짧은 승인(`이건 승인` / `빼` / `보류` / `다음`)은 승인 명령으로 처리(같은 질문 반복 금지).
7. 승인 전에는 구현 입력으로 확정하지 않는다.

## Authority (경계)

- **Human**: Requirement/Story 의미, AC 존재, 승인. bot 이 임의 확정 금지.
- **Agent(bot)**: 초안, 구조화, 누락 탐지, AC 분해 제안, drift 지적.

## 가드레일

- product 정의가 coherent 하기 전에 코드/구현 계획으로 점프하지 않는다.
- 갭을 confident invention 으로 메우지 않는다 — 미해결로 남긴다.
- repo 에 템플릿이 있으면 그것을 따른다 (새 출력 형식 발명 금지).
- 중간에 큰 새 기능이 나오면 `revision` mode 로 전환한다.
- 한국어 출력은 palab-platform [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md) 을 따른다 (짧고 능동적으로, 번역투 지양).

## 출력

- `docs/specs/USER_STORY_MAP.md`, `docs/specs/AC.md` 초안/갱신.
- 승인/미해결 요약 + 다음 stage 제안.
- 확정되면 `verify-ac` 로 넘긴다.
