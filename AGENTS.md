# WritingAlive — Agent / Coding Guide

> 이 프로젝트에서 사람(Claude/Codex)과 OpenClaw bot 이 공통으로 따르는 규약의 **정본(canonical)**.
> 런타임별로 읽는 파일이 다르지만 내용은 이 파일 하나를 본다:
> - Claude Code → `CLAUDE.md` (이 파일을 가리키는 포인터)
> - Codex → `AGENTS.md` (이 파일)
> - OpenClaw → Codex 기반이므로 `AGENTS.md`
>
> cross-project 표준은 palab-platform 을 source-of-truth 로 참조한다 (여기서 복제하지 않는다).

## 스택 / 구조

- Obsidian 플러그인 (TypeScript, esbuild, `manifest.json`/`src/`/`styles.css`) — <검토 필요>

## 작업 규약

- branch/tag/PR: palab-platform [git-workflow](https://github.com/blcktgr73/palab-platform/blob/main/policies/git-workflow.md)
- 착수/추적: `PALab Ops Kanban` 카드 또는 이 repo issue (`Owner`/`Type`/`Blocker` 필수)
- 배포 전 검증: "배포 중"과 "검증됨"을 구분해서 기록한다.
- (deploy repo) **`push 성공` ≠ `배포 완료`** — Dev 검증(`verify-ac`) 후 `deployment-verify` 로 서비스 반영까지 확인한다. 기준: [deployment-verification](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/deployment-verification.md).
- 한국어 문서·리포트·커밋은 palab-platform [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md) 을 따른다 (번역투 지양).

## 보안 경계

- 비밀은 커밋하지 않는다 (`.env*` gitignore). 정책: palab-platform `security/policies.md`.
- 클라이언트 번들(`NEXT_PUBLIC_*` 등)에 비밀 금지.
- <프로젝트 고유의 민감 자원 / 권한 경계>

## bot 자율 실행 시

- 외부 발신·배포·권한 변경·secret 변경·결제는 승인 경계를 유지한다 (사람/Batou gate).
- 모르는 것은 추정하지 말고 "확인 필요"로 남긴다.
- 중요한 결정은 issue/PR/doc 중 하나로 승격한다.

## Spec 추적 (Transformation-Centered Development)

요구사항은 `docs/specs/` 에서 **Theme(Concept) > Epic > Story > AC** 로 구조화하고, 변경은 작은 **Transformation**(`T-YYYYMMDD-###`) 단위로 만든다.
- `docs/specs/USER_STORY_MAP.md`(Theme>Epic>Story), `docs/specs/AC.md`, `docs/specs/VERIFICATION.md`(Evidence Ledger)
- `docs/transformations/TRANSFORMATIONS.md` (Transformation Log). 템플릿: `docs/templates/{THEME,USER_STORY,TRANSFORMATION}_TEMPLATE.md`
- AC 완료는 Transformation ID 로 추적한다. 변경마다 `verify-ac` 로 검증 상태를 갱신한다.
- 기준: palab-platform [transformation-centered-development](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/transformation-centered-development.md) (+ 검증 facet [user-story-verification-governance](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/user-story-verification-governance.md)).

## Skills (이 프로젝트가 carry 하는 표준 절차)

표준/반복 절차는 `ops/skills/*.md` 에 **정본**으로 둔다. 규칙은 palab-platform 을 참조하고
여기엔 절차 wrapper 만 담는다. 해당 상황이 오면 아래 절차를 따른다.

- `ops/skills/story-authoring.md` — 아이디어/소스 → Theme(Concept)/Epic/Story/AC 정리 (spec 작성, Pillar ②③).
- `ops/skills/transformation.md` — 변경을 작은 Transformation 단위로 정의·2-3옵션·Log 기록 (Pillar ①).
- `ops/skills/verify-ac.md` — 변경이 spec(AC)을 적절히 구현했는지 검증 (Evidence Ledger + Transformation ID).
- `ops/skills/deployment-verify.md` — **(server/auto-deploy repo만)** 배포·서비스 반영 확인 (Actions/파이프라인/prod). `push` ≠ `배포`.
- `ops/skills/security-baseline.md` — 커밋/릴리즈 전 보안 baseline 점검.
- `ops/skills/kanban-sweep.md` — 자기 lane kanban sweep (cron 호출).
- `ops/skills/acp-claude.md` — **(OpenClaw 코딩 봇 전용)** dispatched(GitHub webhook 트리거) **코딩** 작업을 Claude Code(ACP)로 위임 실행. OpenClaw=지휘, Claude Code=실행기.
- `ops/skills/issue-intake.md` — **(Neo·Kusanagi 전용)** 새로 드러난 할 일을 GitHub issue 로 등록하고, 필요하면 `dispatch:<봇>` 라벨로 다른 봇에게 넘긴다. 다른 봇에게 업무를 넘길 때는 카드를 먼저 만든다.

> 흐름 (Transformation-Centered Development): `story-authoring`(spec 작성) → `transformation`(변경 정의·옵션·로그) → `verify-ac`(검증).
> **dispatched 실행**: `dispatch:<봇>` 로 깨어난 **코딩** 작업이면, OpenClaw 는 직접 코딩하지 말고 `acp-claude` 절차대로 **Claude Code(ACP)에 위임**한다 (프롬프트에 `acp claude 사용해서 진행해줘`). 라우터가 코딩 route 에 이 문구를 이미 붙여 보낼 수도 있다(중복 무해). 조회·요약만이면 직접 처리.
- (추가 skill 은 여기에 등록)

런타임 어댑터 (`SKILL.md` 은 Claude Code·Codex·OpenClaw 공통 표준 포맷):
- Claude Code → `.claude/skills/<name>/SKILL.md` (자동 발견, `/security-baseline`)
- Codex / OpenClaw → `.codex/skills/<name>/SKILL.md` (자동 발견). 이 `AGENTS.md` 도 맥락으로 가리킴.

## 반복 작업 (cron)

- 이 프로젝트에서 bot 이 정기적으로 도는 작업(예: kanban sweep, release watch)은
  **cron 이 skill/command 를 호출**하는 구조를 따른다. 절차 자체는 skill 로,
  스케줄은 각 bot 런타임 cron 으로 둔다. 근거: palab-platform `bootstrap/README.md` (Skill 로드맵).

## 프로젝트 고유 규칙

- <여기에 추가>
