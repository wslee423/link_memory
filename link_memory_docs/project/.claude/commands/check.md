# /check
현재 코드 상태 품질 점검.

## 실행 순서
1. `npm run typecheck` — 타입 에러 확인
2. `npm run lint` — lint 에러 확인
3. 환경변수 노출 확인 (서버 전용 키가 NEXT_PUBLIC_ 로 시작하는지)
4. RLS 활성화 여부 확인
5. transcript 컬럼이 API 응답에 포함됐는지 확인
6. console.log 프로덕션 코드에 남아있는지 확인
7. any 타입 사용 여부 확인
8. 결과 요약 보고
