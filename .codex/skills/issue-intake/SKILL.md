---
name: issue-intake
description: 새로 드러난 할 일을 GitHub issue 로 등록하고, 필요하면 dispatch 라벨로 다른 봇에게 넘긴다. Neo·Kusanagi 전용. sweep/리서치 중 카드로 올릴 일이 생겼거나 다른 봇에게 업무를 위임할 때 사용.
---

# issue-intake (Codex / OpenClaw 어댑터)

이 skill 의 **정본 절차**는 이 프로젝트의 `ops/skills/issue-intake.md` 에 있다.

1. `ops/skills/issue-intake.md` 를 읽는다.
2. 실행 주체 bot 정체성을 확인한다. **Neo 또는 Kusanagi 가 아니면 실행하지 않는다** (정본 §권한).
   그 경우 카드 생성을 Neo 에게 요청하고 끝낸다.
3. 절차 1~7 을 수행한다. 다른 봇에게 넘길 때는 §다른 봇에게 넘길 때의 순서를 지킨다
   (contract 먼저 → 위험하면 `gated` → `dispatch:` 라벨은 맨 마지막).
4. 정의된 출력 규칙(만든 카드 / 안 만든 이유 / 없으면 `NO_REPLY`)으로 보고한다.

판단 기준은 그 파일이 링크하는 `docs/operations/kanban-card-readiness.md` 와
`docs/operations/event-driven-trigger-design.md` 를 따른다. 규칙 복제 금지.
