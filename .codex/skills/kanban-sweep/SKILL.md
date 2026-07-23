---
name: kanban-sweep
description: 자기 owner lane 의 PALab Ops Kanban 카드를 점검하고 pickup 가능한 것을 진행하거나 Neo 에게 보고한다. 각 bot 의 daily sweep cron 이 호출. 요청 시에도 사용.
---

# kanban-sweep (Codex / OpenClaw 어댑터)

이 skill 의 **정본 절차**는 이 프로젝트의 `ops/skills/kanban-sweep.md` 에 있다.

1. `ops/skills/kanban-sweep.md` 를 읽는다.
2. 실행 주체 bot 정체성(자기 lane)을 확인하고 절차 1~5 를 수행한다.
3. 정의된 출력 규칙(NO_REPLY / 짧은 보고 / #neo-ops 승격)으로 보고한다.

판단 기준은 그 파일이 링크하는 `docs/operations/daily-kanban-sweep-model.md` 를 따른다. 규칙 복제 금지.
