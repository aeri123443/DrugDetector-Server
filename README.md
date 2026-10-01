# DrugDetector-Server

마약 섭취 감지 시스템의 **백엔드 서버**입니다.
KT IoT Makers에 수집된 생체신호(ECG)를 받아 이상 파형을 판정하고, 감지 이력을 MySQL에 저장한 뒤 웹 대시보드에 API로 제공합니다.

## 시스템 구성

```
[센서 + 아두이노] ──▶ [KT IoT Makers] ──(OAuth 2.0 / REST)──▶ [DrugDetector-Server] ──▶ [MySQL]
                                                                      │
                                                                      └──(GET /api/getlogs)──▶ [DrugDetector-Web]
```

## 기술 스택

- Node.js (18 이상: 내장 `fetch` 사용)
- Express, cors, morgan
- MySQL (`mysql` 패키지)
- dotenv
- KT IoT Makers Open API (OAuth 2.0 Password Grant)

## 디렉토리 구조

```
src/
├── server.js                    # Express 서버 진입점, 라우팅
├── api/
│   ├── token-receiver.js        # KT IoT Makers OAuth 토큰 발급
│   ├── log-receiver.js          # 디바이스 태그스트림 로그 조회 (30초 구간)
│   └── data-sender.js           # 감지 이력을 클라이언트에 응답
├── datahandler/
│   └── ecg-data-handler.js      # ECG 파형 분류 및 QRS 폭 기반 이상 판정
└── database/
    ├── mysql-connection.js      # MySQL 연결
    ├── data-selection.js        # 사용자·디바이스·로그 조회
    └── log-insertion.js         # 감지 이력 저장
```

## 동작 흐름

1. **토큰 발급** (`token-receiver.js`)
   `APP_ID:APP_SECRET`을 Basic 인증 헤더로, 계정 정보를 Password Grant로 보내 Access Token을 받습니다.
2. **센서 로그 조회** (`log-receiver.js`)
   `{ENDPOINT_STREAM}/{DEVICE_ID}/log?from=&to=`로 기준 시각부터 직전 **30초**까지의 데이터를 조회합니다.
3. **ECG 판정** (`ecg-data-handler.js`)
   - 측정값이 `690.5` 미만이면 **Q/S파**, `696` 초과이면 **R파**로 분류합니다.
   - 시간순으로 정렬한 뒤 `QS → R → QS` 패턴을 찾아 앞뒤 QS 사이 간격을 **QRS 폭**으로 추정합니다.
   - QRS 폭이 기준값(`12000`)을 넘으면 이상으로 판정합니다.
4. **이력 저장** (`log-insertion.js`)
   디바이스 ID로 사용자를 찾고(`ids` → `users`), 사용자 정보와 판정 결과를 `logs` 테이블에 기록합니다.
5. **이력 제공** (`data-sender.js`)
   웹에서 `GET /api/getlogs`를 호출하면 `logs` 테이블 전체를 JSON으로 응답합니다.

## API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/getlogs` | 저장된 감지 이력 전체 조회 |

응답 예시:

```json
[
  {
    "userID": "user01",
    "userName": "홍길동",
    "gender": "M",
    "age": 25,
    "time": "2023-11-24T09:02:20.000Z",
    "place": "00 클럽",
    "ResEEG": "-",
    "ResECG": "코카인 의심",
    "note": null
  }
]
```

## 시작하기

### 1. KT IoT Makers 준비

- `IoT개발 - 나의 디바이스 - 디바이스 등록`에서 디바이스를 등록하고 태그스트림을 생성합니다.
  (Tag Stream Type: `수집`, Value Type: `숫자 형식`)
- [App ID/Secret 발급 가이드](https://iotmakers.kt.com/openp/index.html#/guideAppOpenapi)를 참고해 인증 정보를 발급합니다.

### 2. 데이터베이스 생성

```sql
CREATE DATABASE DrugDetector;
USE DrugDetector;

-- 사용자 ↔ 디바이스 매핑
CREATE TABLE ids (
  userID   VARCHAR(45) NOT NULL,
  deviceID VARCHAR(45) NOT NULL,
  PRIMARY KEY (userID, deviceID)
);

-- 사용자 정보
CREATE TABLE users (
  userID   VARCHAR(45) NOT NULL,
  userName VARCHAR(45) NOT NULL,
  gender   VARCHAR(10) NOT NULL,
  age      INT NOT NULL,
  PRIMARY KEY (userID)
);

-- 감지 이력
CREATE TABLE logs (
  userID   VARCHAR(45) NOT NULL,
  userName VARCHAR(45) NOT NULL,
  gender   VARCHAR(10) NOT NULL,
  age      INT NOT NULL,
  time     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  place    VARCHAR(45) NOT NULL,
  ResEEG   VARCHAR(45) NOT NULL DEFAULT '-',
  ResECG   VARCHAR(45) NOT NULL DEFAULT '-',
  note     VARCHAR(45) NULL DEFAULT NULL
);
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 값을 채웁니다. (`.env`는 `.gitignore`에 포함되어 있습니다.)

```env
# database
DB_HOST=127.0.0.1
DB_USER={YOUR_DB_USER}
DB_PASSWORD={YOUR_DB_PASSWORD}
DB_DATABASE=DrugDetector

# server
SERVER_PORT=11000

# KT IoT Makers OAuth 2.0
APP_ID={YOUR_APP_ID}
APP_SECRET={YOUR_APP_SECRET}
USER_NAME={YOUR_IOTMAKERS_ID}
USER_PASSWORD={YOUR_IOTMAKERS_PASSWORD}

# device
DEVICE_ID={YOUR_DEVICE_ID}

# API endpoint
ENDPOINT_OAUTH={IOTMAKERS_OAUTH_TOKEN_URL}
ENDPOINT_STREAM={IOTMAKERS_DEVICE_STREAM_URL}
```

### 4. 실행

```bash
npm install
npm install dotenv   # package.json에 누락되어 있어 별도 설치 필요
npm start            # nodemon src/server.js
```

서버가 `http://127.0.0.1:11000`에서 실행됩니다.

## 한계 및 개선 예정

- **판정 시점**: 판정 로직이 서버 시작 시 **1회만** 실행됩니다. 주기 실행(스케줄러 등)이 필요합니다.
- **테스트 시각 고정**: `log-receiver.js`의 `TESTTIME`(`2023-11-24 18:02:20`) 기준으로 조회합니다. 실시간으로 쓰려면 `SetEndpoint()`에 인자를 넘기지 않도록 바꿔야 합니다.
- **임시 값**: 장소(`00 클럽`)와 판정 결과(`코카인 의심`)가 하드코딩되어 있고, EEG 판정(`ResEEG`)은 아직 구현되지 않았습니다.
- **판정 기준**: 파형 분류 임계값(690.5 / 696)과 QRS 폭 기준(12000)은 테스트 데이터에 맞춘 실험값입니다.
- **보안**: SQL 문자열을 직접 조합하고 있어 Prepared Statement로 바꿔야 하며, CORS가 모든 출처(`*`)에 열려 있습니다.
