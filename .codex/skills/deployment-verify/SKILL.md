---
name: deployment-verify
description: Dev 검증(코드/테스트) 완료 후 실제 배포·서비스 반영을 확인한다 — GitHub Actions(+deploy-lane 테스트), 파이프라인, latest prod deploy, 얕은 smoke. server/auto-deploy repo 전용. push 성공과 배포 성공을 분리 기록.
---

# deployment-verify (Codex / OpenClaw 어댑터)

이 skill 의 **정본 절차**는 이 프로젝트의 `ops/skills/deployment-verify.md` 에 있다.

1. `ops/skills/deployment-verify.md` 를 읽는다. (deploy 대상 repo 가 아니면 skip)
2. GH Actions(+deploy-lane test) → 파이프라인 → prod deploy → smoke 순으로 확인한다.
3. 판정(Verified / 미완료) + 실패 triage(코드 vs 인프라)를 `docs/specs/DEPLOYMENT_VERIFICATION.md` 에 기록한다.

판단 기준은 그 파일이 링크하는 palab-platform deployment-verification 을 따른다.
