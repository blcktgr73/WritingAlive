# Claude Sonnet 5.5 전환 검증 계획

WritingAlive의 Claude 모델은 `WriteAliveSettings.claudeModel`로 고정한다. 기본값은
rollback을 위해 `claude-sonnet-4-5-20250929`로 유지하고, production 전환 승인 후
`claude-sonnet-5-5`로 바꾼다.

## 현재 확인 결과

- 운영 provider의 기존 모델: `claude-sonnet-4-5-20250929`
- Anthropic API retirement: 2026-11-30
- 권장 대체: `claude-sonnet-5-5`
- Sonnet 5.5 기준 가격: input `$2/MTok`, output `$10/MTok`
- Sonnet 4.5 기준 가격: input `$3/MTok`, output `$15/MTok`
- Sonnet 5.5는 adaptive thinking을 사용하며, 기존 `thinking.budget_tokens`나 강제
  tool choice를 사용하는 경로가 있으면 별도 호환성 검토가 필요하다. 현재 provider
  요청은 일반 text/system/messages만 사용한다.

출처: [model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations),
[Sonnet 5.5 overview](https://platform.claude.com/docs/en/models/sonnet-5-5/overview),
[migration guide](https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide),
[pricing](https://platform.claude.com/docs/en/about-claude/pricing)

## 검증 절차

동일한 대표 프롬프트셋을 두 모델에 각각 실행하고 아래 값을 기록한다.

1. 품질: JSON schema 유효성, center/expansion 의미 보존, 수동 blind rating
2. 비용: `input_tokens`, `output_tokens`, 요청별 비용, 문서 1건당 평균 비용
3. 지연: p50/p95, retry율, HTTP 오류율
4. 호환성: response content 파싱, stop reason, 빈 응답/잘못된 JSON, 재시도
5. 회귀: `npm test`, `npm run build`, 대표 기능 smoke test

판정 기준은 먼저 고정한다.

- JSON schema 통과율: 100%
- 품질 점수: 기존 모델 대비 허용 하락폭을 사람 승인으로 확정
- p95 지연과 비용: baseline 대비 허용 상한을 사람 승인으로 확정
- production 전환일과 rollback 종료일: 사람 승인 필요

## Rollback

설정에서 `Claude model`을 `claude-sonnet-4-5-20250929`로 되돌리고 AI 서비스를
재초기화한다. 전환 승인 전에는 기본값을 변경하지 않는다. 두 모델의 실제 API 비교
결과와 production 일정이 이슈 #10 및 전환 PR에 기록되기 전에는 cutover하지 않는다.
