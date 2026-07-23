# Skill: deployment-verify

> Verification Status(코드/테스트) 완료 후, 실제 **배포·서비스 반영**을 확인한다.
> **server/auto-deploy repo 에만 carry.** owner: Tachikoma (prod risk: Batou).
> **정본 절차** (런타임 무관). spec: [deployment-verification](https://github.com/blcktgr73/palab-platform/blob/main/docs/operations/deployment-verification.md).
> 산출물: `docs/specs/DEPLOYMENT_VERIFICATION.md` 의 Deployment Ledger.

## 언제 실행

- Dev 검증(`verify-ac`) 완료 + main push/릴리즈 후. 또는 릴리즈 후 cron.

## 전제

- 이 repo 가 **deploy 대상**인지 먼저 확인(파이프라인 존재 / inventory). 아니면 skip.
- Dev 검증(`verify-ac`)이 완료 상태여야 진행한다.

## 절차

1. **GitHub Actions 상태** — 단순 성공이 아니라 **deploy-lane 테스트 job** 결과까지 확인. 실패면 여기서 미완료 처리(다음 단계로 넘어가지 않음).
2. **배포 파이프라인 상태** (Vercel / GH Actions / Docker compose 등).
3. **latest production deployment 결과** + 배포된 commit SHA 확인.
4. (필요 시) **얕은 smoke check** — 서비스 up / 핵심 경로.
5. **Deployment Ledger 갱신** — 증거(run URL / SHA / health / 로그) 기록.

## 판정

- Actions 실패 → **미완료**, 배포 확인 중단.
- Actions 성공 + prod deploy 실패 → **미완료**.
- 전부 통과 → **Verified** (실제 서비스 반영 확인 완료).

## 실패 triage

- **코드 원인** → `transformation`/Morpheus 로 되돌림.
- **인프라/설정 원인** → Tachikoma/Batou ops 조치 (재구현 아님).
- 미완료로 남기고 원인/로그 링크를 기록한다.

## 가드레일

- 이 스킬은 **확인·기록**까지. 배포 트리거/롤백은 승인 경계(사람/Batou).
- 한국어 출력은 palab-platform [ko-writing-style](https://github.com/blcktgr73/palab-platform/blob/main/policies/ko-writing-style.md) 을 따른다.

## 출력

- 각 확인 항목 결과 + 판정(Verified / 미완료).
- 미완료 시 원인 triage(코드 vs 인프라) + 로그 링크.
