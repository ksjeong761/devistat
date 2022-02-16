import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Chart from 'chart.js/auto'; 
import {Line, Bar, Radar, Doughnut, PolarArea, Bubble, Pie, Scatter} from 'react-chartjs-2';
import moment from 'moment';

const PERCENT_MIN = 0;
const PERCENT_MAX = 100;
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const refreshDelay = 5 * 1000; //밀리초

const TIME_STORE_MIN = 60;             //메모리에 저장할 최소 시간 : 1분
const TIME_STORE_MAX = 24 * 60 * 60;   //메모리에 저장할 최대 시간 : 1시간
const TIME_SHOW = 10 * 60;             //화면에 표시할 시간 : 10분

let lastUpdated = moment(0);
const timeArray = Array.from({length: TIME_SHOW}, (unUsedValueForIndex, index) => index);

export default function App() {
  const [chartData, setChartData] = useState(makeChartData([],[]));
  const [cpuUsageArray, setCpuUsageArray] = useState([]);

  //interval 등록과 삭제 반복으로 일정 시간 간격마다 동작
  useEffect(() => {
    const interval = setInterval(() => {
      //데이터를 읽어올 시간 간격 정의
      //최근 업데이트가 지정한 시간 이내에 발생했다면
      //최근 업데이트 시간을 기준으로 데이터를 가져온다.
      const endTime = moment().local();
      const startTime = (lastUpdated > endTime.clone().subtract(TIME_SHOW, 'seconds'))
                       ? lastUpdated : endTime.clone().subtract(TIME_SHOW, 'seconds');
      lastUpdated = endTime;
      
      const timeLength = Math.round(moment.duration(endTime.diff(startTime)).asSeconds());
      let newArray = Array.from({length: timeLength}, () => null);

      // console.log('interval' + '\n'
      // + ' start : ' + startTime.format(DATE_FORMAT) + '\n'
      // + ' end   : ' + endTime.format(DATE_FORMAT));
      // console.log(timeLength);

      //API 요청 준비
      const url = 'http://localhost:8080';
      const path = '/devices/statuses';
      const axiosConfig = {
        params: {
          start: startTime.unix(),
          end : endTime.unix()
        }
      };

      //API 요청 및 콜백 등록
      axios.get(url + path, axiosConfig)
      .then((response) => {
        const responseLength = Object.keys(response.data).length;

        //결과가 없으면 
        if(responseLength == 0){
          //시간 차이만큼 빈 배열 붙이고 리턴
          setCpuUsageArray((beforeCpuUsageArray) => { return [...newArray, ...beforeCpuUsageArray].slice(0, TIME_STORE_MAX) });
          return;
        }

        //결과가 있으면 JSON 처리
        for(let i=0; i<responseLength; i++){
          const time = moment(response.data[i]['loggedTime'], DATE_FORMAT);
          const insertIndex =  Math.floor(moment.duration(endTime.diff(time)).asSeconds());

          newArray[insertIndex] = JSON.stringify(response.data[i]['cpu']['timePercentIdle']);

          // console.log('기록된 시간   : ' + time.format(DATE_FORMAT) + '\n'
          //           + 'API 호출 시간 : ' + endTime.format(DATE_FORMAT));
          // console.log('시간차 : ' + gapSecond + '\n' 
          //           + '인덱스 : ' + insertIndex);
        }
  
        //최대 시간을 넘어간 데이터는 메모리에 저장하지 않는다.
        setCpuUsageArray((beforeCpuUsageArray) => { return [...newArray, ...beforeCpuUsageArray].slice(0, TIME_STORE_MAX) });
      });
    }, refreshDelay);
    return () => clearInterval(interval);
  }, []);
  
  //cpu 사용량 배열을 감시하고 변화가 있다면
  //차트 데이터 전체를 최신화
  useEffect(() => {
    console.log('detected');
    setChartData((beforeChartData) => { 
      return makeChartData(timeArray, cpuUsageArray);
    });
  }, [cpuUsageArray]);

  return (
    <div>
      <p>lastUpdated : </p>
      <Bar 
        data={chartData.data}
        options={chartData.options}
      />
      <Line 
        data={chartData.data}
        options={chartData.options}
      />
    </div>
  );
}

function makeChartData(labels=[], data=[]){
  return {
    data : {
      labels: labels,
      datasets: [
        {
          label: '',
          fill: false,
          lineTension: 0.3,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: 'rgba(0,0,0,1)',
          borderWidth: 2,
          data: data
        }
      ]
    },
    options : {
      responsive: true,
      spanGaps: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: ''
        }
      },
      scales: {
        y: {
          min: PERCENT_MIN,
          max: PERCENT_MAX,
        }
      }
    }
  };
}