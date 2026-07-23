---
name: verify-ac
description: 변경이 spec(AC)을 적절히 구현했는지 검증한다. 영향 AC 식별→증거 확인→Verification Status 갱신→drift 표시. 비트리비얼 변경 후 또는 요청 시 사용. palab-platform user-story-verification-governance 기준.
---

# verify-ac (Codex / OpenClaw 어댑터)

이 skill 의 **정본 절차**는 이 프로젝트의 `ops/skills/verify-ac.md` 에 있다.

1. `ops/skills/verify-ac.md` 를 읽는다.
2. 대상 변경/범위에 대해 절차 1~7 (영향 AC → 증거 → status → drift → 기록)을 수행한다.
3. 정의된 출력 형식(영향 AC + scope + evidence + Dev/Ops status + drift)으로 보고한다.

판단 기준은 그 파일이 링크하는 palab-platform governance 문서를 따른다. 규칙 복제 금지.
