// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      1.3.2
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-end
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @updateURL    https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js
// @downloadURL  https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
	'use strict';

	// 태그에 삽입되는 함수 목록
	// 다른 확장 프로그램을 지원하기 위해 태그 삽입이 필요
	let externalPathFunctions = {
		// 강의 계획서 조회 - 학부
		'/std/cps/atnlc/LectrePlanStdPage.do': () => {
			let waitSearch = false;

			// 인증 코드 개선 및 메시지 제거
			appModule.getSearch = function () {
				this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

				// 서버 부하를 방지하기 위해 모든 강의 계획서 검색 방지
				if (this.selectRadio === 'all' && this.selectText === '' && this.selectProfsr === '' && this.cmmnGamok === '' && this.selecthakgwa === '') {
					alert('과목명 또는 담당 교수를 입력하지 않은 경우 반드시 과목이나 학과를 선택하셔야 합니다.');
					return false;
				}

				// 서버 부하를 방지하기 위해 2초간 검색 방지
				if (waitSearch) {
					alert('서버 부하 문제를 방지하기 위해 2초 뒤에 검색이 가능합니다.');
					return false;
				}

				// 2초 타이머
				waitSearch = true;
				setTimeout(() => { waitSearch = false; }, 2000);

				axios.post('LectrePlanStdList.do', this.$data).then(function (response) {
					this.list = response.data;
				}.bind(this));
			};

			// 강의 계획서 새 창으로 열기
			appModule.goLectrePlan = function (item) {
				if (item.closeOpt === 'Y') { alert('폐강된 강의입니다.'); return false; }
				if (item.summary === null) { alert('강의 계획서 정보가 없습니다.'); return false; }

				axios.post('CultureOptOneInfo.do', this.$data).then(function (response) {
					openLinkNewWindow(
						response.data.cultureOpt === null ? 'popup/LectrePlanStdView.do' : 'popup/LectrePlanStdFixedView.do',
						{
							selectSubj: 'U' + item.thisYear + item.hakgi + item.openGwamokNo + item.openMajorCode + item.bunbanNo + item.openGrade,
							selectYear: item.thisYear,
							selecthakgi: item.hakgi
						},
						{
							width: 1000,
							height: 800,
							scrollbars: 'yes',
							title: '강의 계획서 조회'
						}
					);
				}.bind(this));
			};

			// 안내 문구 렌더링
			document.querySelector('table:nth-of-type(1) tr:nth-of-type(5) td').innerText = '인증 코드를 입력하실 필요가 없습니다.';
		},
		// 강의 계획서 조회 - 대학원
		'/std/cps/atnlc/LectrePlanGdhlStdPage.do': () => {
			// 인증 코드 개선 및 메시지 제거
			appModule.getSearch = function () {
				if (!this.selectGdhlitem) {
					alert('대학원을 선택해 주세요.');
					return;
				}

				axios.post('LectrePlanDaList.do', this.$data).then(function (response) {
					this.GdhlList = response.data;
				}.bind(this));
			};

			// 안내 문구 렌더링
			document.querySelector('table:nth-of-type(1) tr:nth-of-type(4) td').innerText = '인증 코드를 입력하실 필요가 없습니다.';
		},
		// 수강 및 성적 조회
		'/std/cps/inqire/AtnlcScreStdPage.do': () => {
			class GPACalculator {
				constructor() {
					this._gradePointChanger = {
						'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'NP': 0
					};

					// 취득 학점
					this._earnedCredit = 0;

					// 평점을 계산하기 위한 변수 (F 포함)
					this._sumScoreF = 0;
					this._sumCreditF = 0;

					// 평점을 계산하기 위한 변수 (F 미포함)
					this._sumScore = 0;
					this._sumCredit = 0;
				}

				updateGPA(credit, gradePoint) {
					// P, R, 그 외 알 수 없는 학점의 경우
					if (!(gradePoint in this._gradePointChanger)) {
						if (gradePoint === 'P') this._earnedCredit += credit;
						return;
					}

					// F 미포함 계산
					if (gradePoint !== 'F' || gradePoint !== 'NP') {
						this._earnedCredit += credit;
						this._sumScore += credit * this._gradePointChanger[gradePoint];
						this._sumCredit += credit;
					}

					// F 포함 계산
					this._sumScoreF += credit * this._gradePointChanger[gradePoint];
					this._sumCreditF += credit;
				}

				getGPA() {
					let result = {
						earnedCredit: this._earnedCredit,
						includeF: this._sumCreditF === 0 ? '-' : floorFixed(this._sumScoreF / this._sumCreditF),
						notIncludeF: this._sumCredit === 0 ? '-' : floorFixed(this._sumScore / this._sumCredit)
					};

					return result;
				}
			}

			// 평점 계산
			appModule.$watch('sungjuk', function (newVal, oldVal) {
				let htmlCode = '';
				let trCode = '';

				for (let i = newVal.length - 1; i >= 0; i--) {
					let scoreInfo = newVal[i];
					let year = scoreInfo.thisYear;
					let semester = scoreInfo.hakgi;

					// 계절 학기의 경우 계산에서 제외
					if (semester > 2) {
						continue;
					}

					// 상황별 점수 정보
					let GPA = new GPACalculator();
					let majorGPA = new GPACalculator();
					let notMajorGPA = new GPACalculator();

					for (let subjectInfo of scoreInfo.sungjukList) {
						let codeName = subjectInfo.codeName1.trim();
						let credit = parseInt(subjectInfo.hakjumNum);
						let gradePoint = subjectInfo.getGrade.trim();

						// 전공 평점 계산
						if (codeName[0] === '전') {
							majorGPA.updateGPA(credit, gradePoint);
						}
						// 전공 외 평점 계산
						else {
							notMajorGPA.updateGPA(credit, gradePoint);
						}

						// 평균 평점 계산
						GPA.updateGPA(credit, gradePoint);
					}

					// 계산 결과 반영
					GPA = GPA.getGPA();
					majorGPA = majorGPA.getGPA();
					notMajorGPA = notMajorGPA.getGPA();

					trCode += `
						<tr>
							<td>${year}학년도 ${semester}학기</td>
							<td>${GPA.earnedCredit}</td>
							<td>${majorGPA.includeF}</td>
							<td>${majorGPA.notIncludeF}</td>
							<td>${notMajorGPA.includeF}</td>
							<td>${notMajorGPA.notIncludeF}</td>
							<td>${GPA.includeF}</td>
							<td>${GPA.notIncludeF}</td>
						</tr>
					`;
				}

				htmlCode += `
					<table class="tablegw">
						<colgroup>
							<col width="25%">
							<col width="15%">
							<col width="10%">
							<col width="10%">
							<col width="10%">
							<col width="10%">
							<col width="10%">
							<col width="10%">
						</colgroup>
						<thead>
							<tr>
								<th rowspan="2">학기</th>
								<th rowspan="2">취득 학점</th>
								<th colspan="2">전공 평점</th>
								<th colspan="2">전공 외 평점</th>
								<th colspan="2">평균 평점</th>
							</tr>
							<tr>
								<th>F 포함</th>
								<th>미포함</th>
								<th>F 포함</th>
								<th>미포함</th>
								<th>F 포함</th>
								<th>미포함</th>
							</tr>
						</thead>
						<tbody>
							${trCode}
						</tbody>
					</table>
				`;

				// 평점 정보 렌더링
				let tableList = document.querySelectorAll('#hakbu > table');
				let divElement = createTag('div', `<br>${htmlCode}<br>`);

				for (let i = 0; i < tableList.length; i++) {
					if (parseInt(tableList[i].getAttribute('width')) === 100) {
						tableList[i].before(divElement);
						break;
					}
				}
			});
		},
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// 온라인 강의 고유 번호 파싱
			appModule.$watch('list', function (newVal, oldVal) {
				let videoCodes = [];
				
				for (let i = 0; i < newVal.length; i++) {
					let videoInfo = newVal[i];

					if (!videoInfo.hasOwnProperty('starting')) {
						continue;
					}

					let videoCode = videoInfo.starting.split('/');
					videoCode = videoCode[videoCode.length - 1];
					
					videoCodes.push({
						index: i,
						videoCode: videoCode
					});
				}
 
				// table 태그에 고유 번호 저장
				document.querySelector('#prjctList').setAttribute('data-video-codes', JSON.stringify(videoCodes));
			});
		}
	};

	// 태그에 삽입되지 않는 함수 목록
	// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요
	let internalPathFunctions = {
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// MutationObserver 삽입
			let observer = new MutationObserver(function (mutationList, observer) {
				// table 태그에 저장한 고유 번호 파싱
				let videoCodes = JSON.parse(mutationList[0].target.dataset.videoCodes);

				// 이미 생성된 다운로드 버튼 제거
				document.querySelectorAll('.btn-download').forEach(function (item) {
					item.style.display = 'none';
				});

				// 동영상 XML 정보 획득
				for (let videoInfo of videoCodes) {
					GM.xmlHttpRequest({
						method: 'GET',
						url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoInfo.videoCode,
						onload: function (response) {
							let videoName = response.responseXML.getElementsByTagName('main_media')[0].innerHTML;
							let videoURL = response.responseXML.getElementsByTagName('media_uri')[0].innerHTML.replace('[MEDIA_FILE]', videoName);

							// 다운로드 버튼 렌더링
							let tdList = document.querySelectorAll(`#prjctList > tbody > tr:nth-of-type(${videoInfo.index + 1}) > td`);
							let tdElement = tdList[tdList.length - 1];
							tdElement = tdElement.className === '' ? tdElement : tdList[tdList.length - 2];

							tdElement.appendChild(createTag('div', `
								<a href="${videoURL}" target="_blank" style="display: block; margin-top: 10px">
									<button type="button" class="btn2 btn-gray btn-download">동영상 받기</button>
								</a>
							`));
						}
					});
				}
			});

			// MutationObserver 감지 시작
			observer.observe(document.querySelector('#prjctList'), { attributes: true });
		}
	};

	// 기본 함수 삽입
	document.head.appendChild(createTag('script',
		createTag.toString() +
		floorFixed.toString() +
		openLinkNewWindow.toString()
	));

	// externalPathFunctions 함수 삽입
	for (let path in externalPathFunctions) {
		if (path === location.pathname) {
			document.head.appendChild(createTag('script', `(${externalPathFunctions[path].toString()})();`));
		}
	}

	// internalPathFunctions 함수 실행
	for (let path in internalPathFunctions) {
		if (path === location.pathname) {
			internalPathFunctions[path]();
		}
	}
})();

// 태그 생성
function createTag(tagName, htmlCode) {
	let tagElement = document.createElement(tagName);
	tagElement.innerHTML = htmlCode;
	return tagElement;
}

// 소수점 버림 함수
function floorFixed(number, decimalPlace = 2) {
	let pow10 = 10 ** decimalPlace;
	return (Math.floor(number * pow10) / pow10).toFixed(decimalPlace);
}

// 새 창으로 열기
function openLinkNewWindow(url, getDatas = null, specs = null) {
	let completeURL = url;
	let completeSpecs = '';

	if (getDatas !== null) {
		completeURL += '?';
		for (let name in getDatas) completeURL += `${name}=${getDatas[name]}&`;
		completeURL = completeURL.substring(0, completeURL.length - 1);
	}

	if (specs !== null) {
		for (let name in specs) completeSpecs += `${name}=${specs[name]},`;
		completeSpecs = completeSpecs.substring(0, completeSpecs.length - 1);
	}

	window.open(completeURL, '', completeSpecs);
}