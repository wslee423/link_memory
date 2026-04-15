# /new-feature
새 기능 구현 시작 시 실행하는 표준 워크플로우.

## 실행 순서
1. docs/PLANS.md 에서 다음 미완성 태스크 확인
2. 해당 product-specs/ 문서 읽기
3. DB 마이그레이션 필요 시 supabase/migrations/ 에 SQL 파일 생성
4. types/index.ts 타입 확인/추가
5. API Route 구현
6. UI 컴포넌트 구현
7. `npm run typecheck && npm run lint` 실행
8. git commit (feat: [기능명])
9. docs/exec-plans/active/ 진행 상황 업데이트
10. AGENTS.md 완료 보고 형식으로 결과 보고
