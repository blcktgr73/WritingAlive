# Skill: issue-intake

> 작업 중 나온 "해야 할 일"을 **GitHub issue 로 등록**하고, 필요하면 `dispatch:<봇>` 라벨로
> 다른 봇에게 넘긴다. Discord 보고문 한 줄로 끝나던 일을 추적 가능한 카드로 올리는 절차다.
> **정본 절차** (런타임 무관).
> **현재 사용 권한: Neo · Kusanagi 만.** 나머지 봇은 §권한 참고.
> spec: [kanban-card-readiness](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/kanban-card-readiness.md) (카드 계약·생성 권한),
> [github-kanban-hybrid-model](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/github-kanban-hybrid-model.md) (언제 GitHub 로 올리나),
> [event-driven-trigger-design](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/event-driven-trigger-design.md) (dispatch 라벨·승인 경계)

## 언제 실행

- kanban sweep / 리서치 / 구현 중에 **새 할 일이 드러났고**, 그게 GitHub 로 올려야 하는 것일 때
  (실제 착수, PR 가능성, blocker 추적, 여러 날 소요, cross-project 영향, 사람 승인 필요, 나중에 다시 볼 것).
- **다른 봇에게 업무를 넘길 때.** Discord 멘션만 보내면 흔적이 안 남는다 — 카드를 먼저 만들고 그 카드로 깨운다.

여기까지 안 와도 되는 것(그냥 Discord 에서 끝낸다): 1~2회 질문으로 끝나는 확인, 후보 아이디어 2~3개 제안,
짧은 경로·파일·범위 확인, owner 정하기 전 탐색 대화.

## 입력

- 할 일 한 줄 + 왜 필요한지 + 근거 링크(스레드 / 문서 / 관련 카드).
- 대상 repo. 특정 프로젝트 일이면 그 repo, cross-project 운영 건이면 `blcktgr73/palab-platform`.
- 후보 `Owner`(Neo / Morpheus / Kusanagi / Batou / Tachikoma) 와 `Type`.
- **전제**: 실행 런타임에 `gh` 가 인증돼 있어야 한다 (`gh auth status`). 안 되면 카드를 만들지 말고
  그 사실을 사람에게 보고한다 (조용히 넘어가지 않는다).

## 절차

1. **중복부터 본다** — `gh issue list -R <owner>/<repo> --search "<핵심어>" --state all --limit 20`.
   같은 일이 이미 있으면 새로 만들지 말고 그 카드에 코멘트로 붙인다.
2. **한 장에 하나** — 카드 하나 = 실행 단위 하나. 크면 2~4개로 쪼개고 서로 링크한다.
3. **body 를 계약대로 채운다** — spec §Body 권장 템플릿(Summary / Why / Ready contract / Acceptance criteria / Notes·links).
   빈칸을 남기지 않는다. **모르는 값은 추정하지 말고 `확인 필요` 로 적는다.**
4. **issue 생성**
   ```bash
   gh issue create -R <owner>/<repo> --title "<한 줄 요약>" --body-file <본문파일>
   ```
5. **보드에 붙인다** — `PALab Ops Kanban` (user project #1, owner `blcktgr73`)
   ```bash
   gh project item-add 1 --owner blcktgr73 --url <issue url>
   ```
   이어서 `Owner` / `Type` / `Priority` / `Blocker` / `Human required` / `Related thread` 를 채운다.
   필드 설정이 실패하면 body 의 Ready contract 를 근거로 남기고 **Neo 에게 보강을 요청**한다 (카드는 남긴다).
6. **위임할 거면** → §다른 봇에게 넘길 때.
7. **보고** — 만든 카드 링크 + 만든 이유 한 줄 + 위임 여부. 스레드에 남긴다.

## 다른 봇에게 넘길 때 (`dispatch:` 라벨)

`dispatch:<봇>` 라벨을 붙이는 순간 라우터가 **그 봇을 실제로 깨운다.** 쪽지가 아니라 착수 신호다.
그래서 순서가 중요하다.

1. **readiness contract 를 먼저 다 채운다.** 미충족 카드에 라벨을 붙이면 깨어난 봇이 집지 못하고
   되돌려 보낸다 — 서로의 시간만 쓴다.
2. **위험한 일이면 `gated` 를 같이 붙인다** — 배포 / 시크릿 / 외부 전송 / 비가역 작업.
   라우터가 발화 대신 `awaiting-approval` 을 붙이고 승인자에게 넘긴다. 승인 전엔 상대 봇이 안 깨어난다.
3. 라벨 부착은 **맨 마지막 단계**다.
   ```bash
   gh issue edit <번호> -R <owner>/<repo> --add-label dispatch:<봇>
   ```
4. 스레드에 "누구에게 무엇을 왜 넘겼는지" 한 줄 남긴다.

하지 않는 것:

- **자기 자신에게 dispatch 하지 않는다** (`dispatch:<나>`) — 자기가 자기를 깨우는 순환이 된다.
- `dispatched` / `approved` / `awaiting-approval` 라벨은 건드리지 않는다. 라우터와 사람의 것이다.
- 한 번의 run 에서 dispatch 는 **최대 2건**. 넘치면 나머지는 라벨 없이 카드만 만들고 Neo 에게 올린다.

## 권한 (현재 기준)

| 봇 | issue 생성 | `dispatch:` 부착 (= 남을 깨움) |
|---|---|---|
| **Neo** | ✅ 전 lane | ✅ 5봇 전부 |
| **Kusanagi** | ✅ 자기 산출물에서 나온 것 (research / docs / SNS·blog / project candidate / watch follow-up) | ✅ Morpheus · Batou · Tachikoma. Neo 로 갈 일이면 카드만 만들고 보고 |
| Morpheus · Batou · Tachikoma | ❌ 아직 — 기존대로 Neo 에게 카드 생성을 요청 | ❌ |

권한 확대는 사람이 결정한다. 여기 없는 봇이 이 스킬을 실행하지 않는다.

## 가드레일

- **추정 금지.** `Owner` / `Type` / `Blocker` 를 지어내지 않는다. 모르면 `확인 필요` 로 두고 Neo 에게 넘긴다.
- **한 run 최대 3장.** 더 많으면 가장 급한 3장만 만들고 나머지는 목록으로 보고한다 (보드 오염 방지).
- **공개 repo 의 카드 본문에 내부 경로·토큰·호스트명을 적지 않는다.** 외부에 나가는 글이다.
- 라우팅이 애매하면 (누구 일인지 모르겠으면) dispatch 없이 카드만 만들고 `Owner: 확인 필요` 로 Neo 에게 올린다.
- 배포·시크릿·외부 발신·비가역 작업은 카드를 만들 뿐 **직접 실행하지 않는다.** 승인 경계는 그대로다.
- 카드를 만들었다는 사실 자체를 스레드에 남긴다. 조용히 만들지 않는다.

## 출력

- 만든 카드: `#<번호> <제목>` + URL + Owner/Type + dispatch 여부.
- 만들지 않은 것: 중복이라서 / 정보가 부족해서 / 권한 밖이라서 — 이유를 한 줄로.
- 만들 게 없으면 조용히 (`NO_REPLY`).
