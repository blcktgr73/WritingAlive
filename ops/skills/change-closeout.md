# Skill: change-closeout

> 변경(문서·정책·코드)을 **브랜치 → PR → 머지 → main 반영 확인**까지 태우는 절차.
> PR 만 만들어 두고 멈춰 변경이 붕 뜨는 것을 막는다.
> **머지 = 사람 승인 경계** (배포·시크릿·비가역 작업과 동급). 봇도 머지하지 않는다.
> **(OpenClaw 봇 전용)** — 변경을 main 까지 태우는 것은 지휘(OpenClaw)의 몫이다. 코드 편집 자체를 `acp-claude` 로 Claude Code(ACP)에 위임했더라도, 브랜치→PR→머지 요청→반영 확인은 **봇이 이 절차로 마무리**한다.
> **정본 절차.**
> spec: [git-workflow](https://github.com/blcktgr73/palab-platform/blob/main/policies/git-workflow.md) (branch/PR 규약),
> [delivery-lifecycle](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/delivery-lifecycle.md) §6 (승인 경계·채널 역할)

## 언제 실행

- 변경을 만들었는데 **아직 `main` 에 없을 때** — 문서·정책·설정·코드 변경을 반영까지 마무리해야 할 때.
- `dispatch` 로 깨어난 코딩 작업의 마무리에서 PR 은 열었지만 **main 반영·확인이 남았을 때**.

여기까지 안 와도 되는 것: 커밋 없이 끝나는 조회·요약, 초안만 두고 논의 중인 변경(브랜치 전 단계).

## 절차

1. **브랜치** — `main` 직커밋 금지. 성격별 접두어를 쓴다: `docs/` · `chore/` · `feat/` · `fix/` ([git-workflow](https://github.com/blcktgr73/palab-platform/blob/main/policies/git-workflow.md)).
2. **커밋** — 한국어는 [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md). 끝에 `Co-Authored-By` 를 남긴다. **hooks·서명을 건너뛰지 않는다**(`--no-verify` 금지).
3. **PR 생성** — body 에 **무엇 / 왜 / 범위 밖**을 적는다. 관련 카드가 있으면 `Closes #N`(완결) 또는 `Refs #N`(일부 + 남은 항목).
4. **리뷰 게이트** — 정책·규약·보안·배포에 영향 있는 변경이면 사람 또는 Batou 사인오프를 받는다. 단순 문서면 생략 가능.
5. **머지 = 사람 승인 경계** — **Claude·봇은 머지하지 않는다.** 사람이 GitHub UI 또는 `gh pr merge <N> --squash --delete-branch` 로 머지한다. 이 단계는 배포·시크릿과 같은 급의 승인 경계다.
6. **main 반영 확인** — 머지 후 `main` 복귀·`git pull`. **배선 전파를 확인한다**: `bootstrap/templates/` 변경이면 carry 대상 repo 반영 계획, `docs/operations/agents/` 변경이면 봇 컨텍스트 반영.
7. **보고** — PR 링크 + 머지 여부 + main 반영 확인 한 줄. 관련 카드가 있으면 그 카드에 PR 링크 댓글.

## 가드레일

- **머지 자동 금지.** push·PR 까지만 자동, 머지는 항상 사람. (하네스가 머지를 자동 승인에서 막는 것도 이 경계와 정합.)
- `main` 직커밋·강제 푸시(`--force`) 금지. 되돌리기 필요하면 revert PR 로.
- 커밋에 secret·내부 토큰·호스트명을 넣지 않는다.
- PR 만 만들고 방치하지 않는다 — 머지 승인 요청까지가 이 절차의 한 건이다.

## 출력

- PR: `#<번호> <제목>` + URL.
- 상태: 머지 대기(사람 승인 필요) / 머지됨 + main 반영 확인 / 리뷰 대기.
- 배선 전파가 남았으면 그 대상을 한 줄로.
