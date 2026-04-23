# Feature: 비밀번호 재설정 플로우

## 기능 설명
사용자가 비밀번호를 잊은 경우 이메일로 재설정 링크를 받아 새 비밀번호로 변경할 수 있다.

## 사용자 시나리오
1. `/login` 페이지에서 "비밀번호를 잊으셨나요?" 링크 클릭
2. 이메일 입력 → 재설정 요청 버튼 클릭
3. "재설정 링크를 이메일로 보냈습니다" toast 표시
4. 이메일 수신 → 링크 클릭 → 앱의 `/auth/callback`으로 리다이렉트
5. 세션 교환 성공 시 `/reset-password` 페이지로 이동
6. 새 비밀번호 2회 입력 (확인용) → 변경 버튼 클릭
7. "비밀번호가 변경되었습니다" toast → `/login` 리다이렉트
8. 새 비밀번호로 로그인

## UI 동작

### `/login` 수정
- 기존 로그인 폼 아래 "비밀번호를 잊으셨나요?" 텍스트 버튼
- 클릭 시 이메일 입력 폼으로 토글 (또는 별도 상태 전환)
- "재설정 링크 받기" 버튼 → `supabase.auth.resetPasswordForEmail()`
- 성공 시 안내 메시지 표시 + 로그인 폼으로 복귀

### `/auth/callback` (Route Handler)
- 쿼리스트링의 `code`를 세션으로 교환 (`exchangeCodeForSession`)
- 성공: `/reset-password`로 리다이렉트
- 실패 (만료/무효 토큰): `/login?error=invalid-token`으로 리다이렉트

### `/reset-password` 페이지
- 새 비밀번호 input + 확인용 input
- 최소 6자 검증 (클라이언트)
- 두 입력 일치 검증
- 변경 버튼 → `supabase.auth.updateUser({ password })`
- 성공 시 toast + `/login` 이동
- 실패 시 에러 메시지 표시 (세션 만료 포함)

## 엣지 케이스
- 재설정 이메일 발송 실패: "이메일 발송 실패 - 재시도" 버튼
- 존재하지 않는 이메일: Supabase는 보안상 성공 응답 반환 → UI도 동일 처리 (계정 존재 여부 노출 금지)
- 토큰 만료 (1시간): `/auth/callback`에서 에러 감지 → `/login`에 에러 쿼리로 리다이렉트 후 toast 표시
- `/reset-password` 직접 접근 (세션 없음): `/login`으로 리다이렉트
- 비밀번호 불일치: "비밀번호가 일치하지 않습니다" inline 에러
- 비밀번호 너무 짧음: "최소 6자 이상" inline 에러

## 보안 규칙
- `/auth/callback`, `/reset-password`는 `proxy.ts`에서 인증 우회 허용
- Supabase Dashboard → Authentication → URL Configuration에 Redirect URL 등록 필수:
  - `http://localhost:3000/auth/callback` (개발)
  - `https://<prod-domain>/auth/callback` (배포)
- 이메일 존재 여부를 UI 응답으로 노출하지 않음 (enumeration 방지)
- 서비스 롤 키 미사용 (클라이언트 SDK의 공개 플로우만 사용)

## 파일 변경
- `app/app/login/page.tsx` — "비밀번호 잊음" 링크 + 재설정 요청 UI 추가
- `app/app/auth/callback/route.ts` — 신규 (세션 교환)
- `app/app/reset-password/page.tsx` — 신규 (새 비밀번호 폼)
- `app/proxy.ts` — `/auth/callback`, `/reset-password` 우회 허용

## 완료 기준 (DoD)
- [ ] 로그인 페이지에 재설정 링크 노출
- [ ] 이메일 입력 → 재설정 메일 발송 동작
- [ ] 메일 링크 클릭 → `/auth/callback` → `/reset-password` 이동
- [ ] 새 비밀번호 저장 → 로그인 가능 확인
- [ ] 토큰 만료 시 명확한 안내
- [ ] proxy 우회 경로 동작 (무한 리다이렉트 없음)
- [ ] typecheck / lint 통과
