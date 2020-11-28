# 🎠 KLAS Helper

[Korean](https://github.com/nbsp1221/klas-helper) | [English](https://github.com/nbsp1221/klas-helper/blob/master/README-EN.md)

광운대학교 KLAS 사이트에 편리한 기능을 추가합니다. Tampermonkey 확장 프로그램으로 동작하기 때문에 이를 지원할 수 있는 웹 브라우저에서만 사용이 가능합니다.

> 아래 작성된 내용은 모두 Chrome 브라우저를 기준으로 한 설명입니다.

## 기여

[여기](https://github.com/nbsp1221/klas-helper/blob/master/CONTRIBUTING.md)를 참고해 주세요.

## 안내 사항

'KLAS Helper'는 개인 사용 용도로 제작된 프로그램이며 공신력이 없음을 알려드립니다. 참고 용도로 사용해 주시면 감사하겠습니다. 불법적인 목적으로 사용 시 발생하는 불이익에 대해서 'KLAS Helper' 제작자는 어떠한 책임도 지지 않음을 밝힙니다.

### 권한 안내

유저 스크립트 cross-origin 리소스 접근 경고 창이 나올 경우 **도메인 항상 허용** 버튼을 눌러주셔야 정상적인 사용이 가능합니다. 이를 거부할 경우 기본 기능만 사용하실 수 있으며 권한 요구 기능의 사용이 제한됩니다.

* 외부 사이트 접근 권한
  - 온라인 강의 동영상의 정보를 얻는 과정에서 `kwcommons.kw.ac.kr` 도메인 접근이 필요합니다.

## 기능

### 기본 기능

* 강의 계획서 조회의 불편했던 부분 개선 (인증 코드, 새 창으로 열기 등)
* 학기별 전공 평점과 전공 외 평점을 자동으로 계산, 차트 시각화
* 이전 학기 석차 정보 조회
* 연속 강의 시청 시 2분 쿨타임 제거 
* 100% 수강한 강의 숨기기 기능
* 미시청 강의 및 미제출 목록 표시 

### 권한 요구 기능

* 온라인 강의 동영상 다운로드

## 설치

1. [Chrome 웹 스토어](https://chrome.google.com/webstore/search/tampermonkey)에 들어가서 Tampermonkey 확장 프로그램을 설치합니다.
2. https://openuserjs.org/scripts/nbsp1221/KLAS_Helper 링크로 접속한 뒤 Install 버튼을 클릭합니다.
3. 새로 뜬 Tampermonkey 창에서 설치를 계속 진행합니다.
4. 설치가 완료되면 자동으로 기능이 적용되니 KLAS 사이트에 접속해서 바로 사용하시면 됩니다.

## 업데이트

기본적으로 업데이트는 자동으로 진행되기 때문에 굳이 수동으로 하실 필요는 없습니다.

1. 우측 상단의 Tampermonkey 아이콘을 클릭합니다.
2. 유저 스크립트 업데이트 확인 버튼을 눌러 업데이트를 진행합니다.

## 해제

1. 먼저 KLAS 사이트에 접속합니다.
2. 우측 상단의 Tampermonkey 아이콘을 클릭합니다.
3. KLAS Helper 활성화 버튼을 눌러 해제와 적용을 반복할 수 있습니다.

## 오픈소스 과제 설명 

설명: 광운대학교 오픈 소스 수업 프로젝트 과제로 개선됨

## 개선된 기능 main화면에 추가 된 기능  
   ## 1.기존에 수강 과목 현황에 퀴즈를 보는 기능을 추가
   <div>
    <img width="60%" src='http://drive.google.com/uc?export=view&id=1gzuKj7weikvuIlc5uUsHQSHPi_PPwT9R' /><br>
    <img width="60%" src='http://drive.google.com/uc?export=view&id=1qvN7s9fhwcOO4gBpW2A6h_oIQDlW3MVf' /><br>
   </div>
   
   ## 2.공지사항 버튼 구현
   <img width="60%" src='http://drive.google.com/uc?export=view&id=1e8uU9YLufknokxSNOoRP_LDj-Ua1BTp-' /><br>
   설명  
   1. 공지사항 버튼 : 클락하면 공지사항 최상단에 올라온 공지 1개를 내가 수강한 과목별로 렌더링함, 한 번 더 클릭하면 끌 수 있음
   2. 올아온 공지개수 : 최상단에 올라온 공지개수와 같은 날에 올라온 공지들을 포함하여 개수를 반환 ex)3개가 올라왔다면 3개가 뜸
   3. 날짜 : 최상단에 올라온 공지의 날짜를 렌더링
   4. 클릭기능 : 커서를 이용해서 날짜 공지개수 공지사항들을 클릭하면 각 과목별 공지사항으로 넘어감
   ## 3.학사일정 버튼 구현
   <img width="60%" src='http://drive.google.com/uc?export=view&id=1-XaVnD1hCHnFfvrhXCDJC-fe3U2ksk9p' /><br>
   설명 
   1. 학사일정 버튼 : 클릭하면 최상단에 요번 달 학사일정 정보가 전달 됨, 한 번 더 클릭하면 끌 수 있음
   2. 올라온 학사 공지 : 요번 달 학사 공지가 업로드 됨
   3. 날짜 : 오늘의 날짜가 업로드 됨
   4. 클릭기능 : [학사일정]을 클릭하면 학교 홈페이지 학사일정으로 넘어가짐
   ## 4.메모 버튼 구현
   메모 버튼 화면
   <img width="60%" src='http://drive.google.com/uc?export=view&id=1LbEq9-eKC35iBt7sooWFx3ZX-Rd5Zz4c' /><br>
   파일 쓰고 다운 받음 
   <img width="30%" src='http://drive.google.com/uc?export=view&id=18tW7ox3IzJE-KgprTUsnaS6flbZVA-aY' /><br>
   업로드 버튼을 누르고 다시 업로드
   <img width="50%" src='http://drive.google.com/uc?export=view&id=1VRXTVA-Yd08e2GU6IU21iHRhK6JX8fYX' /><br>
   메모창에 업로드한 파일 프린트 
   <img width="60%" src='http://drive.google.com/uc?export=view&id=1gjb0NUtwgxMfVrEEGQz5RY8qM8PyzCzz' /><br>
   설명 
   1. 메모 버튼 : 말 그대로 메모 할 수 있는 기능 홈에서만 사용가능, 한 번 더 클릭학면 끌 수 있음
   2. 입력 및 다운 기능 : 메모칸에 입력을 하면 텍스트 파일로 다운 받을 수 있음
   3. 출력 및 업로드 기능 : 내가 쓴 텍스트 파일을 업로드 시켜서 메모 창에 출력 시킬 수 있음
   4. 주의사항 : 메모 버튼을 클릭하면 그 전에 썼던 정보가 남아있지 않음(사용했으면 다운 받길 권고)
   ## 5.과대 홈페이지 버튼 :
   <img width="60%" src='http://drive.google.com/uc?export=view&id=1DfVeokOnYRFvDL8_ny3gPePtatpTxx--' /><br>
   설명 
   1. 과대 버튼 : 클릭하면 과대 박스가 뜨면서 그 버튼을 누르면 각 과대 홈페이지로 갈 수 있음, 한 번 더 클릭하면 끌 수 있음
   
  
