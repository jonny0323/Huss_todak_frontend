# 토닥토닥 프로토타입 (React + Vite)

포근이 챗봇 UI 프로토타입입니다. 대화 → 미션 제안 → 미션 인증(카메라) → 완료/레벨업 흐름을 그대로 구현했습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

## Vercel 배포

### 방법 A — Vercel 웹사이트에서 바로 배포
1. 이 폴더 전체를 GitHub 저장소에 push합니다.
2. https://vercel.com/new 에서 해당 저장소를 Import 합니다.
3. Framework Preset은 **Vite**로 자동 인식됩니다. (Build Command: `npm run build`, Output Directory: `dist`)
4. Deploy 버튼만 누르면 끝입니다.

### 방법 B — Vercel CLI로 배포
```bash
npm install -g vercel
cd todak-todak
vercel
```
프롬프트에 따라 진행하면 바로 배포 URL이 생성됩니다. (별도 vercel.json 설정 없이 Vite 프로젝트는 자동 인식됩니다.)

## 폴더 구조

```
todak-todak/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx     ← 전체 로직 (대화, 미션 카드 상태, 카메라 모달)
    └── App.css     ← 스타일
```

## 커스터마이징 포인트

- `src/App.jsx`의 `REPLIES` 배열: 자유 입력 시 포근이가 랜덤으로 답하는 문구
- `MissionCard` 컴포넌트: 미션 카드의 4단계(suggest / inprogress / verifying / done) 텍스트와 UI
- `Mascot` 컴포넌트: SVG로 그려진 포근이 캐릭터 (색상/모양 수정 가능)
- 카메라 화면의 갤러리 썸네일은 현재 picsum.photos 임시 이미지를 사용 중이니, 실제 배포 시 자체 이미지로 교체하는 것을 추천합니다.
