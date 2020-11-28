/**
 * 페이지 이름: 홈
 * 페이지 주소: https://klas.kw.ac.kr/std/cmn/frame/Frame.do
 */
export default () => {

    Date.prototype.format = function(f) {

        if (!this.valueOf()) return " ";
        var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
        var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var d = this;
        return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function($1) {
            switch ($1) {
                case "yyyy":
                    return d.getFullYear(); // 년 (4자리)
                case "yy":
                    return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
                case "MM":
                    return (d.getMonth() + 1).zf(2); // 월 (2자리)
                case "dd":
                    return d.getDate().zf(2); // 일 (2자리)
                case "KS":
                    return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
                case "KL":
                    return weekKorName[d.getDay()]; // 요일 (긴 한글)
                case "ES":
                    return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
                case "EL":
                    return weekEngName[d.getDay()]; // 요일 (긴 영어)
                case "HH":
                    return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
                case "hh":
                    return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
                case "mm":
                    return d.getMinutes().zf(2); // 분 (2자리)
                case "ss":
                    return d.getSeconds().zf(2); // 초 (2자리)
                case "a/p":
                    return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
                default:
                    return $1;
            }
        });
    };
    String.prototype.string = function(len) {
        var s = '',
            i = 0;
        while (i++ < len) {
            s += this;
        }
        return s;
    };
    String.prototype.zf = function(len) {
        return "0".string(len - this.length) + this;
    };
    Number.prototype.zf = function(len) {
        return this.toString().zf(len);
    };


    // 기말 평가 안내문 표시
    (async () => {
        const settings = {
            nowYear: 2020,
            nowSemester: 1,
            startDate: '2020-06-15',
            endDate: '2020-06-26',
            noticeURL: 'https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=33096'
        };

        if (!settings.startDate || !settings.endDate) {
            return;
        }

        const startDate = new Date(settings.startDate + ' 00:00:00');
        const endDate = new Date(settings.endDate + ' 23:59:59');
        const nowDate = new Date();

        if (nowDate < startDate || nowDate > endDate) {
            return;
        }

        const postDatas = {
            thisYear: settings.nowYear,
            hakgi: settings.nowSemester,
            termYn: 'Y'
        };

        await axios.post('/std/cps/inqire/LctreEvlTermCheck.do').then(response => {
            postDatas['judgeChasu'] = response.data.judgeChasu;
        });
        await axios.post('/std/cps/inqire/LctreEvlGetHakjuk.do').then(response => {
            postDatas['info'] = response.data;
        });

        let totalCount = 0;
        let remainingCount = 0;

        await axios.post('/std/cps/inqire/LctreEvlsugangList.do', postDatas).then(response => {
            totalCount = response.data.length;
            remainingCount = response.data.filter(v => v.judgeChasu === 'N').length;
        });

        if (remainingCount === 0) {
            return;
        }

        // 렌더링
        $('.subjectbox').prepend(`
      <div class="card card-body mb-4">
        <div class="bodtitle">
          <p class="title-text">수업 평가 안내</p>
        </div>
        <div>
          <div>
            <div><strong>${settings.startDate}</strong>부터 <strong>${settings.endDate}</strong>까지 기말 수업 평가를 실시합니다.</div>
            <div style="color: red">수업 평가를 하지 않으면 성적 공개 기간에 해당 과목의 성적을 확인할 수 없으니 잊지 말고 반드시 평가해 주세요.</div>
            <div><strong>${totalCount}개</strong> 중 <strong>${remainingCount}개</strong>의 수업 평가가 남았습니다.</div>
          </div>
          <div style="margin-top: 20px">
            <button type="button" class="btn2 btn-learn" onclick="linkUrl('/std/cps/inqire/LctreEvlStdPage.do')">수업 평가</button>
            <a href="${settings.noticeURL}" target="_blank"><button type="button" class="btn2 btn-gray">공지사항 확인</button></a>
          </div>
        </div>
      </div>
    `);
    })();

    // 수강 과목 현황의 마감 정보 표시
    (() => {
        // 뼈대 코드 렌더링
        $('.subjectbox').prepend(`
      <div class="card card-body mb-4">
        <div class="bodtitle">
          <p class="title-text" style="color:blue">수강 과목 현황</p>
        </div>
        <table id="yes-deadline" style="width: 100%">
          <colgroup>
            <col width="16%">
            <col width="22%">
            <col width="22%">
            <col width="22%">
          </colgroup>
          <thead>
            <tr style="border-bottom: 1px solid #dce3eb; font-weight: bold; height: 40px">
              <td></td>
              <td>온라인 강의</td>
              <td>과제</td>
              <td>팀 프로젝트</td>
              <td>퀴즈</td>
              <td></td>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div id="no-deadline" style="display: none; text-align: center">
          <span style="color: green; font-weight: bold">남아있는 항목이 없습니다. 깔끔하네요! 😊</span>
        </div>
      </div>
    `);

        // 변경된 과목에 따라 마감 정보 업데이트
        const updateDeadline = async (subjects) => {
            const promises = [];
            const deadline = {};
            let isExistDeadline = false;


            // 현재 수강 중인 과목 얻기
            for (const subject of subjects) {
                deadline[subject.subj] = {
                    subjectName: subject.subjNm,
                    subjectCode: subject.subj,
                    yearSemester: subject.yearhakgi,
                    lecture: {
                        remainingTime: Infinity,
                        remainingCount: 0,
                        totalCount: 0
                    },
                    homework: {
                        remainingTime: Infinity,
                        remainingCount: 0,
                        totalCount: 0
                    },
                    teamProject: {
                        remainingTime: Infinity,
                        remainingCount: 0,
                        totalCount: 0
                    },
                    quiz: {
                        remainingTime: Infinity,
                        remainingCount: 0,
                        totalCount: 0
                    }
                };

                // 온라인 강의를 가져올 주소 설정
                promises.push(axios.post('/std/lis/evltn/SelectOnlineCntntsStdList.do', {
                    selectSubj: subject.subj,
                    selectYearhakgi: subject.yearhakgi,
                    selectChangeYn: 'Y'
                }));

                // 과제를 가져올 주소 설정
                promises.push(axios.post('/std/lis/evltn/TaskStdList.do', {
                    selectSubj: subject.subj,
                    selectYearhakgi: subject.yearhakgi,
                    selectChangeYn: 'Y'
                }));

                // 팀 프로젝트를 가져올 주소 설정
                promises.push(axios.post('/std/lis/evltn/PrjctStdList.do', {
                    selectSubj: subject.subj,
                    selectYearhakgi: subject.yearhakgi,
                    selectChangeYn: 'Y'
                }));

                // 퀴즈 프로젝트를 가져올 주소 설정
                promises.push(axios.post('/std/lis/evltn/AnytmQuizStdList.do', {
                    selectSubj: subject.subj,
                    selectYearhakgi: subject.yearhakgi,
                    selectChangeYn: 'Y'
                }));

            }

            // 온라인 강의 파싱 함수
            const parseLecture = (subjectCode, responseData) => {
                const nowDate = new Date();

                for (const lecture of responseData) {
                    if (lecture.evltnSe !== 'lesson' || lecture.prog === 100) {
                        continue;
                    }

                    const endDate = new Date(lecture.endDate + ':59');
                    const hourGap = Math.floor((endDate - nowDate) / 3600000);

                    if (hourGap < 0) {
                        continue;
                    }

                    if (deadline[subjectCode].lecture.remainingTime > hourGap) {
                        deadline[subjectCode].lecture.remainingTime = hourGap;
                        deadline[subjectCode].lecture.remainingCount = 1;
                    } else if (deadline[subjectCode].lecture.remainingTime === hourGap) {
                        deadline[subjectCode].lecture.remainingCount++;
                    }

                    deadline[subjectCode].lecture.totalCount++;
                    isExistDeadline = true;
                }
            };

            /**
             * 과제 파싱 함수
             * @param {String} subjectCode
             * @param {Object} responseData
             * @param {String} homeworkType  HW(Personal Homework), TP(Team Project)
             */
            const parseHomework = (subjectCode, responseData, homeworkType = 'HW') => {
                const nowDate = new Date();

                for (const homework of responseData) {
                    if (homework.submityn === 'Y') {
                        continue;
                    }

                    let endDate = new Date(homework.expiredate);
                    let hourGap = Math.floor((endDate - nowDate) / 3600000);

                    if (hourGap < 0) {
                        if (!homework.reexpiredate) {
                            continue;
                        }

                        // 추가 제출 기한
                        endDate = new Date(homework.reexpiredate);
                        hourGap = Math.floor((endDate - nowDate) / 3600000);

                        if (hourGap < 0) {
                            continue;
                        }
                    }

                    if (homeworkType === 'HW') {
                        if (deadline[subjectCode].homework.remainingTime > hourGap) {
                            deadline[subjectCode].homework.remainingTime = hourGap;
                            deadline[subjectCode].homework.remainingCount = 1;
                        } else if (deadline[subjectCode].homework.remainingTime === hourGap) {
                            deadline[subjectCode].homework.remainingCount++;
                        }

                        deadline[subjectCode].homework.totalCount++;
                    } else if (homeworkType === 'TP') {
                        if (deadline[subjectCode].teamProject.remainingTime > hourGap) {
                            deadline[subjectCode].teamProject.remainingTime = hourGap;
                            deadline[subjectCode].teamProject.remainingCount = 1;
                        } else if (deadline[subjectCode].teamProject.remainingTime === hourGap) {
                            deadline[subjectCode].teamProject.remainingCount++;
                        }

                        deadline[subjectCode].teamProject.totalCount++;
                    }
                    isExistDeadline = true;
                }
            };


            //quiz
            const parseQuiz = (subjectCode, responseData) => {
                const nowDate = new Date();

                for (const quiz of responseData) {
                    if (quiz.issubmit === 'Y') {
                        continue;
                    }



                    const endDate = new Date(quiz.edt + ':59');
                    const hourGap = Math.floor((endDate - nowDate) / 3600000);

                    if (hourGap < 0) {
                        continue;
                    }

                    if (deadline[subjectCode].quiz.remainingTime > hourGap) {
                        deadline[subjectCode].quiz.remainingTime = hourGap;
                        deadline[subjectCode].quiz.remainingCount = 1;
                    } else if (deadline[subjectCode].quiz.remainingTime === hourGap) {
                        deadline[subjectCode].quiz.remainingCount++;
                    }

                    deadline[subjectCode].quiz.totalCount++;
                    isExistDeadline = true;


                }
            };

            // 해당 과목의 마감 정보 얻기
            await axios.all(promises).then(results => {
                for (const response of results) {
                    const subjectCode = JSON.parse(response.config.data).selectSubj;

                    switch (response.config.url) {
                        case '/std/lis/evltn/SelectOnlineCntntsStdList.do':
                            parseLecture(subjectCode, response.data);
                            break;

                        case '/std/lis/evltn/TaskStdList.do':
                            parseHomework(subjectCode, response.data, 'HW');
                            break;

                        case '/std/lis/evltn/PrjctStdList.do':
                            parseHomework(subjectCode, response.data, 'TP');
                            break;

                        case '/std/lis/evltn/AnytmQuizStdList.do':
                            parseQuiz(subjectCode, response.data);
                            break;

                            /* case '/std/lis/sport/QustnrStdList.do':
                                parseCC(subjectCode, response.data);
                                break;*/
                    }
                }
            });

            // 마감이 빠른 순으로 정렬
            const sortedDeadline = Object.values(deadline).sort((left, right) => {
                const minLeft = left.lecture.remainingTime < left.lecture.remainingTime ? left.lecture : left.homework;
                const minRight = right.lecture.remainingTime < right.lecture.remainingTime ? right.lecture : right.homework;

                if (minLeft.remainingTime !== minRight.remainingTime) {
                    return minLeft.remainingTime - minRight.remainingTime;
                }

                if (minLeft.remainingCount !== minRight.remainingCount) {
                    return minRight.remainingCount - minLeft.remainingCount;
                }

                return (right.lecture.remainingCount + right.homework.remainingCount) - (left.lecture.remainingCount + left.homework.remainingCount);
            });

            // 내용 생성 함수
            const createContent = (name, info) => {
                if (info.remainingTime === Infinity) {
                    return `<span style="color: green">남아있는 ${name}가 없습니다!</span>`;
                }

                const remainingDay = Math.floor(info.remainingTime / 24);
                const remainingHour = info.remainingTime % 24;

                if (remainingDay === 0) {
                    if (remainingHour === 0) {
                        return `<span style="color: red; font-weight: bold">${info.totalCount}개의 ${name} 중 ${info.remainingCount}개가 곧 마감입니다. 😱</span>`;
                    } else {
                        return `<span style="color: red; font-weight: bolder">${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>${remainingHour}시간 후</strong> 마감입니다. 😭</span>`;
                    }
                } else if (remainingDay === 1) {
                    return `<span style="color: red">${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>1일 후</strong> 마감입니다. 😥</span>`;
                } else {
                    return `<span>${info.totalCount}개의 ${name} 중 <strong>${info.remainingCount}개</strong>가 <strong>${remainingDay}일 후</strong> 마감입니다.</span>`;
                }
            };

            // HTML 코드 생성
            const trCode = sortedDeadline.reduce((acc, cur) => {
                acc += `
          <tr style="border-bottom: 1px solid #dce3eb; height: 30px">
            <td style="font-weight: bold">
              <span style="cursor: pointer" onclick="appModule.goLctrum('${cur.yearSemester}', '${cur.subjectCode}')">${cur.subjectName}</span>
            </td>
            <td>
              <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/OnlineCntntsStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                ${createContent('강의', cur.lecture)}
              </span>
            </td>
            <td>
              <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/TaskStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                ${createContent('과제', cur.homework)}
              <span>
            </td>
            <td>
              <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/PrjctStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                ${createContent('팀 프로젝트', cur.teamProject)}
              <span>
            </td>
            <td>
              <span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/AnytmQuizStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
                ${createContent('퀴즈', cur.quiz)}
              <span>
            </td>
          </tr>
        `;

                return acc;
            }, '');

            // 렌더링
            if (isExistDeadline) {
                $('#yes-deadline > tbody').html(trCode);
                $('#yes-deadline').css('display', 'table');
                $('#no-deadline').css('display', 'none');
            } else {
                $('#yes-deadline').css('display', 'none');
                $('#no-deadline').css('display', 'block');
            }
        };

        appModule.$watch('atnlcSbjectList', watchValue => {
            updateDeadline(watchValue);
        });

        // 모든 정보를 불러올 때까지 대기
        const waitTimer = setInterval(() => {
            if (appModule && appModule.atnlcSbjectList.length > 0) {
                clearInterval(waitTimer);
                updateDeadline(appModule.atnlcSbjectList);
            }
        }, 100);
    })();

    (async () => {
        $(".col-md-6.toplogo").append(`
        <button type="button" class="btn2 btn-learn btn-board-check" style="display: inline-block; top: 3px; position: float; left: 235px; background-color: #3a051f; border-color: white;height: 38.5px">공지사항 보기</button>
        <button type="button" class="btn2 btn-learn btn-move-major" style="display: inline-block; top: 3px; position: float; left: 340px; background-color: #3a051f; border-color: white;height: 38.5px">과대 홈페이지</button>
       `);
        $(".col-md-6.navtxt").append(`
        <div style="color : red"><버튼 설명>과목별 가장 최근 공지사항 확인</div>
       `);
        var subjectsArr1 = []
        var subjectsArr2 = []
        var subjectsYear = []
        var subjectsCode = []
        var subjectsDate = []
        var subjectsDate1 = []
        var equalDateArr = []
        var date
        var list
        var check = 0
        var clickflag = 0; //click clickclickflag {0:active 1:inactive}
        var clickflag2 = 0;
        var mainURL = "https://klas.kw.ac.kr"


        var arraysClear = () => {
            subjectsArr1 = []
            subjectsArr2 = []
            subjectsYear = []
            subjectsCode = []
            subjectsDate = []
            subjectsDate1 = []
            equalDateArr = []
        }

        var equalDate = (date, dateArr) => {
            var cnt = 0;
            for (var i = 0; i < dateArr.length; i++) {
                if (dateArr[i] === date) {
                    cnt++;
                }
            }
            return cnt;
        }

        var getApi = (path, data, callback) => {
            return axios.post(mainURL + path, data, {
                    withCredentials: true,
                    headers: {
                        'Accept': "application/json"
                    }
                })
                .then(callback).catch((err) => {
                    console.log(err)
                })
        }


        var key_from_notice = async (subjects, callback) => {
            arraysClear();
            for (const subject of subjects) {
                var data = {
                    "selectYearhakgi": subject.yearhakgi,
                    "selectSubj": subject.subj,
                    "selectChangeYn": "Y",
                    "subjNm": subject.subjNm + " (" + subject.hakjungno + ") - " + subject.profNm,
                    "subj": {
                        "value": subject.subj,
                        "label": subject.subjNm + " (" + subject.hakjungno + ") - " + subject.profNm
                    }
                }
                getApi("/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardStdList.do", data, callback).then((res) => {
                    list = res.data.list;
                    var max = 0;
                    for (const a of list) {
                        if (a.boardNo > max) {
                            max = a.boardNo;
                        }
                    }
                    for (const a of list) {

                        subjectsDate1.push(`${a.registDt.substring(0,10)}`); // 1페이지 모든 공지사항 리스트 배열에 저장

                        if (a.boardNo === max) {
                            subjectsArr1.push(`${subject.subjNm}`);
                            subjectsArr2.push(`${a.title}`);
                            subjectsCode.push(`${subject.subj}`);
                            subjectsYear.push(`${subject.yearhakgi}`);
                            subjectsDate.push(`${a.registDt.substring(0,10)}`);
                            date = `${a.registDt.substring(0,10)}`;
                        }
                        //check++; // check for pending
                    }
                    equalDateArr.push(equalDate(date, subjectsDate1));
                    subjectsDate1.splice(0, subjectsDate1.length);
                })
            }

            $('.btn-board-check').unbind('click').click(() => {
                //alert(clickflag); for double checking
                if (clickflag === 0) {
                    $('.subjectbox').prepend(`<div class="card card-body mb-4" id="bb" style="display : block">
                                       <strong style="color : purple">@주의사항@
                                              <div>날짜는 시스템 등록일을 기준으로 하기 때문에 수정이 있다면 게시판 등록 날짜가 달라질 수 있습니다.하지만 업데이트에는 전혀 문제가 없습니다.</div>
                                       </strong>
                                     </div>`);
                    for (var i = 0; i < subjectsArr1.length; i++) {
                        $('#bb').prepend(`
                                <strong style="color : red">${subjectsArr1[i]} 순서:${i+1}</strong>
                                <div></div>
                                <div style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/sport/d052b8f845784c639f036b102fdc3023/BoardListStdPage.do', '${subjectsYear[i]}', '${subjectsCode[i]}')">
                                <strong>${subjectsDate[i]}에</strong><span style="padding-left: 1.5em"><strong>올라온 공지 개수:</strong>${equalDateArr[i]}</span></strong><span style="padding-left: 1.8em"><strong>공지 최상단 : </strong>${subjectsArr2[i]}</span></div>
                                <hr>
                             `);
                    };
                    clickflag = 1;
                } else {
                    clickflag = 0;
                    if (subjectsArr1.length === 0)
                        $('#bb').remove();
                    for (var i = 0; i < subjectsArr1.length; i++) {
                        $('#bb').remove();
                    };
                }
            });
        }

        $('.btn-move-major').click(() => {
            if (clickflag2 === 0) {
                $('.subjectbox').prepend(`<div class="card card-body mb-4" id="cc" style="display : block">
                                   <button type="button" style="border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: 120px; height: 40px"onClick="window.open('https://ei.kw.ac.kr/')">전자정보공과대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('https://sw.kw.ac.kr:501/main/main.php')">소프트웨어융합대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('https://www.kw.ac.kr/ko/univ/engineering_glance.jsp')">공과대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('https://www.kw.ac.kr/ko/univ/science_glance.jsp')">자연과학대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('http://chss.kw.ac.kr/')">인문사회과학대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('https://ei.kw.ac.kr/')">정책법학대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('http://biz.kw.ac.kr/')">경영대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('https://ingenium.kw.ac.kr/')">인제니움학부대학</button>
                          <button type="button" style="display: inline-block;border-width: thin;border-style: solid;border-color: red;background-color: white;color: red;font-weight: 400; width: auto; height: 40px"onClick="window.open('http://conea.kw.ac.kr/')">동북아대학</button>
                                </div>`);
                clickflag2 = 1;
            } else {
                $('#cc').remove();
                clickflag2 = 0;
            }
            $('.btn-move-major').toggleClass('btn-green');
        });

        appModule.$watch('atnlcSbjectList', watchValue => {
            key_from_notice(watchValue);
        });

        const waitTimer = setInterval(() => {
            if (appModule && appModule.atnlcSbjectList.length > 0) {
                clearInterval(waitTimer);
                key_from_notice(appModule.atnlcSbjectList);
            }
        }, 100);

    })();

    (async () => {
        $(".col-md-6.toplogo").append(`<button type="button" class="btn2 btn-learn btn-schdule" style="display: inline-block; top: 3px; position: float; left: 340px; background-color: #3a051f; border-color: white;height: 38.5px">학사일정</button>`);
        var mainURL = "https://klas.kw.ac.kr"
        var _year = new Date()
        var _month = new Date()
        var date = new Date()
        var itineraryList = []
        var flag = 1;
        var getApi = (path, data, callback) => {
            return axios.post(mainURL + path, data, {
                    withCredentials: true,
                    headers: {
                        'Accept': "application/json"
                    }
                })
                .then(callback).catch((err) => {
                    console.log(err)
                })
        }

        var key_from_Schdule = async (obj, callback) => {
            var data = {
                "schdulYear": obj.year,
                "schdulMonth": obj.month
            }
            getApi("/std/cmn/frame/SchdulStdList.do", data, callback)
        }

        $('.btn-schdule').unbind('click').click(() => {
            if (flag === 1) {
                $('.subjectbox').prepend(`<div class="card card-body mb-4" id="ss" style="display : block">
                                             <h4 style="display : inline-block">${date.format('yyyy-MM-dd')}</h4>
                                             <h4 style="display : inline-block; cursor : pointer" onClick="window.open('https://www.kw.ac.kr/ko/life/bachelor_calendar.jsp')">[학사일정]</h4>
                                      </div>`)
                key_from_Schdule({
                    year: _year.format('yyyy'),
                    month: _month.format('MM')
                }, (res) => {
                    res.data.list.filter(v => {
                        if (v.typeNm === '학사일정') return itineraryList.push(v);
                    })
                    //alert(itineraryList.length);
                    itineraryList.reverse();
                    for (const thing of itineraryList) {
                        $('#ss').append(`<div><strong style="color : red">${thing.schdulDt}</strong><strong> ${thing.schdulTitle}</strong></div>`)
                    }
                    flag = 0;
                })
            } else if (flag === 0) {
                $('#ss').remove();
                flag = 1;
                itineraryList = [];
            }
        })
    })();

    (async () => {
        var flag = 0;
        $('.col-md-6.toplogo').append(`<button type="button" class="btn2 btn-learn btn-note" style="display: inline-block; top: 3px; position: float; left: 235px; background-color: #3a051f; border-color: white;height: 38.5px">메모</button>`);
        $('.btn-note').unbind('click').click(() => {
            if (flag === 0) {
                $('.subjectbox').prepend(`<div id="kk">
<html>
<body>
<table style="border-width: thin;border-style: solid;background-color: white; border-color: #D1D0CE;">
   <tr><td><span style="color: red;">텍스트 입력(주의사항 : 확장자가 .txt이어야함)</span></td></tr>
   <tr>
      <td colspan="3">
         <textarea id="inputTextToSave" style="font-size: 15px;background-color: #FFF8DC;border-color: #D1D0CE;width:512px;height:256px;""></textarea>
      </td>
   </tr>
   <tr>
      <td><span style="color: #848482;">파일 이름</span></td>
      <td><input id="inputFileNameToSaveAs" placeholder=".txt(확장자명) 제외" style="position: relative; right: 15px; border-color: #D1D0CE; color: #F75D59;width: 100%;"></input></td>
      <td><button onclick="saveTextAsFile()" style="display: inline-block;border-width: thin;border-style: solid;background-color: white; border-color: #848482;color: #848482;font-weight: 100; font-size: 15px; width: auto; height: 30px">텍스트 파일 저장하기</button></td>
   </tr>
   <tr>
      <td><span style="color: #848482;">불러올 파일</span></td>
      <td><input type="file" id="fileToLoad"></td>
      <td><button onclick="loadFileAsText()" style="display: inline-block;border-width: thin;border-style: solid;background-color: white; border-color: #848482;color: #848482;font-weight: 100; font-size: 15px; width: auto; height: 30px">텍스트 파일 불러오기</button><td>
   </tr>
</table>
<script type='text/javascript'>
function saveTextAsFile()
{
   var textToWrite = document.getElementById("inputTextToSave").value;
   var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
   var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;
   var downloadLink = document.createElement("a");
   downloadLink.download = fileNameToSaveAs;
   downloadLink.innerHTML = "Download File";
   if (window.webkitURL != null)
   {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
   }
   else
   {
      // Firefox requires the link to be added to the DOM
      // before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
   }
   downloadLink.click();
}
function destroyClickedElement(event)
{
   document.body.removeChild(event.target);
}
function loadFileAsText()
{
   var fileToLoad = document.getElementById("fileToLoad").files[0];
   var fileReader = new FileReader();
   fileReader.onload = function(fileLoadedEvent)
   {
      var textFromFileLoaded = fileLoadedEvent.target.result;
      document.getElementById("inputTextToSave").value = textFromFileLoaded;
   };
   fileReader.readAsText(fileToLoad, "UTF-8");
}
</script>
</body>
</html></div>`)
            flag = 1;
            } else if (flag === 1) {
                $('#kk').remove();
                flag = 0;
            }
        })
    })();
};
