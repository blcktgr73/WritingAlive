# Skill: security-baseline

> 이 프로젝트의 커밋/릴리즈 전 최소 보안 baseline 을 점검하고 결과를 보고한다.
> **정본 절차** (런타임 무관). 판단 기준·정책은 palab-platform 을 참조한다 (여기 복제하지 않는다).
> spec: palab-platform `security/policies.md`, `bootstrap/templates/security-baseline.md`

## 언제 실행

- 비트리비얼 변경 커밋 전, 릴리즈 전, 또는 요청 시.

## 입력

- 이 프로젝트 repo 전체.

## 절차

1. `.gitignore` 에 `.env`, `.env.local`, `.env.*.local` 포함 여부 확인.
2. 작업 트리/커밋에 비밀값(키·토큰·PEM) 스캔 — 발견 시 즉시 flag.
3. 클라이언트 번들 노출 점검 (`NEXT_PUBLIC_*` 등에 비밀 없음).
4. repo visibility 확인 — Public 이면 민감정보 미포함 재확인.
5. 인증/권한 경계 존재 확인 (allowlist · RLS · requireAdmin 등).
6. 로그 redaction / rate limit (auth · 결제 경로) 확인.
7. GitHub Secret Scanning 활성화 여부 확인.

> 항목 정본은 platform `security-baseline` 체크리스트. 프로젝트 고유 항목은 이 파일에 append.

## 출력

- 각 항목 `pass` / `fail` / `unknown` + 근거(`파일:라인`).
- `fail` 있으면 요약 + 다음 액션 (issue/kanban 카드 후보).

## 가드레일

- 이 skill 은 **점검·보고만** 한다. 자동 수정 / 커밋 / 배포하지 않는다.
- 수정이 필요하면 Morpheus 로, 승인·리스크 판단은 Batou/사람 gate 로 넘긴다.
