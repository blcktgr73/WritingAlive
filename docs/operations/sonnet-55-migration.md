# Claude Sonnet 5.5 전환 검증 계획

WritingAlive의 Claude 모델은 `WriteAliveSettings.claudeModel`로 고정한다. Production
기본값은 `claude-sonnet-5-5`이며, `claude-sonnet-4-5-20250929`는 즉시 rollback 핀으로
유지한다. 기존 설치의 pre-cutover 저장 설정은 1회성 마이그레이션으로 5.5로 전환한다.

## 현재 확인 결과

- Production provider 모델: `claude-sonnet-5-5`
- Rollback pin: `claude-sonnet-4-5-20250929`
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

설정에서 `Claude model`을 `claude-sonnet-4-5-20250929`로 선택하고 AI 서비스를
재초기화하면 rollback할 수 있다. 이후 사용자가 선택한 rollback 값은 자동 마이그레이션으로
덮어쓰지 않는다.
