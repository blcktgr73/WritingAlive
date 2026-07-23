# Skill: verify-ac

> 변경(또는 요청)에 대해 영향받는 **AC 를 식별**하고, **검증 증거**를 확인하고,
> **Verification Status 를 갱신**하고, **drift 를 표시**한다. = spec 구현이 적절한지 확인하는 절차.
> **정본 절차** (런타임 무관). 판단 기준은 palab-platform governance 를 참조한다 (복제 X).
> spec: [user-story-verification-governance](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/user-story-verification-governance.md)
> 대상 문서(이 repo): `docs/specs/USER_STORY_MAP.md`, `docs/specs/AC.md`, `docs/specs/VERIFICATION.md`

## 언제 실행

- 비트리비얼 변경(PR/commit) 후, 또는 요청 시. "이 구현이 spec 을 적절히 충족했는가" 점검.

## 입력

- 변경 diff 또는 대상 범위.
- 이 repo 의 `docs/specs/*` (Story Map / AC / Verification Status).

## 절차 (governance loop 기준)

1. **영향 AC 식별** — 변경이 건드리는 AC ID 를 찾는다. 없으면 Story Map/AC 누락 여부 확인 → 필요시 신규 AC 제안.
2. **scope 판정** — 각 AC 를 `dev` / `ops` / `both` 로 구분.
3. **증거 확인** — unit / component / contract / mocked-integration 우선 (manual·e2e 는 예외). 증거 = 테스트명 / 로그 / 응답 + 변경의 **Transformation ID**(`T-YYYYMMDD-###`).
4. **Development Status 갱신** — Not started / In progress / In review / Implemented / Blocked.
5. **Operation Status** (ops·both AC) — Not verified / staging / production / monitoring / hold.
6. **drift 검사** — 구현은 바뀌었는데 AC/문서가 안 따라오면 drift 표시 → 먼저 재매핑, 그 다음 status 재계산.
7. **기록** — `docs/specs/VERIFICATION.md` 의 **Evidence Ledger** (AC ID ↔ 증거) 갱신 + kanban `Verification Status` 필드 반영. **증거 없는 AC 는 verified 로 올리지 않는다.**

## 가드레일

- **승인 없이 `Verified` 로 올리지 않는다.** critical path / 외부 영향 / 비가역 변경은 사람 승인 게이트 (Batou/사람).
- dev-only AC 는 구현 owner 1차 승인. ops/both 는 운영 owner 또는 사람 리뷰.
- 예외 / 버전 / drift 는 반드시 기록해 재검증 가능하게 둔다.
- 이 skill 은 검증·상태 갱신까지. 구현 수정은 Morpheus, risk 판단은 Batou 로.
- 한국어 리포트는 palab-platform [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md) 을 따른다 (번역투 지양).

## 출력

- 영향 AC 목록 + 각 `scope` + `evidence` + Dev/Ops status + drift 여부.
- 미확인/애매한 AC → 사람 review gate 로 표시.
- 중요한 변경 → kanban item 승격 후보.
