# Skill: transformation

> 원하는 변경을 Transformation-Centered Development 의 **Transformation 단위**로 만든다:
> 기존 Theme 확인 → 하나의 작은 구조 변경 정의 → **2-3 옵션 제시** → 구현 후 Transformation Log 기록 + AC 연결.
> **정본 절차** (런타임 무관). Pillar ① Generative Sequence 를 담당한다.
> spec: [transformation-centered-development](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/transformation-centered-development.md)
> 산출물: `docs/transformations/TRANSFORMATIONS.md` 항목(`T-YYYYMMDD-###`), 영향 AC 상태.

## 언제 실행

- 새 기능 / 구조 변경을 시작할 때 (Development Loop 의 2~4 · 6 단계).

## 절차

1. **Load Context** — PRD / 관련 Theme 정의 / Transformation Log 를 확인한다.
2. **Check Themes** — 기존 Theme(Concept)로 포괄되나? 중복을 피하고 parent/child 를 판단한다.
3. **Define Transformation** — 하나의 **작은** 구조 변경으로 좁힌다. `Internal` / `User-facing` 판정.
4. **Propose Options** — 2-3 대안 + 트레이드오프(구조 영향 / 인지 부하 / 경험 부채). 선택과 근거를 남긴다.
5. **(구현은 Morpheus/사람)** — 이후 Transformation Log 에 `T-YYYYMMDD-###` 항목을 `TRANSFORMATION_TEMPLATE` 형식으로 기록한다.
6. **AC 연결** — 영향받는 AC 를 식별해 `verify-ac` 로 넘기고, AC ↔ `T-ID` 를 연결한다.
7. **Follow-ups** — 후속 후보 1-3 을 제안한다.

## 가드레일

- 한 번에 **하나의 작은 Transformation**. 거대 변경은 쪼갠다.
- 승인 경계 유지: 외부 발신 / 배포 / secret / 결제는 사람·Batou gate. 이 스킬은 **정의·옵션·기록**까지, 구현 자체가 아니다.
- 한국어 출력은 palab-platform [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md) 을 따른다.

## 출력

- Transformation 정의 + 옵션 비교 + 선택 근거.
- 확정 시 Transformation Log 항목(`T-YYYYMMDD-###`) + 연결 AC 목록.
- 다음 후속 1-3.
