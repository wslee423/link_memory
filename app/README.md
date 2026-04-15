# link_memory — app

Next.js 앱 소스코드. 상위 README는 [루트 디렉토리](../README.md)를 참고하세요.

## 개발 명령어

```bash
npm run dev        # 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run typecheck  # TypeScript 타입 검사
npm run lint       # ESLint
```

## 환경변수

`.env.local` 파일 필요:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
YOUTUBE_DATA_API_KEY=
```

설정 방법은 루트 README의 **로컬 개발 설정** 섹션 참고.
