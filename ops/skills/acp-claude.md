# Skill: acp-claude

> dispatched(GitHub webhook 트리거) 코딩 작업을 **Claude Code(ACP)** 에 위임해 실행한다.
> OpenClaw = 지휘·중계, Claude Code(ACP) = 실행기. **OpenClaw 전용 스킬** (`.codex`/`.claude` 어댑터 없음 —
> Claude 런타임은 자기가 실행기라 무의미, Codex 는 대상 아님).
> 판단 기준·트리거/승인 규약은 palab-platform 을 참조한다 (여기 복제하지 않는다).
> spec: palab-platform `docs/operations/event-driven-trigger-design.md` (트리거·승인 경계).

## 언제 실행

- `dispatch:<봇>` 라벨로 깨어난 **코딩/구현/변경** 작업. 조회·요약만이면 대상 아님(직접 처리).

## 입력

- dispatched 카드: 이슈 title / 본문 / AC / `html_url`. 대상 repo(+브랜치).
- **전제**: OpenClaw 에 `gh` 가 인증돼 있어야 한다(repo 준비용). 작업 repo 는 acp 워크스페이스 아래
  **`prj/<repo>`** 에 둔다 (예: `/root/.openclaw/workspace-claude/prj/<repo>`).

## 절차

1. **대상 repo 준비** — 작업 경로는 `<워크스페이스>/prj/<repo>`.
   - 없으면 `gh repo clone <owner>/<repo> <워크스페이스>/prj/<repo>`
   - 있으면 `git -C <경로> fetch --prune` 후 기본 브랜치를 최신화.
   - 작업은 **새 브랜치**에서 한다(카드 번호 기반 권장, 예: `feat/<issue-number>-<slug>`).
2. **작업 프롬프트를 좁게 정리** — 3단계를 `--approve-all` 로 돌리므로 **실행 중 사람 승인 게이트가 없다.
   따라서 여기 적은 범위가 곧 안전 경계다.** 매번 아래를 구체적으로 명시한다(넓게 열어두지 않는다):
   - **변경 가능 파일** — 경로를 콕 집어 적는다 (예: `docs/acp-verify.md` 이 파일 하나만)
   - **금지 경로** — 예: `.github/`, `ops/`, 시크릿·설정 파일, **repo 밖 전부**
   - **브랜치 규칙** — 예: `feat/<issue-number>-<slug>` 새 브랜치에서만, **`main` 직접 커밋/푸시 금지**
   - **커밋/푸시 여부** — 커밋까지인지 push 까지인지 명확히
   - AC(완료 기준) + 기대 산출물, 그리고 1의 repo 경로·브랜치
3. **Claude Code 에 위임** — 기본 경로는 **`direct acpx claude`** 를 쓴다.
   (ACP 런타임 세션은 채널 컨텍스트에서 스레드 바인딩이 실패하는 경우가 있어, direct 경로를 기본 우회로 둔다.)
   실행 옵션은 **고정**한다:
   ```
   --approve-all --non-interactive-permissions fail --cwd <1의 repo 경로>
   ```
   - `--approve-all` — 대화형 승인이 불가한 환경이라 전부 승인. **그래서 2단계 범위 명시가 유일한 방어선.**
   - `--non-interactive-permissions fail` — 승인 프롬프트가 필요하면 **매달리지 말고 실패**(무한 대기 방지).
   - `--cwd <repo 경로>` — 1단계에서 준비한 디렉터리로 고정(다른 경로에서 돌지 않게).
4. **결과 회수·보고** — 변경 요약 + AC 대비 검증 결과 + 남은 위험/다음 액션을 카드/스레드에
   사람이 읽게 정리한다. 위임 응답을 그대로 붙여넣지 않는다.

## 출력

- 변경 요약(파일/커밋) + AC 대비 pass/fail + kanban/카드 갱신 후보.
- 위임 실패·범위 이탈 시: 무엇이 막혔는지 + 사람 확인 요청.

## 가드레일

- OpenClaw = 지휘·중계, **Claude Code(ACP) = 실행기.** 역할을 섞지 않는다.
- **`--approve-all` 이므로 실행 중 사람 승인 게이트가 없다.** 안전 경계는 **2단계 프롬프트에 적은 범위**뿐이다.
  변경 가능 파일·금지 경로·브랜치·푸시 여부를 매번 좁게 적는다. "알아서 해줘" 식으로 열어두지 않는다.
- 위험 작업(배포·시크릿·외부 전송·비가역)은 **애초에 위임 범위에 넣지 않는다.** 필요하면 사람 승인을 먼저 받는다
  (라우터 `gated` 게이트로 카드 단계에서 거르는 것이 1차 방어).
- 위임이 실패/불명확하면 **사람에게 보고하고 임의 진행하지 않는다.**
- 기존 클론의 워킹트리가 더럽거나(이전 작업 잔재) 충돌하면 **`reset --hard`·강제 정리 금지** —
  상태를 보고하고 사람 판단을 받는다(비가역 손실 방지).
- clone/최신화는 `gh`/`git` 로 하되, 대상 repo 외 경로는 건드리지 않는다.
